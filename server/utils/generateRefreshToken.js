import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JWT_EXPIRATION } from '../config/constants.js';

import crypto from 'crypto';

/**
 * Generate long-lived JWT Refresh Token with unique jti nonce
 * @param {Object} payload Payload containing id and role
 * @returns {string} Signed JWT Refresh Token
 */
export const generateRefreshToken = (payload) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  return jwt.sign({ ...payload, jti: nonce }, env.JWT_REFRESH_SECRET, {
    expiresIn: JWT_EXPIRATION.REFRESH_TOKEN,
  });
};
