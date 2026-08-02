import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { OfferLetter } from '../models/offerLetter.model.js';
import { Application } from '../models/application.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';
import { emailAutomationService } from '../services/emailAutomation.service.js';

/**
 * Generate PDF Offer Letter
 * POST /api/v1/company/offer-letters
 */
export const createOfferLetterHandler = asyncHandler(async (req, res, _next) => {
  const companyId = req.user.companyId || req.user._id;
  const { applicationId, salary, designation, joiningDate, hrSignatureName, currency } = req.body;

  const application = await Application.findById(applicationId)
    .populate('candidateId')
    .populate('jobId')
    .populate('companyId');

  if (!application) {
    throw new AppError('Application record not found.', 404);
  }

  const candidate = application.candidateId;
  const job = application.jobId;
  const company = await Company.findById(companyId);

  const offer = await OfferLetter.create({
    companyId,
    candidateId: candidate._id,
    applicationId: application._id,
    jobId: job._id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    jobTitle: job.title,
    companyName: company.companyName,
    salary: Number(salary || 120000),
    currency: currency || 'USD',
    designation: designation || job.title,
    joiningDate: joiningDate ? new Date(joiningDate) : new Date(Date.now() + 14 * 86400000),
    hrSignatureName: hrSignatureName || 'Head of Talent',
    validUntil: new Date(Date.now() + 7 * 86400000),
    status: 'sent',
  });

  // Update Application status to Offer
  application.status = 'Offer';
  await application.save();

  // Dispatch Offer Email
  emailAutomationService.sendOfferEmail(candidate.email, candidate.fullName, job.title, company.companyName)
    .catch((e) => console.error('Offer email error:', e));

  return sendResponse(res, 201, true, 'PDF Offer letter generated successfully', { offer });
});

/**
 * Get Offer Letters for Company
 * GET /api/v1/company/offer-letters
 */
export const getCompanyOfferLettersHandler = asyncHandler(async (req, res, _next) => {
  const companyId = req.user.companyId || req.user._id;
  const offers = await OfferLetter.find({ companyId }).sort({ createdAt: -1 }).lean();

  return sendResponse(res, 200, true, 'Company offer letters retrieved', { offers });
});

/**
 * Get Single Offer Letter Details
 * GET /api/v1/company/offer-letters/:id
 */
export const getOfferLetterByIdHandler = asyncHandler(async (req, res, _next) => {
  const offer = await OfferLetter.findById(req.params.id).lean();
  if (!offer) {
    throw new AppError('Offer letter not found.', 404);
  }

  return sendResponse(res, 200, true, 'Offer letter retrieved', { offer });
});
