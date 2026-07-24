import express from 'express';
import {
  getCompanyApplicationsHandler,
  getCompanyApplicationByIdHandler,
  updateStatusHandler,
  updateRatingHandler,
  updateFeedbackHandler,
} from '../controllers/applicationCompany.controller.js';
import {
  validateStatusUpdate,
  validateRatingUpdate,
  validateFeedbackUpdate,
} from '../validations/application.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Company Protected Routes
router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

router.get('/', getCompanyApplicationsHandler);
router.get('/:id', getCompanyApplicationByIdHandler);
router.patch('/:id/status', validateStatusUpdate, updateStatusHandler);
router.patch('/:id/rating', validateRatingUpdate, updateRatingHandler);
router.patch('/:id/feedback', validateFeedbackUpdate, updateFeedbackHandler);

export default router;
