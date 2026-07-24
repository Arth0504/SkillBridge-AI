import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JWT_EXPIRATION } from '../config/constants.js';

/**
 * Generate long-lived JWT Refresh Token
 * @param {Object} payload Payload containing id and role
 * @returns {string} Signed JWT Refresh Token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: JWT_EXPIRATION.REFRESH_TOKEN,
  });
};
