import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  getCandidateInterviewsService,
  getInterviewByIdService,
} from '../services/interview.service.js';

/**
 * Get Candidate Interviews List (Read-only)
 * @route GET /api/v1/candidate/interviews
 */
export const getCandidateInterviewsHandler = asyncHandler(async (req, res, _next) => {
  const result = await getCandidateInterviewsService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Candidate interviews retrieved successfully', result);
});

/**
 * Get Single Interview Details (Candidate Read-only)
 * @route GET /api/v1/candidate/interviews/:id
 */
export const getCandidateInterviewByIdHandler = asyncHandler(async (req, res, _next) => {
  const interview = await getInterviewByIdService(req.params.id, req.user._id, 'candidate');

  return sendResponse(res, 200, true, 'Interview details retrieved successfully', { interview });
});
