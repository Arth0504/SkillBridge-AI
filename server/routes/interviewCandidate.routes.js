import express from 'express';
import {
  getCandidateInterviewsHandler,
  getCandidateInterviewByIdHandler,
} from '../controllers/interviewCandidate.controller.js';
import {
  validateInterviewId,
  validateInterviewQuery,
} from '../validations/interview.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Guard candidate interview routes
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

/**
 * @route GET /api/v1/candidate/interviews
 * @desc Get candidate interviews list (read-only)
 */
router.get('/', validateInterviewQuery, getCandidateInterviewsHandler);

/**
 * @route GET /api/v1/candidate/interviews/:id
 * @desc Get single interview details (read-only)
 */
router.get('/:id', validateInterviewId, getCandidateInterviewByIdHandler);

export default router;
