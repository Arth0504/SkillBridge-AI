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
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/register', validateCompanyRegister, registerCompany);
router.post('/login', validateCompanyLogin, loginCompany);
router.post('/verify-email', verifyEmailCompany);
router.post('/forgot-password', forgotPasswordCompany);
router.post('/reset-password/:token', resetPasswordCompany);
router.post('/refresh-token', refreshTokenCompany);

// Protected routes
router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

router.post('/logout', logoutCompany);
router.get('/me', getMeCompany);

export default router;
