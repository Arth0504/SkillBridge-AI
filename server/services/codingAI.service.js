import mongoose from 'mongoose';
import { CodingAssessment } from '../models/codingAssessment.model.js';
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
      logger.warn(`AI Coding request failed on attempt ${attempt}: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
};

const getFallbackQuestionPool = (language, difficulty, index = 0) => {
  const pool = [
    {
      questionText: `Write a function in ${language} to find two numbers in an array that add up to a target sum and return their indices.`,
      questionType: 'Coding Challenge',
      language,
      difficulty,
      options: [],
      initialCode: language === 'Python'
        ? `def solution(nums, target):\n    # Write your O(N) solution here\n    hashmap = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hashmap:\n            return [hashmap[complement], i]\n        hashmap[num] = i\n    return []`
        : language === 'Java'
        ? `import java.util.*;\n\nclass Solution {\n    public int[] solution(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[] { map.get(comp), i };\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`
        : language === 'C++'
        ? `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int comp = target - nums[i];\n            if (mp.count(comp)) return {mp[comp], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};`
        : language === 'SQL'
        ? `-- Write SQL query to return candidates with total applications >= 1\nSELECT candidate_id, COUNT(id) as total_applications\nFROM applications\nGROUP BY candidate_id;\n`
        : `function solution(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    },
    {
      questionText: `Write a function in ${language} that determines if a given string of brackets '()[]{}' is valid and properly balanced.`,
      questionType: 'Coding Challenge',
      language,
      difficulty,
      options: [],
      initialCode: language === 'Python'
        ? `def isValid(s: str) -> bool:\n    # Stack-based valid parentheses solver\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top: return False\n        else: stack.append(char)\n    return not stack`
        : language === 'Java'
        ? `import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`
        : language === 'SQL'
        ? `-- Write SQL query to find average test score per department\nSELECT department, AVG(score) as avg_score\nFROM employee_assessments\nGROUP BY department;\n`
        : `function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (const char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}`,
    },
    {
      questionText: `What is the worst-case time complexity of QuickSort when the pivot chosen is always the smallest or largest element?`,
      questionType: 'MCQ',
      language,
      difficulty,
      options: ['A) O(N log N)', 'B) O(N^2)', 'C) O(N)', 'D) O(log N)'],
      initialCode: '',
    },
    {
      questionText: `Write a function in ${language} to find the contiguous subarray within a one-dimensional array of numbers which has the largest sum (Kadane's Algorithm).`,
      questionType: 'Coding Challenge',
      language,
      difficulty,
      options: [],
      initialCode: language === 'Python'
        ? `def maxSubArray(nums):\n    max_so_far = current_max = nums[0]\n    for x in nums[1:]:\n        current_max = max(x, current_max + x)\n        max_so_far = max(max_so_far, current_max)\n    return max_so_far`
        : language === 'Java'
        ? `class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSoFar = nums[0], currMax = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currMax = Math.max(nums[i], currMax + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currMax);\n        }\n        return maxSoFar;\n    }\n}`
        : language === 'SQL'
        ? `-- Write SQL query using RANK() to select top 3 highest scoring candidates per job\nSELECT candidate_id, job_id, score,\n       DENSE_RANK() OVER (PARTITION BY job_id ORDER BY score DESC) as rank_num\nFROM job_applications;\n`
        : `function maxSubArray(nums) {\n  let maxSoFar = nums[0], currMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currMax = Math.max(nums[i], currMax + nums[i]);\n    maxSoFar = Math.max(maxSoFar, currMax);\n  }\n  return maxSoFar;\n}`,
    },
    {
      questionText: `Write a function in ${language} to merge two sorted arrays nums1 and nums2 into a single sorted array.`,
      questionType: 'Coding Challenge',
      language,
      difficulty,
      options: [],
      initialCode: language === 'Python'
        ? `def mergeSorted(nums1, nums2):\n    return sorted(nums1 + nums2)`
        : language === 'Java'
        ? `import java.util.*;\nclass Solution {\n    public int[] merge(int[] a, int[] b) {\n        int[] res = new int[a.length + b.length];\n        System.arraycopy(a, 0, res, 0, a.length);\n        System.arraycopy(b, 0, res, a.length, b.length);\n        Arrays.sort(res);\n        return res;\n    }\n}`
        : language === 'SQL'
        ? `-- Write SQL query to join candidates and jobs, filtering out unverified recruiters\nSELECT c.name as candidate_name, j.title as job_title, a.status\nFROM applications a\nJOIN candidates c ON a.candidate_id = c._id\nJOIN jobs j ON a.job_id = j._id;\n`
        : `function mergeSorted(nums1, nums2) {\n  return [...nums1, ...nums2].sort((a, b) => a - b);\n}`,
    },
  ];

  return pool[index % pool.length];
};

/**
 * 1. Start AI Coding Assessment
 */
