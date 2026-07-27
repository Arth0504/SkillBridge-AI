import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  startCodingAssessmentService,
  submitCodingAnswerService,
  finishCodingAssessmentService,
  getCodingAssessmentByIdService,
  getCodingHistoryService,
  deleteCodingAssessmentService,
} from '../services/codingAI.service.js';

/**
 * Start AI Coding Assessment
 * @route POST /api/v1/candidate/ai-coding/start
 */
export const startCodingAssessmentHandler = asyncHandler(async (req, res, _next) => {
  const { jobId, language, difficulty, questionType, totalQuestions } = req.body;

  const assessment = await startCodingAssessmentService({
    candidateIdStr: req.user._id,
    jobIdStr: jobId || null,
    language: language || 'JavaScript',
    difficulty: difficulty || 'Medium',
    questionType: questionType || 'Coding Challenge',
    totalQuestions: totalQuestions || 5,
  });

  return sendResponse(res, 201, true, 'AI coding assessment started successfully', { assessment });
});

/**
 * Get Coding Assessment Details by ID
 * @route GET /api/v1/candidate/ai-coding/:assessmentId
 */
export const getCodingAssessmentByIdHandler = asyncHandler(async (req, res, _next) => {
  const assessment = await getCodingAssessmentByIdService(req.params.assessmentId, req.user._id);

  return sendResponse(res, 200, true, 'Coding assessment details retrieved successfully', { assessment });
});

/**
 * Submit Code / Answer & Get Next Question
 * @route POST /api/v1/candidate/ai-coding/:assessmentId/submit-answer
 */
export const submitCodingAnswerHandler = asyncHandler(async (req, res, next) => {
  const rawCode = req.body?.submittedAnswer || req.body?.code || req.body?.answer || req.body?.answerText;

  if (!rawCode || !String(rawCode).trim()) {
    return next(new AppError('submittedAnswer (or code) is required.', 400));
  }

  const submittedAnswer = String(rawCode).trim();

  const result = await submitCodingAnswerService({
    assessmentId: req.params.assessmentId,
    candidateIdStr: req.user._id,
    submittedAnswer,
  });

  return sendResponse(res, 200, true, 'Code evaluated successfully', result);
});

/**
 * Finish Coding Assessment & Generate Report
 * @route POST /api/v1/candidate/ai-coding/:assessmentId/finish
 */
export const finishCodingAssessmentHandler = asyncHandler(async (req, res, _next) => {
  const assessment = await finishCodingAssessmentService({
    assessmentId: req.params.assessmentId,
    candidateIdStr: req.user._id,
  });

  return sendResponse(res, 200, true, 'Coding assessment completed successfully', { assessment });
});

/**
 * Get Candidate's Coding Assessment History List
 * @route GET /api/v1/candidate/ai-coding/history
 */
export const getCodingHistoryHandler = asyncHandler(async (req, res, _next) => {
  const data = await getCodingHistoryService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Coding history retrieved successfully', data);
});

/**
 * Soft Delete Coding Assessment Record
 * @route DELETE /api/v1/candidate/ai-coding/history/:assessmentId
 */
export const deleteCodingAssessmentHandler = asyncHandler(async (req, res, _next) => {
  const result = await deleteCodingAssessmentService(req.params.assessmentId, req.user._id);

  return sendResponse(res, 200, true, 'Coding assessment record deleted successfully', result);
});
