import express from 'express';
import {
  getCandidateDashboardSummaryHandler,
  getCandidateApplicationsHandler,
  getUpcomingInterviewsHandler,
  getProfileCompletionHandler,
  getCandidateTimelineHandler,
  getCandidateAnalyticsHandler,
} from '../controllers/dashboardCandidate.controller.js';
import { validateCandidateDashboardQuery } from '../validations/dashboardCandidate.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Guard candidate dashboard routes for authenticated Candidate role only
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

/**
 * @route GET /api/v1/candidate/dashboard
 * @desc Candidate dashboard summary statistics
 */
router.get('/', getCandidateDashboardSummaryHandler);

/**
 * @route GET /api/v1/candidate/dashboard/applications
 * @desc My Applications section (with pagination, status filtering, sorting)
 */
router.get('/applications', validateCandidateDashboardQuery, getCandidateApplicationsHandler);

/**
 * @route GET /api/v1/candidate/dashboard/interviews
 * @desc Upcoming Interviews section (sorted nearest interview first)
 */
router.get('/interviews', getUpcomingInterviewsHandler);

/**
 * @route GET /api/v1/candidate/dashboard/profile-completion
 * @desc Candidate profile completion audit (% and missing sections)
 */
router.get('/profile-completion', getProfileCompletionHandler);

/**
 * @route GET /api/v1/candidate/dashboard/timeline
 * @desc Candidate activity timeline (newest first)
 */
router.get('/timeline', getCandidateTimelineHandler);

/**
 * @route GET /api/v1/candidate/dashboard/analytics
 * @desc Candidate dashboard analytics and graph data
 */
router.get('/analytics', getCandidateAnalyticsHandler);

export default router;
