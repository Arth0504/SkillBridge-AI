import jwt from 'jsonwebtoken';
import { AuditLog } from '../models/auditLog.model.js';
import { Session } from '../models/session.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';
import { hashToken, getIpAddress, parseUserAgent } from '../utils/securityUtils.js';
import { generateToken } from '../utils/generateToken.js';
import { generateRefreshToken } from '../utils/generateRefreshToken.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { ipLocation } from '../utils/geo.js';
import { requestContextStore } from '../middleware/context.middleware.js';

/**
 * Log Security Audit Event
 */
export const logSecurityEvent = async ({
  userId = null,
  userModel = 'Unknown',
  action,
  ipAddress = '127.0.0.1',
  userAgent = '',
  status = 'SUCCESS',
  details = {},
}) => {
  try {
    const context = requestContextStore.getStore();
    const finalIp = context?.ipAddress || ipAddress;
    const finalUserAgent = context?.userAgent || userAgent;
    const deviceInfo = parseUserAgent(finalUserAgent);
    const { country, city } = ipLocation(finalIp);

    await AuditLog.create({
      userId: context?.userId || userId,
      userModel: context?.userId ? (context.role === 'company' ? 'Company' : 'Candidate') : userModel,
      role: context?.role || (userModel === 'Company' ? 'company' : userModel === 'Candidate' ? 'candidate' : 'unknown'),
      action,
      ipAddress: finalIp,
      userAgent: finalUserAgent,
      deviceInfo,
      country,
      city,
      requestId: context?.requestId || '',
      status,
      metadata: details,
    });
  } catch (err) {
    logger.warn(`Failed to write audit log [${action}]: ${err.message}`);
  }
};

/**
 * Create Active User Session with Hashed Refresh Token
 */
export const createSessionService = async ({ userId, userModel, refreshToken, req }) => {
  const ipAddress = getIpAddress(req);
  const userAgent = req.headers['user-agent'] || '';
  const deviceInfo = parseUserAgent(userAgent);
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

  await Session.create({
    userId,
    userModel,
    refreshTokenHash,
    ipAddress,
    userAgent,
    deviceInfo,
    expiresAt,
  });

  await logSecurityEvent({
    userId,
    userModel,
    action: 'LOGIN_SUCCESS',
    ipAddress,
    userAgent,
    status: 'SUCCESS',
  });
};

/**
 * Rotate Refresh Token & Revoke Previous Session (Security Breach Detection)
 */
export const rotateSessionService = async (oldRefreshToken, req) => {
  const ipAddress = getIpAddress(req);
  const userAgent = req.headers['user-agent'] || '';

  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  const oldTokenHash = hashToken(oldRefreshToken);
  const session = await Session.findOne({ refreshTokenHash: oldTokenHash });

  // Security Breach Detection: If token is valid JWT but missing/revoked from DB, revoke ALL user sessions!
  if (!session || session.isRevoked) {
    await Session.updateMany({ userId: decoded.id }, { $set: { isRevoked: true } });
    await logSecurityEvent({
      userId: decoded.id,
      userModel: decoded.role === 'company' ? 'Company' : 'Candidate',
      action: 'SECURITY_BREACH_DETECTED',
      ipAddress,
      userAgent,
      status: 'WARNING',
      details: { reason: 'Refresh token reuse attempt detected. Revoked all user sessions.' },
    });
    throw new AppError('Security Alert: Token reuse detected. All active sessions revoked. Please log in again.', 401);
  }

  // Revoke current session
  session.isRevoked = true;
  await session.save();

  // Find User Document
  const userModelStr = decoded.role === 'company' ? 'Company' : 'Candidate';
  const user = userModelStr === 'Company'
    ? await Company.findById(decoded.id)
    : await Candidate.findById(decoded.id);

  if (!user) {
    throw new AppError('User account not found.', 404);
  }

  // Generate new Token Pair
  const newAccessToken = generateToken({ id: user._id, role: decoded.role });
  const newRefreshToken = generateRefreshToken({ id: user._id, role: decoded.role });

  // Create new active session
  await createSessionService({
    userId: user._id,
    userModel: userModelStr,
    refreshToken: newRefreshToken,
    req,
  });

  await logSecurityEvent({
    userId: user._id,
    userModel: userModelStr,
    action: 'TOKEN_REFRESH',
    ipAddress,
    userAgent,
    status: 'SUCCESS',
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user,
  };
};

/**
 * Revoke All User Sessions
 */
export const revokeAllUserSessionsService = async (userId, userModel) => {
  await Session.updateMany({ userId }, { $set: { isRevoked: true } });
  await logSecurityEvent({
    userId,
    userModel,
    action: 'SESSION_REVOKED',
    status: 'SUCCESS',
    details: { reason: 'All user sessions revoked upon user/admin request' },
  });
};
