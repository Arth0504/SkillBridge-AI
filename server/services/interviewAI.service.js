import mongoose from 'mongoose';
import { InterviewSession } from '../models/interviewSession.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Job } from '../models/job.model.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const SHARED_SECRET = process.env.AI_SHARED_SECRET || 'skillbridge_secret_ai_key_2026';
const TIMEOUT_MS = 15000;

const postToAIService = async (endpoint, data, retries = 2) => {
  const url = `${AI_SERVICE_URL}${endpoint}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-SECRET-KEY': SHARED_SECRET,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      logger.warn(`AI Interview request failed on attempt ${attempt}: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
};

const ALLOWED_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const ALLOWED_EXPERIENCE_LEVELS = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Architect', 'Executive'];

/**
 * Migration & Sanitizer Helper:
 * Separates difficulty (Easy, Medium, Hard) and experienceLevel (Entry, Junior, Mid, Senior, Lead, Architect, Executive)
 */
export const sanitizeInterviewConfig = (inputDifficulty, inputExperienceLevel) => {
  let difficulty = 'Medium';
  let experienceLevel = 'Senior';

  if (inputDifficulty) {
    const diffStr = inputDifficulty.toString().trim();
    if (ALLOWED_DIFFICULTIES.includes(diffStr)) {
      difficulty = diffStr;
    } else {
      const lower = diffStr.toLowerCase();
      if (lower.includes('architect')) {
        experienceLevel = 'Architect';
        difficulty = 'Hard';
      } else if (lower.includes('executive')) {
        experienceLevel = 'Executive';
        difficulty = 'Hard';
      } else if (lower.includes('lead')) {
        experienceLevel = 'Lead';
        difficulty = 'Hard';
      } else if (lower.includes('senior')) {
        experienceLevel = 'Senior';
        difficulty = 'Hard';
      } else if (lower.includes('junior') || lower.includes('entry')) {
        experienceLevel = lower.includes('entry') ? 'Entry' : 'Junior';
        difficulty = 'Easy';
      } else if (lower.includes('mid')) {
        experienceLevel = 'Mid';
        difficulty = 'Medium';
      }
    }
  }

  if (inputExperienceLevel) {
    const expStr = inputExperienceLevel.toString().trim();
    const match = ALLOWED_EXPERIENCE_LEVELS.find((l) => l.toLowerCase() === expStr.toLowerCase());
    if (match) experienceLevel = match;
  }

  return { difficulty, experienceLevel };
};

/**
 * 1. Start AI Mock Interview Session
 */
export const startInterviewSessionService = async ({
  candidateIdStr,
  jobIdStr = null,
  interviewType = 'Mixed',
  difficulty = 'Medium',
  experienceLevel = 'Senior',
  totalQuestions = 5,
}) => {
  const { difficulty: validDifficulty, experienceLevel: validExperienceLevel } = sanitizeInterviewConfig(
    difficulty,
    experienceLevel
  );

  if (!candidateIdStr || !mongoose.Types.ObjectId.isValid(candidateIdStr)) {
    throw new AppError('Invalid or missing candidate ID.', 400);
  }

  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const candidate = await Candidate.findById(candidateId).lean();
  if (!candidate) throw new AppError('Candidate profile not found.', 404);

  let jobId = null;
  let jobDescription = '';
  if (jobIdStr && mongoose.Types.ObjectId.isValid(jobIdStr)) {
    jobId = new mongoose.Types.ObjectId(jobIdStr);
    const job = await Job.findById(jobId).lean();
    if (job) {
      jobDescription = `${job.title} - ${job.description} Skills: ${job.requiredSkills.join(', ')}`;
    }
  }

  // Fetch initial question from FastAPI
  let initialQuestion = null;
  try {
    const aiRes = await postToAIService('/api/v1/ai/interview/start', {
      interviewType,
      difficulty: validDifficulty,
      experienceLevel: validExperienceLevel,
      candidateSkills: candidate.skills || [],
      jobDescription,
    });
    if (aiRes && aiRes.initialQuestion) {
      initialQuestion = aiRes.initialQuestion;
    }
  } catch (err) {
    logger.info(`FastAPI AI service offline (${err.message}). Using local fallback initial question.`);
  }

  if (!initialQuestion) {
    initialQuestion = {
      questionText: `Welcome ${candidate.fullName || 'Candidate'}. To start our ${interviewType} mock interview (${validExperienceLevel} level), could you walk me through your technical background and most impactful project?`,
      category: 'Technical',
      difficulty: validDifficulty,
      expectedKeyPoints: ['Technical background overview', 'Key technologies used', 'Measurable project impact'],
      interviewerContext: 'Assess communication confidence and technical scope.',
    };
  }

  const qDiff = sanitizeInterviewConfig(initialQuestion.difficulty, null).difficulty;

  const firstQ = {
    questionId: new mongoose.Types.ObjectId().toString(),
    questionText: initialQuestion.questionText,
    category: initialQuestion.category || 'Technical',
    difficulty: qDiff,
    expectedKeyPoints: initialQuestion.expectedKeyPoints || [],
  };

  const session = await InterviewSession.create({
    candidateId,
    jobId,
    interviewType,
    difficulty: validDifficulty,
    experienceLevel: validExperienceLevel,
    status: 'In Progress',
    totalQuestions: totalQuestions || 5,
    currentQuestionIndex: 0,
    questions: [firstQ],
    startedAt: new Date(),
  });

  return session;
};

