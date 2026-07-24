import express from 'express';
import {
  getAllJobs,
  getJobById,
} from '../controllers/job.controller.js';
import { applyToJobHandler } from '../controllers/applicationCandidate.controller.js';
import { validateApplicationSubmit } from '../validations/application.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public Job Search & Details
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Candidate Submit Application to Job
router.post('/:jobId/apply', protect, restrictTo(ROLES.CANDIDATE), validateApplicationSubmit, applyToJobHandler);

export default router;
