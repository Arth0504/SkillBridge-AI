import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JWT_EXPIRATION } from '../config/constants.js';

/**
 * Generate short-lived JWT Access Token
 * @param {Object} payload Payload containing id and role
 * @returns {string} Signed JWT Access Token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: JWT_EXPIRATION.ACCESS_TOKEN,
  });
};
