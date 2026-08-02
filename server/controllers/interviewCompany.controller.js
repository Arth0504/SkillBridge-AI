import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  createInterviewService,
  updateInterviewService,
  updateInterviewStatusService,
  addInterviewFeedbackService,
  getCompanyInterviewsService,
  getInterviewByIdService,
} from '../services/interview.service.js';

/**
 * Schedule New Interview (Company Only)
 * @route POST /api/v1/company/interviews
 */
export const createInterviewHandler = asyncHandler(async (req, res, _next) => {
  const result = await createInterviewService(req.user._id, req.body);

  return sendResponse(res, 201, true, 'Interview scheduled successfully', {
    interview: result.interview || result,
    roomId: result.roomId || result.interview?.meetingLink?.replace('/interview/room/', '') || '',
  });
});

/**
 * Update Interview Details (Company Only)
 * @route PUT /api/v1/company/interviews/:id
 */
export const updateInterviewHandler = asyncHandler(async (req, res, _next) => {
  const interview = await updateInterviewService(req.params.id, req.user._id, req.body);

  return sendResponse(res, 200, true, 'Interview updated successfully', { interview });
});

/**
 * Update Interview Status (Company Only)
 * @route PATCH /api/v1/company/interviews/:id/status
 */
export const updateInterviewStatusHandler = asyncHandler(async (req, res, _next) => {
  const { status } = req.body;
  const interview = await updateInterviewStatusService(req.params.id, req.user._id, status);

  return sendResponse(res, 200, true, `Interview status updated to ${status}`, { interview });
});

/**
 * Submit Interview Feedback & Rating (Company Only)
 * @route PATCH /api/v1/company/interviews/:id/feedback
 */
export const addInterviewFeedbackHandler = asyncHandler(async (req, res, _next) => {
  const interview = await addInterviewFeedbackService(req.params.id, req.user._id, req.body);

  return sendResponse(res, 200, true, 'Interview feedback submitted successfully', { interview });
});

/**
 * Get Company Interviews List
 * @route GET /api/v1/company/interviews
 */
export const getCompanyInterviewsHandler = asyncHandler(async (req, res, _next) => {
  const result = await getCompanyInterviewsService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Company interviews retrieved successfully', result);
});

/**
 * Get Single Interview Details (Company)
 * @route GET /api/v1/company/interviews/:id
 */
export const getCompanyInterviewByIdHandler = asyncHandler(async (req, res, _next) => {
  const interview = await getInterviewByIdService(req.params.id, req.user._id, 'company');

  return sendResponse(res, 200, true, 'Interview details retrieved successfully', { interview });
});

/**
 * Delete Interview (Company Only - Soft Delete)
 * @route DELETE /api/v1/company/interviews/:id
 */
export const deleteInterviewHandler = asyncHandler(async (req, res, _next) => {
  const { deleteInterviewService } = await import('../services/interview.service.js');
  const result = await deleteInterviewService(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Interview deleted successfully', result);
});
