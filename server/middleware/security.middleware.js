import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { env } from '../config/env.js';

/**
 * Strict Rate Limiter for Authentication Endpoints (10 requests / 15 minutes)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    data: null,
    errors: ['Rate limit exceeded'],
  },
});

/**
 * Global API Rate Limiter (100 requests / 15 minutes)
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    data: null,
    errors: ['Global rate limit exceeded'],
  },
});

/**
 * XSS Input Sanitization Middleware (Strips dangerous script tags & malicious HTML from strings)
 */
export const sanitizeInputs = (req, _res, next) => {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') {
      return val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/onerror\s*=/gi, '');
    }
    if (val !== null && typeof val === 'object') {
      for (const key of Object.keys(val)) {
        val[key] = sanitizeValue(val[key]);
      }
    }
    return val;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
};

export const configureSecurityMiddlewares = (app) => {
  // 1. Enterprise Helmet Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
          connectSrc: ["'self'", 'http://127.0.0.1:8000', 'http://localhost:5000'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      frameguard: { action: 'deny' },
      xssFilter: true,
      noSniff: true,
    })
  );

  // 2. Hardened Cross-Origin Resource Sharing (CORS)
  const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS policy violation: Origin not allowed.'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-AI-SECRET-KEY'],
    })
  );

  // 3. Global Rate Limiter
  app.use('/api', globalLimiter);

  // 4. Request Body Parsing with strict size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Anti NoSQL Injection ($ and . replacement)
  app.use(mongoSanitize({ replaceWith: '_' }));

  // 6. Anti XSS Input Sanitization
  app.use(sanitizeInputs);

  // 7. Anti HTTP Parameter Pollution
  app.use(hpp());
};
