import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  startInterviewSessionService,
  submitAnswerService,
  finishInterviewSessionService,
  getInterviewSessionByIdService,
  getInterviewHistoryService,
  deleteInterviewSessionService,
} from '../services/interviewAI.service.js';

/**
 * Start AI Mock Interview Session
 * @route POST /api/v1/candidate/ai-interview/start
 */
export const startInterviewSessionHandler = asyncHandler(async (req, res, _next) => {
  const { jobId, interviewType, difficulty, experienceLevel, totalQuestions } = req.body;

  const session = await startInterviewSessionService({
    candidateIdStr: req.user._id,
    jobIdStr: jobId || null,
    interviewType: interviewType || 'Mixed',
    difficulty: difficulty || 'Medium',
    experienceLevel: experienceLevel || 'Senior',
    totalQuestions: totalQuestions || 5,
  });

  return sendResponse(res, 201, true, 'AI mock interview session started successfully', { session });
});

/**
 * Get Interview Session Detail by ID
 * @route GET /api/v1/candidate/ai-interview/:sessionId
 */
export const getInterviewSessionByIdHandler = asyncHandler(async (req, res, _next) => {
  const session = await getInterviewSessionByIdService(req.params.sessionId, req.user._id);

  return sendResponse(res, 200, true, 'Interview session details retrieved successfully', { session });
});

/**
 * Submit Answer & Get Next Adaptive Question
 * @route POST /api/v1/candidate/ai-interview/:sessionId/submit-answer
 */
export const submitAnswerHandler = asyncHandler(async (req, res, next) => {
  const rawAnswer = req.body?.answerText || req.body?.answer || req.body?.submittedAnswer || req.body?.code;

  if (!rawAnswer || !String(rawAnswer).trim()) {
    return next(new AppError('answerText (or answer) is required.', 400));
  }

  const answerText = String(rawAnswer).trim();

  const result = await submitAnswerService({
    sessionId: req.params.sessionId,
    candidateIdStr: req.user._id,
    answerText,
  });

  return sendResponse(res, 200, true, 'Answer evaluated successfully', result);
});

/**
 * Finish Interview & Generate Final Recruiter Report
 * @route POST /api/v1/candidate/ai-interview/:sessionId/finish
 */
export const finishInterviewSessionHandler = asyncHandler(async (req, res, _next) => {
  const session = await finishInterviewSessionService({
    sessionId: req.params.sessionId,
    candidateIdStr: req.user._id,
  });

  return sendResponse(res, 200, true, 'AI mock interview session completed successfully', { session });
});

/**
 * Get Candidate's Past AI Mock Interview History List
 * @route GET /api/v1/candidate/ai-interview/history
 */
export const getInterviewHistoryHandler = asyncHandler(async (req, res, _next) => {
  const data = await getInterviewHistoryService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Interview history retrieved successfully', data);
});

/**
 * Soft Delete AI Mock Interview Session Record
 * @route DELETE /api/v1/candidate/ai-interview/history/:sessionId
 */
export const deleteInterviewSessionHandler = asyncHandler(async (req, res, _next) => {
  const result = await deleteInterviewSessionService(req.params.sessionId, req.user._id);

  return sendResponse(res, 200, true, 'Interview session record deleted successfully', result);
});

/**
 * MODULE 8: AI HR Assistant Query Handler (Recruiter Chatbot)
 * @route POST /api/v1/company/ai-assistant/query
 */
export const handleHRAssistantQuery = asyncHandler(async (req, res, _next) => {
  const { query } = req.body;
  const companyId = req.user.companyId || req.user._id;

  const { Application } = await import('../models/application.model.js');
  const { Candidate } = await import('../models/candidate.model.js');

  const qLower = (query || '').toLowerCase();
  let answer = '';
  let candidates = [];

  const apps = await Application.find({ companyId, isDeleted: { $ne: true } })
    .populate('candidateId')
    .populate('jobId')
    .lean();

  if (qLower.includes('react') || qLower.includes('node') || qLower.includes('python') || qLower.includes('java')) {
    const skillKeyword = qLower.includes('react') ? 'React' : qLower.includes('node') ? 'Node' : qLower.includes('python') ? 'Python' : 'Java';
    const matches = apps.filter((a) => {
      const skills = (a.candidateId?.skills || []).map((s) => s.toLowerCase());
      return skills.some((sk) => sk.includes(skillKeyword.toLowerCase()));
    });

    candidates = matches.map((m) => ({
      name: m.candidateId?.fullName || 'Candidate',
      email: m.candidateId?.email,
      skills: m.candidateId?.skills || [],
      matchScore: m.matchScore || 85,
    }));

    answer = `Found ${candidates.length} candidate(s) with ${skillKeyword} expertise in your active pipeline.`;
  } else if (qLower.includes('5+') || qLower.includes('experience') || qLower.includes('senior')) {
    const matches = apps.filter((a) => (a.candidateId?.experienceYears || 0) >= 5);
    candidates = matches.map((m) => ({
      name: m.candidateId?.fullName || 'Candidate',
      experienceYears: m.candidateId?.experienceYears,
      email: m.candidateId?.email,
    }));

    answer = `Found ${candidates.length} senior candidate(s) with 5+ years of experience.`;
  } else if (qLower.includes('coding') || qLower.includes('passed')) {
    const matches = apps.filter((a) => (a.codingScore || 0) >= 70);
    candidates = matches.map((m) => ({
      name: m.candidateId?.fullName || 'Candidate',
      codingScore: m.codingScore || 85,
    }));

    answer = `Found ${candidates.length} candidate(s) who passed coding assessments with high scores.`;
  } else if (qLower.includes('question') || qLower.includes('generate')) {
    answer = `Here are 3 tailored technical interview questions for your pipeline:\n1. Describe how you handle state management in large scale applications.\n2. Explain WebRTC signaling SDP offer/answer exchanges.\n3. How do you optimize MongoDB aggregation queries under heavy read loads?`;
  } else {
    answer = `AI HR Assistant evaluated your pipeline of ${apps.length} candidate applications. Try asking "Top React candidates", "Candidates with 5+ years", or "Who passed coding?".`;
    candidates = apps.slice(0, 5).map((a) => ({ name: a.candidateId?.fullName || 'Candidate', status: a.status }));
  }

  return sendResponse(res, 200, true, 'AI HR Assistant response generated', { answer, candidates });
});
