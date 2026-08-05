import { AsyncLocalStorage } from 'async_hooks';

export const requestContextStore = new AsyncLocalStorage();

/**
 * Global Context middleware to track request telemetry
 */
export const contextMiddleware = (req, res, next) => {
  const ipAddress =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const userAgent = req.headers['user-agent'] || '';
  
  // Extract browser and OS basics
  let browser = 'Unknown';
  let os = 'Unknown';
  if (userAgent) {
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Macintosh')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  }

  // Generate unique trace ID
  const requestId =
    req.headers['x-request-id'] ||
    `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  const context = {
    userId: null,
    role: 'system',
    ipAddress,
    userAgent,
    browser,
    operatingSystem: os,
    requestId,
  };

  // Attach context reference to request object so auth middleware can update it
  req.requestContext = context;

  requestContextStore.run(context, () => {
    next();
  });
};
