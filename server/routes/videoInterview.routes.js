import express from 'express';
import {
  startVideoInterviewHandler,
  startCandidateSessionHandler,
  getVideoInterviewByIdHandler,
  submitVideoResponseHandler,
  finishVideoInterviewHandler,
  getCandidateVideoHistoryHandler,
  deleteVideoInterviewHandler,
  recordIntegrityEventHandler,
} from '../controllers/videoInterview.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Guard AI Video Interview routes for authenticated users
router.use(protect);

/**
 * @route POST /api/v1/candidate/video-interview/start
 * @desc Initialize & schedule a new AI video interview session
 */
router.post('/start', restrictTo(ROLES.CANDIDATE), startVideoInterviewHandler);

/**
 * @route GET /api/v1/candidate/video-interview/history
 * @desc Get candidate's past AI video interview history list
 */
router.get('/history', restrictTo(ROLES.CANDIDATE), getCandidateVideoHistoryHandler);

/**
 * @route GET /api/v1/candidate/video-interview/:id
 * @desc Get details of a single video interview session (Candidate or Company)
 */
router.get('/:id', getVideoInterviewByIdHandler);

/**
 * @route POST /api/v1/candidate/video-interview/:id/start-session
 * @desc Start candidate active video interview session
 */
router.post('/:id/start-session', restrictTo(ROLES.CANDIDATE), startCandidateSessionHandler);

/**
 * @route POST /api/v1/candidate/video-interview/:id/submit-video
 * @desc Submit Cloudinary video response & process Gemini AI transcript evaluation
 */
router.post('/:id/submit-video', restrictTo(ROLES.CANDIDATE), submitVideoResponseHandler);

/**
 * @route POST /api/v1/candidate/video-interview/:id/finish
 * @desc Finish video interview & generate final executive report
 */
router.post('/:id/finish', restrictTo(ROLES.CANDIDATE), finishVideoInterviewHandler);

/**
 * @route POST /api/v1/candidate/video-interview/:id/integrity-event
 * @desc Record a proctoring violation event (tab switch, fullscreen exit, etc.)
 */
router.post('/:id/integrity-event', restrictTo(ROLES.CANDIDATE), recordIntegrityEventHandler);

/**
 * @route DELETE /api/v1/candidate/video-interview/history/:id
 * @desc Delete a video interview session record
 */
router.delete('/history/:id', restrictTo(ROLES.CANDIDATE), deleteVideoInterviewHandler);

export default router;
