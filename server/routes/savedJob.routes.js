import express from 'express';
import {
  saveJobHandler,
  removeSavedJobHandler,
  getSavedJobsHandler,
} from '../controllers/savedJob.controller.js';
import {
  validateJobIdParam,
  validateSavedJobQuery,
} from '../validations/savedJob.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Guard candidate saved jobs routes
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

/**
 * @route GET /api/v1/candidate/saved-jobs
 * @desc Get list of candidate's saved jobs
 */
router.get('/', validateSavedJobQuery, getSavedJobsHandler);

/**
 * @route POST /api/v1/candidate/saved-jobs
 * @desc Save a job posting via body { jobId }
 */
router.post('/', validateJobIdParam, saveJobHandler);

/**
 * @route POST /api/v1/candidate/saved-jobs/:jobId
 * @desc Save a job posting via param :jobId
 */
router.post('/:jobId', validateJobIdParam, saveJobHandler);

/**
 * @route DELETE /api/v1/candidate/saved-jobs/:jobId
 * @desc Remove a saved job posting
 */
router.delete('/:jobId', validateJobIdParam, removeSavedJobHandler);

export default router;
