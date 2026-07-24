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
  const { jobId, interviewType, difficulty, totalQuestions } = req.body;

  const session = await startInterviewSessionService({
    candidateIdStr: req.user._id,
    jobIdStr: jobId || null,
    interviewType: interviewType || 'Mixed',
    difficulty: difficulty || 'Medium',
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
  const { answerText } = req.body;

  if (!answerText || !answerText.trim()) {
    return next(new AppError('answerText is required.', 400));
  }

  const result = await submitAnswerService({
    sessionId: req.params.sessionId,
    candidateIdStr: req.user._id,
    answerText: answerText.trim(),
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
