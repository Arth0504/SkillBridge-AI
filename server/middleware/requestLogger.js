import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { httpRequestDurationSeconds, httpRequestsTotal } from '../config/metrics.js';

/**
 * Request Tracing & Structured HTTP Logger Middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Generate or extract Request ID / Correlation ID
  const requestId = req.headers['x-request-id'] || req.headers['x-correlation-id'] || `req_${crypto.randomUUID()}`;
  req.requestId = requestId;

  // Set response headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Correlation-ID', requestId);

  // Capture response finish
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const durationSec = durationMs / 1000;
    const route = req.route ? req.route.path : req.path;

    // Log HTTP Request
    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms [IP: ${req.ip || '127.0.0.1'}] [ReqID: ${requestId}]`
    );

    // Record Prometheus Metrics
    if (httpRequestDurationSeconds) {
      httpRequestDurationSeconds.observe(
        { method: req.method, route, status_code: res.statusCode.toString() },
        durationSec
      );
    }
    if (httpRequestsTotal) {
      httpRequestsTotal.inc({
        method: req.method,
        route,
        status_code: res.statusCode.toString(),
      });
    }
  });

  next();
};
