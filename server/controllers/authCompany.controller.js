import jwt from 'jsonwebtoken';
import { Company } from '../models/company.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { generateToken } from '../utils/generateToken.js';
import { generateRefreshToken } from '../utils/generateRefreshToken.js';
import { hashToken, generateRandomToken } from '../utils/hashToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import { env } from '../config/env.js';
import { ROLES } from '../config/constants.js';

/**
 * Register Company
 * @route POST /api/v1/auth/company/register
 */
export const registerCompany = asyncHandler(async (req, res, next) => {
  const { companyName, email, password, website, industry } = req.body;

  const existingCompany = await Company.findOne({ email: email.toLowerCase() });
  if (existingCompany) {
    return next(new AppError('A company account with this email already exists.', 409));
  }

  // Generate Email Verification Token
  const rawVerificationToken = generateRandomToken();
  const hashedVerificationToken = hashToken(rawVerificationToken);

  const company = await Company.create({
    companyName: companyName.trim(),
    email: email.toLowerCase().trim(),
    password,
    website: website ? website.trim() : '',
    industry: industry ? industry.trim() : '',
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  const payload = { id: company._id, role: ROLES.COMPANY };
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store SHA-256 HASHED refresh token in DB
  company.refreshTokens = [hashToken(refreshToken)];
  await company.save({ validateBeforeSave: false });

  // Send verification email
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${rawVerificationToken}&type=company`;
  await sendEmail({
    to: company.email,
    subject: 'SkillBridge AI - Verify Company Email',
    text: `Welcome to SkillBridge AI! Please verify your company email address: ${verifyUrl}`,
    html: `<h3>Welcome to SkillBridge AI!</h3><p>Please click <a href="${verifyUrl}">here</a> to verify your company email address.</p>`,
  });

  // Set HTTP-Only Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const companyData = {
    id: company._id,
    companyName: company.companyName,
    email: company.email,
    website: company.website,
    industry: company.industry,
    role: company.role,
    isEmailVerified: company.isEmailVerified,
    profileCompleted: company.profileCompleted,
    createdAt: company.createdAt,
  };

  return sendResponse(res, 201, true, 'Company registered successfully. Please check your email to verify your account.', {
    user: companyData,
    accessToken,
    refreshToken,
  });
});

/**
 * Login Company
 * @route POST /api/v1/auth/company/login
 */
export const loginCompany = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const company = await Company.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');
  if (!company || !(await company.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const payload = { id: company._id, role: ROLES.COMPANY };
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store SHA-256 HASHED refresh token in DB
  const hashedRefToken = hashToken(refreshToken);
  company.refreshTokens = company.refreshTokens || [];
  company.refreshTokens.push(hashedRefToken);
  if (company.refreshTokens.length > 5) {
    company.refreshTokens.shift();
  }
  await company.save({ validateBeforeSave: false });

  // Set HTTP-Only Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const companyData = {
    id: company._id,
    companyName: company.companyName,
    email: company.email,
    website: company.website,
    industry: company.industry,
    role: company.role,
    isEmailVerified: company.isEmailVerified,
    profileCompleted: company.profileCompleted,
    createdAt: company.createdAt,
  };

  return sendResponse(res, 200, true, 'Company logged in successfully', {
    user: companyData,
    accessToken,
    refreshToken,
  });
});

/**
 * Verify Email Company
 * @route POST /api/v1/auth/company/verify-email
 */
export const verifyEmailCompany = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Verification token is required.', 400));
  }

  const hashedToken = hashToken(token);
  const company = await Company.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!company) {
    return next(new AppError('Invalid or expired verification token.', 400));
  }

  company.isEmailVerified = true;
  company.emailVerificationToken = undefined;
  company.emailVerificationExpires = undefined;
  await company.save({ validateBeforeSave: false });

  return sendResponse(res, 200, true, 'Email verified successfully!', null);
});

/**
 * Forgot Password Company
 * @route POST /api/v1/auth/company/forgot-password
 */
export const forgotPasswordCompany = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address.', 400));
  }

  const company = await Company.findOne({ email: email.toLowerCase() });
  if (!company) {
    return sendResponse(res, 200, true, 'If an account exists with that email, a password reset link has been sent.', null);
  }

  const resetToken = generateRandomToken();
  company.resetPasswordToken = hashToken(resetToken);
  company.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes
  await company.save({ validateBeforeSave: false });

  const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}?type=company`;
  await sendEmail({
    to: company.email,
    subject: 'SkillBridge AI - Password Reset Request',
    text: `You requested a password reset. Please click the link to reset your password: ${resetUrl}`,
    html: `<h3>Password Reset Request</h3><p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 10 minutes.</p>`,
  });

  return sendResponse(res, 200, true, 'Password reset email sent successfully.', null);
});

/**
 * Reset Password Company
 * @route POST /api/v1/auth/company/reset-password/:token
 */
export const resetPasswordCompany = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long.', 400));
  }

  const hashedToken = hashToken(token);
  const company = await Company.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!company) {
    return next(new AppError('Invalid or expired password reset token.', 400));
  }

  company.password = password;
  company.resetPasswordToken = undefined;
  company.resetPasswordExpires = undefined;
  company.refreshTokens = []; // Revoke previous sessions
  await company.save();

  return sendResponse(res, 200, true, 'Password reset successful! You can now log in with your new password.', null);
});

/**
 * Refresh Company Access Token
 * @route POST /api/v1/auth/company/refresh-token
 */
export const refreshTokenCompany = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required.', 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

    if (decoded.role !== ROLES.COMPANY) {
      return next(new AppError('Invalid token role.', 403));
    }

    const hashedRefToken = hashToken(refreshToken);
    const company = await Company.findById(decoded.id).select('+refreshTokens');
    if (!company || !company.refreshTokens.includes(hashedRefToken)) {
      return next(new AppError('Invalid or revoked refresh token.', 401));
    }

    const payload = { id: company._id, role: ROLES.COMPANY };
    const newAccessToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Rotate refresh token
    const newHashedToken = hashToken(newRefreshToken);
    company.refreshTokens = company.refreshTokens.filter((token) => token !== hashedRefToken);
    company.refreshTokens.push(newHashedToken);
    await company.save({ validateBeforeSave: false });

    // Set HTTP-Only Cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 200, true, 'Tokens refreshed successfully', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return next(new AppError('Expired or invalid refresh token.', 401));
  }
});

/**
 * Logout Company
 * @route POST /api/v1/auth/company/logout
 */
export const logoutCompany = asyncHandler(async (req, res, _next) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken && req.user) {
    const hashedRefToken = hashToken(refreshToken);
    const company = await Company.findById(req.user._id).select('+refreshTokens');
    if (company) {
      company.refreshTokens = company.refreshTokens.filter((token) => token !== hashedRefToken);
      await company.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie('refreshToken');
  return sendResponse(res, 200, true, 'Logged out successfully', null);
});

/**
 * Get Current Company Profile
 * @route GET /api/v1/auth/company/me
 */
export const getMeCompany = asyncHandler(async (req, res, _next) => {
  return sendResponse(res, 200, true, 'Company profile retrieved', { user: req.user });
});
