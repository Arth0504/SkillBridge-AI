import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  saveJobService,
  removeSavedJobService,
  getSavedJobsService,
} from '../services/savedJob.service.js';

/**
 * Save a Job Posting
 * @route POST /api/v1/candidate/saved-jobs
 * @route POST /api/v1/candidate/saved-jobs/:jobId
 */
export const saveJobHandler = asyncHandler(async (req, res, _next) => {
  const jobId = req.params.jobId || req.body.jobId;
  const savedJob = await saveJobService(req.user._id, jobId);

  return sendResponse(res, 201, true, 'Job saved successfully', { savedJob });
});

/**
 * Remove a Saved Job
 * @route DELETE /api/v1/candidate/saved-jobs/:jobId
 */
export const removeSavedJobHandler = asyncHandler(async (req, res, _next) => {
  const result = await removeSavedJobService(req.user._id, req.params.jobId);

  return sendResponse(res, 200, true, 'Saved job removed successfully', result);
});

/**
 * List Candidate's Saved Jobs
 * @route GET /api/v1/candidate/saved-jobs
 */
export const getSavedJobsHandler = asyncHandler(async (req, res, _next) => {
  const result = await getSavedJobsService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Saved jobs retrieved successfully', result);
});
