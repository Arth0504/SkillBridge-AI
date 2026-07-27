import express from 'express';
import {
  getCandidateProfile,
  updateCandidateProfile,
  uploadResume,
  uploadAvatar,
  getPublicCandidateProfile,
} from '../controllers/profileCandidate.controller.js';
import { validateCandidateProfileUpdate } from '../validations/profileCandidate.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadResume as uploadResumeMiddleware, uploadAvatar as uploadAvatarMiddleware } from '../middleware/upload.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public candidate profile endpoint (Unrestricted)
router.get('/public/:id', getPublicCandidateProfile);

// Protected candidate profile endpoints
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

router.get('/', getCandidateProfile);
router.put('/', validateCandidateProfileUpdate, updateCandidateProfile);
router.post('/resume', uploadResumeMiddleware.single('resume'), uploadResume);
router.post('/avatar', uploadAvatarMiddleware.single('avatar'), uploadAvatar);

export default router;
