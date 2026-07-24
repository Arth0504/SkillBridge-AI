import express from 'express';
import {
  getCandidateApplicationsHandler,
  getCandidateApplicationByIdHandler,
  withdrawApplicationHandler,
} from '../controllers/applicationCandidate.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Candidate Protected Routes
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

router.get('/', getCandidateApplicationsHandler);
router.get('/:id', getCandidateApplicationByIdHandler);
router.patch('/:id/withdraw', withdrawApplicationHandler);

export default router;
