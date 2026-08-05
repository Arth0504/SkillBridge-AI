import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  getCompanyDashboardSummaryService,
  getCompanyDashboardAnalyticsService,
  getCompanyDashboardRecentApplicationsService,
  getCompanyDashboardJobPerformanceService,
  getCompanyDashboardInterviewsService,
  getCompanyAnalyticsService,
  getCompanyCopilotAnalyticsService,
} from '../services/dashboard.service.js';

/**
 * Get Company Dashboard Summary Statistics
 * @route GET /api/v1/company/dashboard
 */
export const getDashboardSummaryHandler = asyncHandler(async (req, res, _next) => {
  const summary = await getCompanyDashboardSummaryService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Company dashboard summary retrieved successfully', summary);
});

/**
 * Get Company Dashboard Analytics & Trends
 * @route GET /api/v1/company/dashboard/analytics
 */
export const getDashboardAnalyticsHandler = asyncHandler(async (req, res, _next) => {
  const analytics = await getCompanyAnalyticsService(req.user._id);

  return sendResponse(res, 200, true, 'Company dashboard analytics retrieved successfully', { analytics });
});

/**
 * Get Recent Applications & Recent Activities
 * @route GET /api/v1/company/dashboard/recent-applications
 */
export const getDashboardRecentApplicationsHandler = asyncHandler(async (req, res, _next) => {
  const recentData = await getCompanyDashboardRecentApplicationsService(req.user._id, req.query);

  return sendResponse(
    res,
    200,
    true,
    'Recent applications and activities retrieved successfully',
    recentData
  );
});

/**
 * Get Job Performance Metrics
 * @route GET /api/v1/company/dashboard/job-performance
 */
export const getDashboardJobPerformanceHandler = asyncHandler(async (req, res, _next) => {
  const jobPerformance = await getCompanyDashboardJobPerformanceService(req.user._id, req.query);

  return sendResponse(
    res,
    200,
    true,
    'Job performance metrics retrieved successfully',
    jobPerformance
  );
});

/**
 * Get Interview Overview & Upcoming Schedule
 * @route GET /api/v1/company/dashboard/interviews
 */
export const getDashboardInterviewsHandler = asyncHandler(async (req, res, _next) => {
  const interviewData = await getCompanyDashboardInterviewsService(req.user._id, req.query);

  return sendResponse(
    res,
    200,
    true,
    'Interview overview and schedule retrieved successfully',
    interviewData
  );
});

/**
 * Get Recruiter Copilot Dynamic Candidates & Funnel Analytics
 * @route GET /api/v1/company/copilot/analytics
 */
export const getCompanyCopilotAnalyticsHandler = asyncHandler(async (req, res, _next) => {
  const copilotData = await getCompanyCopilotAnalyticsService(req.user._id);

  return sendResponse(res, 200, true, 'Recruiter copilot dynamic analytics retrieved successfully', copilotData);
});
