import crypto from 'crypto';

/**
 * Hash raw token using SHA-256 for secure database storage
 */
export const hashToken = (token) => {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Extract Client IP Address from Express request
 */
export const getIpAddress = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
};

/**
 * Simple User-Agent Parser for device tracking
 */
export const parseUserAgent = (userAgentStr = '') => {
  const ua = userAgentStr.toLowerCase();
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';

  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    device = 'Tablet';
  }

  return { browser, os, device };
};

/**
 * Set Production-Ready Secure HttpOnly Cookies for Auth Tokens
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true, // Prevents XSS script access to tokens
    secure: isProduction, // Requires HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // CSRF protection
  };

  if (accessToken) {
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 Minutes
    });
  }

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });
  }
};

/**
 * Clear Auth Cookies
 */
export const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };
  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
};

/**
 * Validate standard 24-character hexadecimal MongoDB ObjectId
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize query parameters to prevent NoSQL operator injection
 */
export const sanitizeQueryParam = (param) => {
  if (typeof param === 'string') {
    return param.replace(/^\$/, '');
  }
  return param;
};
