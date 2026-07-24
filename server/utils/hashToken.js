import crypto from 'crypto';

/**
 * Hash a plain string token using SHA-256 for secure DB storage
 * @param {string} token Plain token
 * @returns {string} Hashed token string
 */
export const hashToken = (token) => {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a random unhashed token hex string (e.g. for email verification or password reset)
 * @returns {string} 32-byte hex token string
 */
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