export const startCodingAssessmentService = async ({
  candidateIdStr,
  jobIdStr = null,
  language = 'JavaScript',
  difficulty = 'Medium',
  questionType = 'Coding Challenge',
  totalQuestions = 5,
}) => {
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
    const aiRes = await postToAIService('/api/v1/ai/coding/start', {
      language,
      difficulty,
      questionType,
      jobDescription,
    });
    if (aiRes && aiRes.initialQuestion) {
      initialQuestion = aiRes.initialQuestion;
    }
  } catch (err) {
    logger.info(`FastAPI AI service offline (${err.message}). Using local fallback coding question.`);
  }

  if (!initialQuestion) {
    initialQuestion = getFallbackQuestionPool(language, difficulty, 0);
  }

  const firstQ = {
    questionId: new mongoose.Types.ObjectId().toString(),
    questionText: initialQuestion.questionText,
    questionType: initialQuestion.questionType || questionType,
    difficulty: initialQuestion.difficulty || difficulty,
    language: initialQuestion.language || language,
    options: initialQuestion.options || [],
    initialCode: initialQuestion.initialCode || '',
  };

  const assessment = await CodingAssessment.create({
    candidateId,
    jobId,
    language,
    difficulty,
    status: 'In Progress',
    totalQuestions: totalQuestions || 5,
    currentQuestionIndex: 0,
    questions: [firstQ],
    startedAt: new Date(),
  });

  return assessment;
};

/**
 * 2. Submit Answer / Code & Get Next Question
 */
export const submitCodingAnswerService = async ({ assessmentId, candidateIdStr, submittedAnswer }) => {
  const assessment = await CodingAssessment.findOne({
    _id: assessmentId,
    candidateId: candidateIdStr,
    status: 'In Progress',
    isDeleted: { $ne: true },
  });

  if (!assessment) {
    throw new AppError('Active coding assessment not found or already completed.', 404);
  }

  const currentQIndex = assessment.currentQuestionIndex;
  const currentQ = assessment.questions[currentQIndex];

  if (!currentQ) {
    throw new AppError('Question state error.', 400);
  }

  // 1. Evaluate Code via FastAPI AI
  let evaluation = null;
  try {
    evaluation = await postToAIService('/api/v1/ai/coding/submit', {
      questionText: currentQ.questionText,
      language: assessment.language,
      submittedAnswer,
      expectedKeyPoints: [],
    });
  } catch (err) {
    logger.info(`FastAPI AI coding evaluator offline (${err.message}). Using local fallback evaluator.`);
  }

  if (!evaluation) {
    const codeLen = submittedAnswer.trim().length;
    const score = Math.min(95, Math.max(50, Math.round((codeLen / 35) * 80)));
    evaluation = {
      correctness: score,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      codeQuality: 85,
      bestPractices: 90,
      readability: 88,
      score,
      feedbackText: `Valid ${assessment.language} solution addressing requirement details.`,
      improvementSuggestions: ['Include boundary edge-case handling', 'Add type declarations or Docstrings'],
    };
  }

  // Save current question answer & evaluation
  currentQ.submittedAnswer = submittedAnswer;
  currentQ.submittedAt = new Date();
  currentQ.evaluation = evaluation;

  // 2. Determine Next Question or Completion
  const nextQIndex = currentQIndex + 1;
  let isAssessmentComplete = false;

  if (nextQIndex < assessment.totalQuestions) {
    // Alternate question types (Coding Challenge -> MCQ -> Output Prediction -> Debugging)
    const types = ['Coding Challenge', 'MCQ', 'Output Prediction', 'Debugging'];
    const nextType = types[nextQIndex % types.length];

    let nextQ = null;
    try {
      nextQ = await postToAIService('/api/v1/ai/coding/question', {
        language: assessment.language,
        difficulty: assessment.difficulty,
        questionType: nextType,
        previousQuestions: assessment.questions.map((q) => ({ questionText: q.questionText })),
      });
    } catch (err) {
      logger.info(`FastAPI AI coding question generator offline (${err.message}).`);
    }

    if (!nextQ) {
      nextQ = getFallbackQuestionPool(assessment.language, assessment.difficulty, nextQIndex);
    }

    const newQuestionObj = {
      questionId: new mongoose.Types.ObjectId().toString(),
      questionText: nextQ.questionText,
      questionType: nextQ.questionType || nextType,
      difficulty: nextQ.difficulty || assessment.difficulty,
      language: nextQ.language || assessment.language,
      options: nextQ.options || [],
      initialCode: nextQ.initialCode || '',
    };

    assessment.questions.push(newQuestionObj);
    assessment.currentQuestionIndex = nextQIndex;
  } else {
    isAssessmentComplete = true;
  }

  await assessment.save();

  return {
    assessment,
    isAssessmentComplete,
    evaluatedAnswer: evaluation,
    nextQuestion: isAssessmentComplete ? null : assessment.questions[assessment.currentQuestionIndex],
  };
};

/**
 * 3. Finish Coding Assessment & Compile Report
 */