/**
 * 2. Submit Candidate Answer & Generate Next Adaptive Question
 */
export const submitAnswerService = async ({ sessionId, candidateIdStr, answerText }) => {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    candidateId: candidateIdStr,
    status: 'In Progress',
    isDeleted: { $ne: true },
  });

  if (!session) {
    throw new AppError('Active interview session not found or already completed.', 404);
  }

  const currentQIndex = session.currentQuestionIndex;
  const currentQ = session.questions[currentQIndex];

  if (!currentQ) {
    throw new AppError('Question state error.', 400);
  }

  // 1. Evaluate Candidate Answer via FastAPI AI
  let evaluation = null;
  try {
    evaluation = await postToAIService('/api/v1/ai/interview/answer', {
      questionText: currentQ.questionText,
      candidateAnswer: answerText,
      expectedKeyPoints: currentQ.expectedKeyPoints || [],
    });
  } catch (err) {
    logger.info(`FastAPI AI service offline (${err.message}). Using local fallback answer evaluator.`);
  }

  if (!evaluation) {
    const wordCount = answerText.split(/\s+/).filter(Boolean).length;
    const score = Math.min(95, Math.max(50, Math.round((wordCount / 30) * 80)));
    evaluation = {
      technicalAccuracy: score,
      communication: 85,
      confidence: 85,
      grammar: 90,
      completeness: score,
      professionalism: 90,
      averageScore: score,
      feedbackText: 'Good clear answer covering key points.',
      followUpRequired: false,
      suggestedDifficultyAdjustment: score >= 80 ? 'Harder' : (score < 50 ? 'Easier' : 'Maintain'),
    };
  }

  // Save current question answer & evaluation
  currentQ.answerText = answerText;
  currentQ.answeredAt = new Date();
  currentQ.evaluation = evaluation;

  // 2. Determine Next Question or Completion
  const nextQIndex = currentQIndex + 1;
  let isInterviewComplete = false;

  if (nextQIndex < session.totalQuestions) {
    // Adapt difficulty based on previous score
    let nextDifficulty = session.difficulty;
    const prevScore = evaluation.averageScore || 75;
    if (prevScore >= 80 && session.difficulty === 'Easy') nextDifficulty = 'Medium';
    else if (prevScore >= 80 && session.difficulty === 'Medium') nextDifficulty = 'Hard';
    else if (prevScore < 50 && session.difficulty === 'Hard') nextDifficulty = 'Medium';
    else if (prevScore < 50 && session.difficulty === 'Medium') nextDifficulty = 'Easy';

    let nextQ = null;
    try {
      nextQ = await postToAIService('/api/v1/ai/interview/question', {
        interviewType: session.interviewType,
        difficulty: nextDifficulty,
        experienceLevel: session.experienceLevel || 'Senior',
        candidateSkills: [],
        previousQuestions: session.questions.map((q) => ({
          questionText: q.questionText,
          score: q.evaluation?.averageScore || 75,
        })),
        previousScore: prevScore,
      });
    } catch (err) {
      logger.info(`FastAPI AI question generator offline (${err.message}).`);
    }

    if (!nextQ) {
      nextQ = {
        questionText: `Follow-up (${nextDifficulty}): How would you optimize the performance and handle error cases in the solution you described?`,
        category: 'Technical',
        difficulty: nextDifficulty,
        expectedKeyPoints: ['Error handling', 'Performance optimization', 'Monitoring'],
      };
    }

    const nextQDiff = sanitizeInterviewConfig(nextQ.difficulty, null).difficulty;

    const newQuestionObj = {
      questionId: new mongoose.Types.ObjectId().toString(),
      questionText: nextQ.questionText,
      category: nextQ.category || 'Technical',
      difficulty: nextQDiff,
      expectedKeyPoints: nextQ.expectedKeyPoints || [],
    };

    session.questions.push(newQuestionObj);
    session.currentQuestionIndex = nextQIndex;
    session.difficulty = nextDifficulty;
  } else {
    isInterviewComplete = true;
  }

  await session.save();

  return {
    session,
    isInterviewComplete,
    evaluatedAnswer: evaluation,
    nextQuestion: isInterviewComplete ? null : session.questions[session.currentQuestionIndex],
  };
};

