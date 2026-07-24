import express from 'express';
import {
  registerCompany,
  loginCompany,
  verifyEmailCompany,
  forgotPasswordCompany,
  resetPasswordCompany,
  refreshTokenCompany,
  logoutCompany,
  getMeCompany,
} from '../controllers/authCompany.controller.js';
import {
  validateCompanyRegister,
  validateCompanyLogin,
} from '../validations/authCompany.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/security.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/register', authLimiter, validateCompanyRegister, registerCompany);
router.post('/login', authLimiter, validateCompanyLogin, loginCompany);
router.post('/verify-email', verifyEmailCompany);
router.post('/forgot-password', authLimiter, forgotPasswordCompany);
router.post('/reset-password/:token', authLimiter, resetPasswordCompany);
router.post('/refresh-token', authLimiter, refreshTokenCompany);

// Protected routes
router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

router.post('/logout', logoutCompany);
router.get('/me', getMeCompany);

export default router;
