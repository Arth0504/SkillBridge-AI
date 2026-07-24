import jwt from 'jsonwebtoken';
import { Candidate } from '../models/candidate.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { generateToken } from '../utils/generateToken.js';
import { generateRefreshToken } from '../utils/generateRefreshToken.js';
import { hashToken, generateRandomToken } from '../utils/hashToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import { env } from '../config/env.js';
import { ROLES } from '../config/constants.js';
import { getIpAddress, setAuthCookies, clearAuthCookies } from '../utils/securityUtils.js';
import { logSecurityEvent, createSessionService, rotateSessionService, revokeAllUserSessionsService } from '../services/securityAudit.service.js';

/**
 * Register Candidate
 * @route POST /api/v1/auth/candidate/register
 */
export const registerCandidate = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  const existingCandidate = await Candidate.findOne({ email: email.toLowerCase() });
  if (existingCandidate) {
    return next(new AppError('A candidate account with this email already exists.', 409));
  }

  // Generate Email Verification Token
  const rawVerificationToken = generateRandomToken();
  const hashedVerificationToken = hashToken(rawVerificationToken);

  const candidate = await Candidate.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone ? phone.trim() : '',
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 Hours
  });

  const payload = { id: candidate._id, role: ROLES.CANDIDATE };
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store SHA-256 HASHED refresh token in DB
  candidate.refreshTokens = [hashToken(refreshToken)];
  await candidate.save({ validateBeforeSave: false });

  // Send verification email
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${rawVerificationToken}&type=candidate`;
  await sendEmail({
    to: candidate.email,
    subject: 'SkillBridge AI - Verify Your Email',
    text: `Welcome to SkillBridge AI! Please verify your email by clicking the link: ${verifyUrl}`,
    html: `<h3>Welcome to SkillBridge AI!</h3><p>Please click <a href="${verifyUrl}">here</a> to verify your email address.</p>`,
  });

  // Set HTTP-Only Cookie for Refresh Token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const candidateData = {
    id: candidate._id,
    fullName: candidate.fullName,
    email: candidate.email,
    phone: candidate.phone,
    role: candidate.role,
    isEmailVerified: candidate.isEmailVerified,
    profileCompleted: candidate.profileCompleted,
    createdAt: candidate.createdAt,
  };

  return sendResponse(res, 201, true, 'Candidate registered successfully. Please check your email to verify your account.', {
    user: candidateData,
    accessToken,
    refreshToken,
  });
});

/**
 * Login Candidate
 * @route POST /api/v1/auth/candidate/login
 */
export const loginCandidate = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const ipAddress = getIpAddress(req);
  const userAgent = req.headers['user-agent'] || '';

  const candidate = await Candidate.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens +failedLoginAttempts +lockUntil');

  if (!candidate) {
    await logSecurityEvent({
      action: 'LOGIN_FAILED',
      ipAddress,
      userAgent,
      status: 'FAILURE',
      details: { email, reason: 'Candidate account not found' },
    });
    return next(new AppError('Invalid email or password.', 401));
  }

  // Account Lockout check (5 failed attempts locks for 15 minutes)
  if (candidate.isLocked()) {
    const remainingMinutes = Math.ceil((candidate.lockUntil - Date.now()) / (60 * 1000));
    await logSecurityEvent({
      userId: candidate._id,
      userModel: 'Candidate',
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      ipAddress,
      userAgent,
      status: 'WARNING',
      details: { reason: 'Attempted login to locked account' },
    });
    return next(new AppError(`Account is temporarily locked due to consecutive failed login attempts. Try again in ${remainingMinutes} minute(s).`, 423));
  }

  const isMatch = await candidate.comparePassword(password);
  if (!isMatch) {
    await candidate.incFailedLoginAttempts();
    const updatedCandidate = await Candidate.findById(candidate._id);

    if (updatedCandidate && updatedCandidate.isLocked()) {
      await logSecurityEvent({
        userId: candidate._id,
        userModel: 'Candidate',
        action: 'ACCOUNT_LOCKED',
        ipAddress,
        userAgent,
        status: 'WARNING',
        details: { reason: '5 consecutive failed password attempts' },
      });
      return next(new AppError('Account locked due to 5 consecutive failed login attempts. Please try again after 15 minutes.', 423));
    }

    await logSecurityEvent({
      userId: candidate._id,
      userModel: 'Candidate',
      action: 'LOGIN_FAILED',
      ipAddress,
      userAgent,
      status: 'FAILURE',
      details: { failedAttempts: updatedCandidate ? updatedCandidate.failedLoginAttempts : 1 },
    });

    return next(new AppError('Invalid email or password.', 401));
  }

  // Reset failed login attempts on successful password match
  await candidate.resetFailedLoginAttempts();

  const payload = { id: candidate._id, role: ROLES.CANDIDATE };
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Create Active Session & Audit Log
  await createSessionService({
    userId: candidate._id,
    userModel: 'Candidate',
    refreshToken,
    req,
  });

  // Set HTTP-Only Secure Cookies
  setAuthCookies(res, accessToken, refreshToken);

  const candidateData = {
    id: candidate._id,
    fullName: candidate.fullName,
    email: candidate.email,
    phone: candidate.phone,
    role: candidate.role,
    isEmailVerified: candidate.isEmailVerified,
    profileCompleted: candidate.profileCompleted,
    createdAt: candidate.createdAt,
  };

  return sendResponse(res, 200, true, 'Candidate logged in successfully', {
    user: candidateData,
    accessToken,
    refreshToken,
  });
});

/**
 * Verify Email Candidate
 * @route POST /api/v1/auth/candidate/verify-email
 */
export const verifyEmailCandidate = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Verification token is required.', 400));
  }

  const hashedToken = hashToken(token);
  const candidate = await Candidate.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!candidate) {
    return next(new AppError('Invalid or expired verification token.', 400));
  }

  candidate.isEmailVerified = true;
  candidate.emailVerificationToken = undefined;
  candidate.emailVerificationExpires = undefined;
  await candidate.save({ validateBeforeSave: false });

  return sendResponse(res, 200, true, 'Email verified successfully!', null);
});

/**
 * Forgot Password Candidate
 * @route POST /api/v1/auth/candidate/forgot-password
 */
export const forgotPasswordCandidate = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address.', 400));
  }

  const candidate = await Candidate.findOne({ email: email.toLowerCase() });
  if (!candidate) {
    return sendResponse(res, 200, true, 'If an account exists with that email, a password reset link has been sent.', null);
  }

  const resetToken = generateRandomToken();
  candidate.resetPasswordToken = hashToken(resetToken);
  candidate.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes
  await candidate.save({ validateBeforeSave: false });

  const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}?type=candidate`;
  await sendEmail({
    to: candidate.email,
    subject: 'SkillBridge AI - Password Reset Request',
    text: `You requested a password reset. Please click the link to reset your password: ${resetUrl}`,
    html: `<h3>Password Reset Request</h3><p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 10 minutes.</p>`,
  });

  return sendResponse(res, 200, true, 'Password reset email sent successfully.', null);
});

