import express from 'express';
import {
  startCodingAssessmentHandler,
  getCodingAssessmentByIdHandler,
  submitCodingAnswerHandler,
  finishCodingAssessmentHandler,
  getCodingHistoryHandler,
  deleteCodingAssessmentHandler,
} from '../controllers/codingAI.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Guard AI Coding Assessment routes for authenticated Candidates only
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

/**
 * @route POST /api/v1/candidate/ai-coding/start
 * @desc Start a new AI coding assessment
 */
router.post('/start', startCodingAssessmentHandler);

/**
 * @route GET /api/v1/candidate/ai-coding/history
 * @desc Get candidate's past AI coding assessment history list
 */
router.get('/history', getCodingHistoryHandler);

/**
 * @route GET /api/v1/candidate/ai-coding/:assessmentId
 * @desc Get details of a single coding assessment
 */
router.get('/:assessmentId', getCodingAssessmentByIdHandler);

/**
 * @route POST /api/v1/candidate/ai-coding/:assessmentId/submit-answer
 * @desc Submit answer/code to current question & receive Gemini AI evaluation + next question
 */
router.post('/:assessmentId/submit-answer', submitCodingAnswerHandler);

/**
 * @route POST /api/v1/candidate/ai-coding/:assessmentId/finish
 * @desc Finish assessment session & generate final code evaluation report
 */
router.post('/:assessmentId/finish', finishCodingAssessmentHandler);

/**
 * @route DELETE /api/v1/candidate/ai-coding/history/:assessmentId
 * @desc Delete a coding assessment record
 */
router.delete('/history/:assessmentId', deleteCodingAssessmentHandler);

export default router;