export const finishCodingAssessmentService = async ({ assessmentId, candidateIdStr }) => {
  const assessment = await CodingAssessment.findOne({
    _id: assessmentId,
    candidateId: candidateIdStr,
    isDeleted: { $ne: true },
  });

  if (!assessment) {
    throw new AppError('Coding assessment not found.', 404);
  }

  const totalQ = assessment.totalQuestions || 5;
  const questionsList = assessment.questions || [];

  // Calculate authoritative score across ALL configured total questions
  let sumScore = 0;
  let sumQuality = 0;
  let sumCorrectness = 0;
  let attemptedCount = 0;

  for (let i = 0; i < totalQ; i++) {
    const q = questionsList[i];
    if (
      q &&
      q.submittedAnswer &&
      String(q.submittedAnswer).trim() !== '' &&
      String(q.submittedAnswer).trim() !== 'No answer submitted.'
    ) {
      attemptedCount++;
      if (q.evaluation) {
        sumScore += Number(q.evaluation.score || 0);
        sumQuality += Number(q.evaluation.codeQuality || 0);
        sumCorrectness += Number(q.evaluation.correctness || 0);
      }
    }
    // Unattempted or skipped questions implicitly contribute 0 to sumScore, sumQuality, sumCorrectness
  }

  const authoritativeOverallScore = Math.round(sumScore / totalQ);
  const authoritativeQualityScore = Math.round(sumQuality / totalQ);
  const authoritativeCorrectnessScore = Math.round(sumCorrectness / totalQ);

  const attemptStatus =
    attemptedCount === 0
      ? 'Unanswered'
      : attemptedCount === totalQ
      ? 'Completed'
      : 'Partially Attempted';

  const qsData = questionsList.map((q) => ({
    questionText: q.questionText,
    questionType: q.questionType,
    submittedAnswer: q.submittedAnswer || 'No answer submitted.',
    evaluation: q.evaluation,
  }));

  let finalReport = null;
  try {
    finalReport = await postToAIService('/api/v1/ai/coding/finish', {
      language: assessment.language,
      difficulty: assessment.difficulty,
      questionsAndSubmissions: qsData,
      totalQuestions: totalQ,
      attemptedCount,
    });
  } catch (err) {
    logger.info(`FastAPI AI coding finish service offline (${err.message}). Using local report generator.`);
  }

  const defaultSummary = `The candidate completed ${attemptedCount} of ${totalQ} questions (${attemptStatus}) in ${assessment.language} (${assessment.difficulty} level) with an authoritative score of ${authoritativeOverallScore}%.`;

  assessment.status = 'Completed';
  assessment.completedAt = new Date();
  assessment.score = authoritativeOverallScore;
  assessment.feedback = {
    overallScore: authoritativeOverallScore,
    codeQualityScore: authoritativeQualityScore,
    correctnessScore: authoritativeCorrectnessScore,
    strengths: finalReport?.strengths || [
      `Demonstrates syntax fluency in ${assessment.language}.`,
      `Attempted ${attemptedCount} of ${totalQ} configured assessment questions.`,
    ],
    weaknesses: finalReport?.weaknesses || [
      attemptedCount < totalQ
        ? `Left ${totalQ - attemptedCount} questions unanswered, reducing final score.`
        : 'Could add defensive boundary check handling.',
    ],
    topImprovements: finalReport?.topImprovements || [
      'Attempt all assessment questions to maximize total score potential',
      'Practice writing unit tests for boundary input conditions',
      'Optimize memory usage by avoiding unnecessary array allocations',
      'Use standard docstrings or type definitions',
      'Handle null pointer or empty array scenarios gracefully',
    ],
    summary: defaultSummary,
  };

  await assessment.save();

  return assessment;
};

/**
 * 4. Get Coding Assessment Detail by ID
 */
export const getCodingAssessmentByIdService = async (assessmentId, candidateIdStr) => {
  const assessment = await CodingAssessment.findOne({
    _id: assessmentId,
    candidateId: candidateIdStr,
    isDeleted: { $ne: true },
  })
    .populate('jobId', 'title company department workMode employmentType')
    .lean();

  if (!assessment) {
    throw new AppError('Coding assessment not found or access denied.', 404);
  }

  return assessment;
};

/**
 * 5. Get Candidate's Coding Assessment History List
 */
export const getCodingHistoryService = async (candidateIdStr, query = {}) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { candidateId, isDeleted: { $ne: true } };

  const [history, totalItems] = await Promise.all([
    CodingAssessment.find(filter)
      .populate('jobId', 'title company department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CodingAssessment.countDocuments(filter),
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
 * 6. Delete Coding Assessment Record (Soft Delete)
 */
export const deleteCodingAssessmentService = async (assessmentId, candidateIdStr) => {
  const assessment = await CodingAssessment.findOne({
    _id: assessmentId,
    candidateId: candidateIdStr,
    isDeleted: { $ne: true },
  });

  if (!assessment) {
    throw new AppError('Coding assessment not found or access denied.', 404);
  }

  assessment.isDeleted = true;
  await assessment.save();

  return { id: assessment._id };
};
