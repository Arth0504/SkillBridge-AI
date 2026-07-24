import express from 'express';
import multer from 'multer';
import {
  analyzeResumeHandler,
  getResumeHistoryHandler,
  getResumeHistoryByIdHandler,
  deleteResumeHistoryHandler,
} from '../controllers/aiResume.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

const router = express.Router();

// Guard AI Resume routes for authenticated Candidates only
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

/**
 * @route POST /api/v1/candidate/resume/analyze
 * @desc Analyze resume PDF/DOCX file or text against ATS rules & job requirements
 */
router.post('/analyze', uploadMemory.single('resume'), analyzeResumeHandler);

/**
 * @route GET /api/v1/candidate/resume/history
 * @desc Get candidate's past resume analysis history list
 */
router.get('/history', getResumeHistoryHandler);

/**
 * @route GET /api/v1/candidate/resume/history/:id
 * @desc Get single analysis history record details
 */
router.get('/history/:id', getResumeHistoryByIdHandler);

/**
 * @route DELETE /api/v1/candidate/resume/history/:id
 * @desc Delete an analysis history record
 */
router.delete('/history/:id', deleteResumeHistoryHandler);

export default router;
