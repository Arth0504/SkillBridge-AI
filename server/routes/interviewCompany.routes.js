import express from 'express';
import {
  createInterviewHandler,
  updateInterviewHandler,
  updateInterviewStatusHandler,
  addInterviewFeedbackHandler,
  getCompanyInterviewsHandler,
  getCompanyInterviewByIdHandler,
} from '../controllers/interviewCompany.controller.js';
import {
  validateInterviewId,
  validateInterviewCreate,
  validateInterviewUpdate,
  validateInterviewStatusUpdate,
  validateInterviewFeedback,
  validateInterviewQuery,
} from '../validations/interview.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Guard company interview routes
router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

/**
 * @route POST /api/v1/company/interviews
 * @desc Schedule a new interview for an application
 */
router.post('/', validateInterviewCreate, createInterviewHandler);

/**
 * @route GET /api/v1/company/interviews
 * @desc List company interviews with filters & pagination
 */
router.get('/', validateInterviewQuery, getCompanyInterviewsHandler);

/**
 * @route GET /api/v1/company/interviews/:id
 * @desc Get single interview details
 */
router.get('/:id', validateInterviewId, getCompanyInterviewByIdHandler);

/**
 * @route PUT /api/v1/company/interviews/:id
 * @desc Update / Reschedule interview details
 */
router.put('/:id', validateInterviewId, validateInterviewUpdate, updateInterviewHandler);

/**
 * @route PATCH /api/v1/company/interviews/:id/status
 * @desc Update interview status (Scheduled, Rescheduled, Completed, Cancelled, No Show)
 */
router.patch('/:id/status', validateInterviewId, validateInterviewStatusUpdate, updateInterviewStatusHandler);

/**
 * @route PATCH /api/v1/company/interviews/:id/feedback
 * @desc Provide interview feedback, rating, and result
 */
router.patch('/:id/feedback', validateInterviewId, validateInterviewFeedback, addInterviewFeedbackHandler);

export default router;
