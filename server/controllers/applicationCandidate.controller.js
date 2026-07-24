import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  submitApplication,
  getCandidateApplications,
  getCandidateApplicationById,
  withdrawApplication,
} from '../services/application.service.js';

/**
 * Apply to Job Vacancy (Candidate Only)
 * @route POST /api/v1/jobs/:jobId/apply
 */
export const applyToJobHandler = asyncHandler(async (req, res, _next) => {
  const { jobId } = req.params;
  const { coverLetter, resumeUrl } = req.body;

  const application = await submitApplication({
    candidateId: req.user._id,
    jobId,
    coverLetter,
    customResumeUrl: resumeUrl,
  });

  return sendResponse(res, 201, true, 'Job application submitted successfully', { application });
});

/**
 * Get All Applications Submitted by Authenticated Candidate
 * @route GET /api/v1/candidate/applications
 */
export const getCandidateApplicationsHandler = asyncHandler(async (req, res, _next) => {
  const result = await getCandidateApplications(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Candidate applications retrieved successfully', {
    applications: result.applications,
    pagination: result.pagination,
  });
});

/**
 * Get Candidate Application Details by ID
 * @route GET /api/v1/candidate/applications/:id
 */
export const getCandidateApplicationByIdHandler = asyncHandler(async (req, res, _next) => {
  const application = await getCandidateApplicationById(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Application details retrieved successfully', { application });
});

/**
 * Withdraw Submitted Job Application (Candidate Only)
 * @route PATCH /api/v1/candidate/applications/:id/withdraw
 */
export const withdrawApplicationHandler = asyncHandler(async (req, res, _next) => {
  const application = await withdrawApplication(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Application withdrawn successfully', { application });
});
