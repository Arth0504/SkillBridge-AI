import express from 'express';
import {
  getCandidateProfile,
  updateCandidateProfile,
  uploadResume,
  uploadAvatar,
} from '../controllers/profileCandidate.controller.js';
import { validateCandidateProfileUpdate } from '../validations/profileCandidate.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All profile endpoints require candidate authentication
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

router.get('/', getCandidateProfile);
router.put('/', validateCandidateProfileUpdate, updateCandidateProfile);
router.post('/resume', upload.single('resume'), uploadResume);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
