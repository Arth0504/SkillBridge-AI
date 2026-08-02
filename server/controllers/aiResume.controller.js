import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  analyzeResumeService,
  getResumeHistoryService,
  getResumeHistoryByIdService,
  deleteResumeHistoryService,
  parseAndAutoFillResumeService,
  analyzeATSKeywordsService,
} from '../services/aiResume.service.js';

/**
 * Upload & Auto-Fill Candidate Profile from Resume (Module 1)
 * @route POST /api/v1/candidate/resume/parse-autofill
 */
export const parseResumeHandler = asyncHandler(async (req, res, next) => {
  const file = req.file;
  if (!file) {
    return next(new AppError('Please upload a resume PDF/DOCX file.', 400));
  }

  const result = await parseAndAutoFillResumeService(
    req.user._id,
    file.buffer,
    file.originalname
  );

  return sendResponse(res, 200, true, 'Resume parsed and profile auto-filled successfully.', result);
});

/**
 * ATS Keyword Analysis (Module 2)
 * @route POST /api/v1/candidate/resume/ats-keywords
 */
export const analyzeATSKeywordsHandler = asyncHandler(async (req, res, _next) => {
  const { resumeText, jobDescription, jobId } = req.body;

  const result = await analyzeATSKeywordsService({
    candidateIdStr: req.user._id,
    jobIdStr: jobId || null,
    resumeText: resumeText || '',
    jobDescription: jobDescription || '',
  });

  return sendResponse(res, 200, true, 'ATS Keyword Analysis completed successfully.', { atsAnalysis: result });
});

/**
 * Upload & Analyze Resume (ATS Score & Job Match)
 * @route POST /api/v1/candidate/resume/analyze
 */
export const analyzeResumeHandler = asyncHandler(async (req, res, next) => {
  const file = req.file;
  const { resumeText, jobId } = req.body;

  if (!file && (!resumeText || !resumeText.trim())) {
    return next(new AppError('Please provide a resume PDF/DOCX file or raw resume text to analyze.', 400));
  }

  if (file) {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowedMimeTypes.includes(file.mimetype) && !file.originalname.match(/\.(pdf|docx)$/i)) {
      return next(new AppError('Only PDF and DOCX resume formats are supported.', 400));
    }

    if (file.size > 5 * 1024 * 1024) {
      return next(new AppError('File size exceeds the maximum limit of 5 MB.', 400));
    }
  }

  const analysis = await analyzeResumeService({
    candidateIdStr: req.user._id,
    jobIdStr: jobId || null,
    fileBuffer: file ? file.buffer : null,
    fileName: file ? file.originalname : 'ResumeText.txt',
    fileMimeType: file ? file.mimetype : 'text/plain',
    rawText: resumeText || '',
  });

  return sendResponse(res, 200, true, 'Resume analysis completed successfully', { analysis });
});

/**
 * Get Resume Analysis History List
 * @route GET /api/v1/candidate/resume/history
 */
export const getResumeHistoryHandler = asyncHandler(async (req, res, _next) => {
  const data = await getResumeHistoryService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Resume analysis history retrieved successfully', data);
});

/**
 * Get Single Resume Analysis History Detail by ID
 * @route GET /api/v1/candidate/resume/history/:id
 */
export const getResumeHistoryByIdHandler = asyncHandler(async (req, res, _next) => {
  const record = await getResumeHistoryByIdService(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Resume analysis record retrieved successfully', { record });
});

/**
 * Delete Resume Analysis History Record
 * @route DELETE /api/v1/candidate/resume/history/:id
 */
export const deleteResumeHistoryHandler = asyncHandler(async (req, res, _next) => {
  const result = await deleteResumeHistoryService(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Resume analysis record deleted successfully', result);
});
