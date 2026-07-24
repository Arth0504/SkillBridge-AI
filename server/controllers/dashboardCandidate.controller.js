import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  getCandidateDashboardSummaryService,
  getCandidateDashboardApplicationsService,
  getCandidateDashboardUpcomingInterviewsService,
  getCandidateDashboardProfileCompletionService,
  getCandidateDashboardTimelineService,
  getCandidateDashboardAnalyticsService,
} from '../services/dashboardCandidate.service.js';

/**
 * Get Candidate Dashboard Summary
 * @route GET /api/v1/candidate/dashboard
 */
export const getCandidateDashboardSummaryHandler = asyncHandler(async (req, res, _next) => {
  const summary = await getCandidateDashboardSummaryService(req.user._id);

  return sendResponse(res, 200, true, 'Candidate dashboard summary retrieved successfully', summary);
});

/**
 * Get Candidate Applications Section
 * @route GET /api/v1/candidate/dashboard/applications
 */
export const getCandidateApplicationsHandler = asyncHandler(async (req, res, _next) => {
  const data = await getCandidateDashboardApplicationsService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Candidate applications retrieved successfully', data);
});

/**
 * Get Upcoming Interviews Section (Nearest Interview First)
 * @route GET /api/v1/candidate/dashboard/interviews
 */
export const getUpcomingInterviewsHandler = asyncHandler(async (req, res, _next) => {
  const interviews = await getCandidateDashboardUpcomingInterviewsService(req.user._id);

  return sendResponse(res, 200, true, 'Upcoming interviews retrieved successfully', { interviews });
});

/**
 * Get Profile Completion Percentage & Missing Sections
 * @route GET /api/v1/candidate/dashboard/profile-completion
 */
export const getProfileCompletionHandler = asyncHandler(async (req, res, _next) => {
  const completionData = await getCandidateDashboardProfileCompletionService(req.user._id);

  return sendResponse(res, 200, true, 'Profile completion status retrieved successfully', completionData);
});

/**
 * Get Candidate Activity Timeline (Newest First)
 * @route GET /api/v1/candidate/dashboard/timeline
 */
export const getCandidateTimelineHandler = asyncHandler(async (req, res, _next) => {
  const timeline = await getCandidateDashboardTimelineService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Candidate activity timeline retrieved successfully', { timeline });
});

/**
 * Get Candidate Dashboard Analytics
 * @route GET /api/v1/candidate/dashboard/analytics
 */
export const getCandidateAnalyticsHandler = asyncHandler(async (req, res, _next) => {
  const analytics = await getCandidateDashboardAnalyticsService(req.user._id);

  return sendResponse(res, 200, true, 'Candidate dashboard analytics retrieved successfully', analytics);
});
