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
  const { companyId, jobId, title, description, interviewType, customQuestions, totalQuestions } = req.body || {};

  const result = await createVideoInterviewService({
    companyIdStr: companyId,
    candidateIdStr: req.user?._id,
    jobIdStr: jobId,
    title: title || 'Asynchronous AI Video Interview',
    description: description || '',
    interviewType: interviewType || 'HR',
    customQuestions: customQuestions || [],
    totalQuestions: totalQuestions || 3,
  });

  return sendResponse(res, 200, true, 'AI video interview scheduled and initialized successfully', {
    videoInterview: result.videoInterview,
    interview: result.videoInterview,
    interviewId: result.interviewId,
    sessionToken: result.sessionToken,
    greetingText: result.greetingText,
    firstQuestion: result.firstQuestion,
  });
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
 * Record Integrity / Proctoring Violation Event
 * @route POST /api/v1/candidate/video-interview/:id/integrity-event
 */
export const recordIntegrityEventHandler = asyncHandler(async (req, res, next) => {
  const { eventType, questionIndex = 0, autoTerminate = true, terminationReason = '' } = req.body;

  const ALLOWED_EVENTS = ['FULLSCREEN_EXIT', 'TAB_SWITCH', 'WINDOW_BLUR', 'CAMERA_OFF', 'MIC_MUTED', 'COPY_PASTE', 'CONTEXT_MENU', 'KEYBOARD_BLOCK', 'DEVTOOLS_OPEN', 'ESC_KEY_PRESSED'];
  if (!eventType || !ALLOWED_EVENTS.includes(eventType)) {
    return next(new AppError('Invalid or missing eventType.', 400));
  }

  const { VideoInterview } = await import('../models/videoInterview.model.js');
  const interview = await VideoInterview.findOne({
    _id: req.params.id,
    candidateId: req.user._id,
    isDeleted: { $ne: true },
  });

  if (!interview) {
    return next(new AppError('Video interview session not found.', 404));
  }

  if (interview.status === 'Completed' || interview.status === 'Failed' || interview.autoTerminated) {
    return next(new AppError('This interview session has reached a terminal state and is read-only.', 400));
  }

  // ZERO TOLERANCE: Any single violation drops score to 0 and auto-terminates session as FAILED
  const penalty = 100;
  const reasonText = terminationReason || `Zero Tolerance Integrity Violation: ${eventType}`;

  interview.integrityScore = 0;
  interview.integrityEvents.push({ eventType, questionIndex, penaltyApplied: penalty, timestamp: new Date() });
  interview.warningCount = (interview.warningCount || 0) + 1;
  interview.warnings.push({ reason: reasonText, questionIndex, timestamp: new Date() });

  interview.status = 'Completed';
  interview.autoTerminated = true;
  interview.terminationReason = reasonText;
  interview.completedAt = new Date();

  await interview.save();

  return sendResponse(res, 200, true, 'Zero Tolerance Integrity Event Recorded - Interview Terminated', {
    integrityScore: 0,
    warningCount: interview.warningCount,
    autoTerminated: true,
    terminationReason: interview.terminationReason,
    interview,
  });
});

/**
 * Soft Delete Video Interview Session Record
 * @route DELETE /api/v1/candidate/video-interview/history/:id
 */
export const deleteVideoInterviewHandler = asyncHandler(async (req, res, _next) => {
  const result = await deleteVideoInterviewService(req.params.id, req.user._id);

  return sendResponse(res, 200, true, 'Video interview record deleted successfully', result);
});