/**
 * 3. Finish Interview & Compile Final Recruiter Report
 */
export const finishInterviewSessionService = async ({ sessionId, candidateIdStr }) => {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    candidateId: candidateIdStr,
    isDeleted: { $ne: true },
  });

  if (!session) {
    throw new AppError('Interview session not found.', 404);
  }

  // Compile final report from FastAPI
  const qaData = session.questions.map((q) => ({
    questionText: q.questionText,
    answerText: q.answerText || 'No answer provided.',
    evaluation: q.evaluation,
  }));

  let finalReport = null;
  try {
    finalReport = await postToAIService('/api/v1/ai/interview/finish', {
      interviewType: session.interviewType,
      questionsAndAnswers: qaData,
    });
  } catch (err) {
    logger.info(`FastAPI AI finish service offline (${err.message}). Using local report generator.`);
  }

  if (!finalReport) {
    const evals = session.questions.filter((q) => q.evaluation).map((q) => q.evaluation);
    const avgTech = evals.length ? Math.round(evals.reduce((a, b) => a + (b.technicalAccuracy || 75), 0) / evals.length) : 75;
    const avgComm = evals.length ? Math.round(evals.reduce((a, b) => a + (b.communication || 80), 0) / evals.length) : 80;
    const avgConf = evals.length ? Math.round(evals.reduce((a, b) => a + (b.confidence || 85), 0) / evals.length) : 85;
    const avgGram = evals.length ? Math.round(evals.reduce((a, b) => a + (b.grammar || 90), 0) / evals.length) : 90;
    const overall = Math.round((avgTech + avgComm + avgConf + avgGram) / 4);

    finalReport = {
      overallScore: overall,
      technicalScore: avgTech,
      communicationScore: avgComm,
      confidenceScore: avgConf,
      grammarScore: avgGram,
      strengths: [
        'Demonstrates technical familiarity with full stack engineering principles.',
        'Communicates structured answers effectively.',
      ],
      weaknesses: [
        'Could elaborate further on production system metrics and edge-case handling.',
      ],
      topImprovements: [
        'Quantify achievements with measurable performance numbers.',
        'Practice system design edge-case failure modes.',
        'Use STAR technique consistently for behavioral questions.',
        'Summarize key takeaways at the conclusion of technical responses.',
        'Include specific cloud infrastructure architecture details.',
      ],
      recruiterFeedback: `Strong performance in ${session.interviewType} interview with an overall score of ${overall}%. Recommended for senior technical rounds.`,
      hiringRecommendation: overall >= 70 ? 'Yes' : 'Conditional',
      readyForInterview: overall >= 65,
    };
  }

  const durationSeconds = Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000);

  session.status = 'Completed';
  session.completedAt = new Date();
  session.timeTaken = durationSeconds;
  session.overallScore = finalReport.overallScore || 75;
  session.technicalScore = finalReport.technicalScore || 75;
  session.communicationScore = finalReport.communicationScore || 80;
  session.confidenceScore = finalReport.confidenceScore || 85;
  session.grammarScore = finalReport.grammarScore || 90;
  session.feedback = {
    strengths: finalReport.strengths || [],
    weaknesses: finalReport.weaknesses || [],
    topImprovements: finalReport.topImprovements || [],
    recruiterFeedback: finalReport.recruiterFeedback || '',
    hiringRecommendation: finalReport.hiringRecommendation || 'Yes',
    readyForInterview: Boolean(finalReport.readyForInterview),
  };

  await session.save();

  return session;
};

/**
 * 4. Get Interview Session Details by ID
 */
export const getInterviewSessionByIdService = async (sessionId, candidateIdStr) => {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    candidateId: candidateIdStr,
    isDeleted: { $ne: true },
  })
    .populate('jobId', 'title company department workMode employmentType')
    .lean();

  if (!session) {
    throw new AppError('Interview session not found or access denied.', 404);
  }

  return session;
};

/**
 * 5. Get Candidate's Interview History List
 */
export const getInterviewHistoryService = async (candidateIdStr, query = {}) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { candidateId, isDeleted: { $ne: true } };

  const [history, totalItems] = await Promise.all([
    InterviewSession.find(filter)
      .populate('jobId', 'title company department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    InterviewSession.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    history,
    pagination: {
      totalItems,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * 6. Delete Interview Session (Soft Delete)
 */
export const deleteInterviewSessionService = async (sessionId, candidateIdStr) => {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    candidateId: candidateIdStr,
    isDeleted: { $ne: true },
  });

  if (!session) {
    throw new AppError('Interview session not found or access denied.', 404);
  }

  session.isDeleted = true;
  await session.save();

  return { id: session._id };
};
