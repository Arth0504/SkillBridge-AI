import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  getCompanyApplications,
  getCompanyApplicationById,
  updateApplicationStatus,
  updateApplicationRating,
  updateApplicationFeedback,
} from '../services/application.service.js';

/**
 * Get All Applications across Company Jobs
 * @route GET /api/v1/company/applications
 */
export const getCompanyApplicationsHandler = asyncHandler(async (req, res, _next) => {
  const result = await getCompanyApplications(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Company applications retrieved successfully', {
    applications: result.applications,
    pagination: result.pagination,
  });
});

/**
 * Get Applications for a Specific Job
 * @route GET /api/v1/company/jobs/:jobId/applications
 */
export const getJobApplicationsHandler = asyncHandler(async (req, res, _next) => {
  const queryParams = { ...req.query, jobId: req.params.jobId };
  const result = await getCompanyApplications(req.user._id, queryParams);

  return sendResponse(res, 200, true, 'Job applications retrieved successfully', {
    jobId: req.params.jobId,
    applications: result.applications,
    pagination: result.pagination,
  });
});

/**
 * Get Single Application Details (Company)
 * @route GET /api/v1/company/applications/:id
 */
export const getCompanyApplicationByIdHandler = asyncHandler(async (req, res, _next) => {
  const application = await getCompanyApplicationById(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Application details retrieved successfully', { application });
});

/**
 * Update Application Status (Company Only)
 * @route PATCH /api/v1/company/applications/:id/status
 */
export const updateStatusHandler = asyncHandler(async (req, res, _next) => {
  const { status, notes, interviewDate } = req.body;
  const application = await updateApplicationStatus(req.params.id, req.user._id, {
    status,
    notes,
    interviewDate,
  });

  return sendResponse(res, 200, true, `Application status updated to ${status}`, { application });
});

/**
 * Rate Candidate Application (0 to 5) (Company Only)
 * @route PATCH /api/v1/company/applications/:id/rating
 */
export const updateRatingHandler = asyncHandler(async (req, res, _next) => {
  const { rating } = req.body;
  const application = await updateApplicationRating(req.params.id, req.user._id, rating);

  return sendResponse(res, 200, true, `Candidate rating updated to ${rating}`, { application });
});

/**
 * Provide Structured Feedback (Company Only)
 * @route PATCH /api/v1/company/applications/:id/feedback
 */
export const updateFeedbackHandler = asyncHandler(async (req, res, _next) => {
  const { feedback } = req.body;
  const application = await updateApplicationFeedback(req.params.id, req.user._id, feedback);

  return sendResponse(res, 200, true, 'Application feedback updated successfully', { application });
});