/**
 * Reset Password Candidate
 * @route POST /api/v1/auth/candidate/reset-password/:token
 */
export const resetPasswordCandidate = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long.', 400));
  }

  const hashedToken = hashToken(token);
  const candidate = await Candidate.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!candidate) {
    return next(new AppError('Invalid or expired password reset token.', 400));
  }

  candidate.password = password;
  candidate.resetPasswordToken = undefined;
  candidate.resetPasswordExpires = undefined;
  candidate.refreshTokens = []; // Revoke previous sessions
  await candidate.save();

  return sendResponse(res, 200, true, 'Password reset successful! You can now log in with your new password.', null);
});

/**
 * Refresh Candidate Access Token (Refresh Token Rotation)
 * @route POST /api/v1/auth/candidate/refresh-token
 */
export const refreshTokenCandidate = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required.', 400));
  }

  const rotated = await rotateSessionService(refreshToken, req);
  setAuthCookies(res, rotated.accessToken, rotated.refreshToken);

  return sendResponse(res, 200, true, 'Tokens refreshed successfully (rotated)', {
    accessToken: rotated.accessToken,
    refreshToken: rotated.refreshToken,
  });
});

/**
 * Logout Candidate
 * @route POST /api/v1/auth/candidate/logout
 */
export const logoutCandidate = asyncHandler(async (req, res, _next) => {
  if (req.user) {
    await revokeAllUserSessionsService(req.user._id, 'Candidate');
  }
  clearAuthCookies(res);
  return sendResponse(res, 200, true, 'Logged out successfully', null);
});

/**
 * Get Current Candidate Profile
 * @route GET /api/v1/auth/candidate/me
 */
export const getMeCandidate = asyncHandler(async (req, res, _next) => {
  return sendResponse(res, 200, true, 'Candidate profile retrieved', { user: req.user });
});
