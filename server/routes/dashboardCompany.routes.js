import express from 'express';
import {
  getDashboardSummaryHandler,
  getDashboardAnalyticsHandler,
  getDashboardRecentApplicationsHandler,
  getDashboardJobPerformanceHandler,
  getDashboardInterviewsHandler,
  getCompanyCopilotAnalyticsHandler,
  seedDemoAnalyticsHandler,
  clearDemoAnalyticsHandler,
} from '../controllers/dashboardCompany.controller.js';
import { validateDashboardQuery } from '../validations/dashboard.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Guard all dashboard routes for authenticated company accounts only
router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

/**
 * @route GET /api/v1/company/dashboard
 * @desc Overview dashboard statistics
 */
router.get('/', validateDashboardQuery, getDashboardSummaryHandler);

/**
 * @route GET /api/v1/company/dashboard/analytics
 * @desc Detailed analytics & trend reports
 */
router.get('/analytics', validateDashboardQuery, getDashboardAnalyticsHandler);

/**
 * @route GET /api/v1/company/dashboard/recent-applications
 * @desc Recent applications & activity updates
 */
router.get('/recent-applications', validateDashboardQuery, getDashboardRecentApplicationsHandler);

/**
 * @route GET /api/v1/company/dashboard/job-performance
 * @desc Job-level performance metrics & conversion rates
 */
router.get('/job-performance', validateDashboardQuery, getDashboardJobPerformanceHandler);

/**
 * @route GET /api/v1/company/dashboard/interviews
 * @desc Interview schedule overview & details
 */
router.get('/interviews', validateDashboardQuery, getDashboardInterviewsHandler);

/**
 * @route GET /api/v1/company/dashboard/copilot/analytics
 * @desc Dynamic Recruiter Copilot candidates & funnel analytics
 */
router.get('/copilot/analytics', getCompanyCopilotAnalyticsHandler);

/**
 * @route POST /api/v1/company/dashboard/seed-demo
 * @desc Seed realistic demo analytics dataset
 */
router.post('/seed-demo', seedDemoAnalyticsHandler);

/**
 * @route DELETE /api/v1/company/dashboard/seed-demo
 * @desc Clear demo analytics dataset (isDemo: true)
 */
router.delete('/seed-demo', clearDemoAnalyticsHandler);

export default router;
