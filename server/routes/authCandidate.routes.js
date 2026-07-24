import express from 'express';
import {
  registerCandidate,
  loginCandidate,
  verifyEmailCandidate,
  forgotPasswordCandidate,
  resetPasswordCandidate,
  refreshTokenCandidate,
  logoutCandidate,
  getMeCandidate,
} from '../controllers/authCandidate.controller.js';
import {
  validateCandidateRegister,
  validateCandidateLogin,
} from '../validations/authCandidate.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/register', validateCandidateRegister, registerCandidate);
router.post('/login', validateCandidateLogin, loginCandidate);
router.post('/verify-email', verifyEmailCandidate);
router.post('/forgot-password', forgotPasswordCandidate);
router.post('/reset-password/:token', resetPasswordCandidate);
router.post('/refresh-token', refreshTokenCandidate);

// Protected routes
router.use(protect);
router.use(restrictTo(ROLES.CANDIDATE));

router.post('/logout', logoutCandidate);
router.get('/me', getMeCandidate);

export default router;
