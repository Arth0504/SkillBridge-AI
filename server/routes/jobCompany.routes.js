import express from 'express';
import {
  createJob,
  getCompanyJobs,
  getCompanyJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
} from '../controllers/jobCompany.controller.js';
import { getJobApplicationsHandler } from '../controllers/applicationCompany.controller.js';
import {
  validateJobCreate,
  validateJobUpdate,
  validateJobStatusUpdate,
} from '../validations/job.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All company job endpoints require Company authentication
router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

router.post('/', validateJobCreate, createJob);
router.get('/', getCompanyJobs);
router.get('/:id', getCompanyJobById);
router.put('/:id', validateJobUpdate, updateJob);
router.delete('/:id', deleteJob);
router.patch('/:id/status', validateJobStatusUpdate, updateJobStatus);

// Get Applications for a specific Job
router.get('/:jobId/applications', getJobApplicationsHandler);

export default router;
