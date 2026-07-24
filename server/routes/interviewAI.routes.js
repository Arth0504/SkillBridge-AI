import express from 'express';
import {
  startInterviewSessionHandler,
  getInterviewSessionByIdHandler,
  submitAnswerHandler,
  finishInterviewSessionHandler,
  getInterviewHistoryHandler,
  deleteInterviewSessionHandler,
} from '../controllers/interviewAI.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Guard AI Mock Interview routes for authenticated Candidates only
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

/**
 * @route POST /api/v1/candidate/ai-interview/start
 * @desc Start a new AI mock interview session
 */
router.post('/start', startInterviewSessionHandler);

/**
 * @route GET /api/v1/candidate/ai-interview/history
 * @desc Get candidate's past AI mock interview history list
 */
router.get('/history', getInterviewHistoryHandler);

/**
 * @route GET /api/v1/candidate/ai-interview/:sessionId
 * @desc Get details of a single interview session
 */
router.get('/:sessionId', getInterviewSessionByIdHandler);

/**
 * @route POST /api/v1/candidate/ai-interview/:sessionId/submit-answer
 * @desc Submit answer to current question & receive evaluation + next adaptive question
 */
router.post('/:sessionId/submit-answer', submitAnswerHandler);

/**
 * @route POST /api/v1/candidate/ai-interview/:sessionId/finish
 * @desc Finish interview session & generate final recruiter feedback report
 */
router.post('/:sessionId/finish', finishInterviewSessionHandler);

/**
 * @route DELETE /api/v1/candidate/ai-interview/history/:sessionId
 * @desc Delete an interview session record
 */
router.delete('/history/:sessionId', deleteInterviewSessionHandler);

export default router;
