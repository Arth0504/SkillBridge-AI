import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  createVideoInterviewService,
  startCandidateVideoInterviewService,
  submitVideoResponseService,
  finishVideoInterviewService,
  getVideoInterviewByIdService,
  getCandidateVideoHistoryService,
  deleteVideoInterviewService,
} from '../services/videoInterview.service.js';

/**
 * Schedule / Create Video Interview
 * @route POST /api/v1/candidate/video-interview/start
 */
export const startVideoInterviewHandler = asyncHandler(async (req, res, _next) => {
  const { companyId, jobId, title, description, interviewType, customQuestions, totalQuestions } = req.body;

  const videoInterview = await createVideoInterviewService({
    companyIdStr: companyId,
    candidateIdStr: req.user._id,
    jobIdStr: jobId,
    title: title || 'Asynchronous AI Video Interview',
    description: description || '',
    interviewType: interviewType || 'HR',
    customQuestions: customQuestions || [],
    totalQuestions: totalQuestions || 3,
  });

  return sendResponse(res, 201, true, 'AI video interview scheduled and initialized successfully', { videoInterview });
});

/**
 * Start Active Video Interview Session
 * @route POST /api/v1/candidate/video-interview/:id/start-session
 */
export const startCandidateSessionHandler = asyncHandler(async (req, res, _next) => {
  const interview = await startCandidateVideoInterviewService(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Video interview session started', { interview });
});

/**
 * Get Video Interview Details by ID
 * @route GET /api/v1/candidate/video-interview/:id
 */
export const getVideoInterviewByIdHandler = asyncHandler(async (req, res, _next) => {
  const interview = await getVideoInterviewByIdService(req.params.id, req.user);

  return sendResponse(res, 200, true, 'Video interview details retrieved successfully', { interview });
});

/**
 * Submit Video Response & Process AI Transcript Evaluation
 * @route POST /api/v1/candidate/video-interview/:id/submit-video
 */
export const submitVideoResponseHandler = asyncHandler(async (req, res, next) => {
  const { questionId, videoUrl, thumbnailUrl, durationSeconds, fileSizeBytes, resolution, transcriptText } = req.body;

  if (!questionId || !videoUrl) {
    return next(new AppError('questionId and videoUrl are required.', 400));
  }

  const result = await submitVideoResponseService({
    interviewId: req.params.id,
    candidateIdStr: req.user._id,
    questionId,
    videoUrl,
    thumbnailUrl: thumbnailUrl || '',
    durationSeconds: durationSeconds || 60,
    fileSizeBytes: fileSizeBytes || 1000000,
    resolution: resolution || '1280x720',
    transcriptText: transcriptText || '',
  });

  return sendResponse(res, 200, true, 'Video response submitted and evaluated successfully', result);
});

/**
 * Finish Video Interview & Generate Executive Report
 * @route POST /api/v1/candidate/video-interview/:id/finish
 */
export const finishVideoInterviewHandler = asyncHandler(async (req, res, _next) => {
  const interview = await finishVideoInterviewService(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Video interview completed & report compiled', { interview });
});

/**
 * Get Candidate's Video Interview History List
 * @route GET /api/v1/candidate/video-interview/history
 */
export const getCandidateVideoHistoryHandler = asyncHandler(async (req, res, _next) => {
  const data = await getCandidateVideoHistoryService(req.user._id, req.query);

  return sendResponse(res, 200, true, 'Video interview history retrieved successfully', data);
});

/**
 * Soft Delete Video Interview Session Record
 * @route DELETE /api/v1/candidate/video-interview/history/:id
 */
export const deleteVideoInterviewHandler = asyncHandler(async (req, res, _next) => {
  const result = await deleteVideoInterviewService(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Video interview record deleted successfully', result);
});
