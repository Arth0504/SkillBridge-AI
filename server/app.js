import express from 'express';
import { configureSecurityMiddlewares } from './middleware/security.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { checkDbConnection } from './middleware/db.middleware.js';
import { sendResponse } from './utils/sendResponse.js';
import { contextMiddleware } from './middleware/context.middleware.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import aiRoutes from './routes/ai.routes.js';

import authCandidateRoutes from './routes/authCandidate.routes.js';
import authCompanyRoutes from './routes/authCompany.routes.js';
import profileCandidateRoutes from './routes/profileCandidate.routes.js';
import profileCompanyRoutes from './routes/profileCompany.routes.js';
import jobRoutes from './routes/job.routes.js';
import jobCompanyRoutes from './routes/jobCompany.routes.js';
import applicationCandidateRoutes from './routes/applicationCandidate.routes.js';
import applicationCompanyRoutes from './routes/applicationCompany.routes.js';
import dashboardCompanyRoutes from './routes/dashboardCompany.routes.js';
import notificationCandidateRoutes from './routes/notificationCandidate.routes.js';
import notificationCompanyRoutes from './routes/notificationCompany.routes.js';
import interviewCompanyRoutes from './routes/interviewCompany.routes.js';
import interviewCandidateRoutes from './routes/interviewCandidate.routes.js';
import savedJobRoutes from './routes/savedJob.routes.js';
import dashboardCandidateRoutes from './routes/dashboardCandidate.routes.js';
import aiResumeRoutes from './routes/aiResume.routes.js';
import interviewAIRoutes from './routes/interviewAI.routes.js';
import codingAIRoutes from './routes/codingAI.routes.js';
import videoInterviewRoutes from './routes/videoInterview.routes.js';
import interviewRoomRoutes from './routes/interviewRoom.routes.js';
import companyCalendarRoutes from './routes/companyCalendar.routes.js';
import offerLetterRoutes from './routes/offerLetter.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import adminControlRoutes from './routes/adminControl.routes.js';
import documentRoutes from './routes/document.routes.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();

// Trust Proxy Configuration for Production Reverse Proxies (Render, Railway, Nginx, Cloudflare)
app.set('trust proxy', 1);

// Custom Lightweight Cookie Parser
app.use((req, _res, next) => {
  req.cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      if (parts[0]) {
        req.cookies[parts[0].trim()] = (parts[1] || '').trim();
      }
    });
  }
  next();
});

import { requestLogger } from './middleware/requestLogger.js';
import { getPrometheusMetricsHandler } from './controllers/monitoring.controller.js';
import monitoringRoutes from './routes/monitoring.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Security & Request Parsing Middlewares
configureSecurityMiddlewares(app);

// Serve local uploaded files in development (/uploads/resumes/..., /uploads/avatars/..., /uploads/logos/...)
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Request Tracing & Structured HTTP Logger Middleware
app.use(requestLogger);
app.use(contextMiddleware);

// Prometheus Metrics Endpoint
app.get('/metrics', getPrometheusMetricsHandler);

// Interactive Swagger UI & OpenAPI Specification JSON Endpoints
app.get('/api/docs/json', (_req, res) => res.json(swaggerSpec));
app.get('/api/v1/docs/json', (_req, res) => res.json(swaggerSpec));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import { getHealthDiagnosticHandler } from './controllers/health.controller.js';
import healthRoutes from './routes/health.routes.js';

// Production Diagnostic Health Check Endpoints
app.use('/api/health', healthRoutes);
app.get('/health', getHealthDiagnosticHandler);
app.get('/api/v1/health', getHealthDiagnosticHandler);

// API Version 2 (Future-Ready Fallback / Deprecation Handler)
app.use('/api/v2', (_req, res) => {
  return sendResponse(res, 200, true, 'SkillBridge AI API Version 2 - Future Release Notice', {
    version: 'v2',
    status: 'upcoming',
    documentationUrl: '/api/docs',
  });
});

// API Routes (guarded by DB connection check)
app.use('/api/v1/auth/candidate', checkDbConnection, authCandidateRoutes);
app.use('/api/v1/auth/company', checkDbConnection, authCompanyRoutes);
app.use('/api/v1/candidate/profile', checkDbConnection, profileCandidateRoutes);
app.use('/api/v1/company/profile', checkDbConnection, profileCompanyRoutes);

// Job System Routes
app.use('/api/v1/jobs', checkDbConnection, jobRoutes);
app.use('/api/v1/company/jobs', checkDbConnection, jobCompanyRoutes);

// Application System Routes
app.use('/api/v1/candidate/applications', checkDbConnection, applicationCandidateRoutes);
app.use('/api/v1/company/applications', checkDbConnection, applicationCompanyRoutes);

// Dashboard Routes
app.use('/api/v1/company/dashboard', checkDbConnection, dashboardCompanyRoutes);
app.use('/api/v1/candidate/dashboard', checkDbConnection, dashboardCandidateRoutes);

// Notification System Routes
app.use('/api/v1/candidate/notifications', checkDbConnection, notificationCandidateRoutes);
app.use('/api/v1/company/notifications', checkDbConnection, notificationCompanyRoutes);

// Interview System Routes
app.use('/api/v1/company/interviews', checkDbConnection, interviewCompanyRoutes);
app.use('/api/v1/candidate/interviews', checkDbConnection, interviewCandidateRoutes);

// Saved Job Routes
app.use('/api/v1/candidate/saved-jobs', checkDbConnection, savedJobRoutes);

// AI Resume Analyzer System Routes
app.use('/api/v1/candidate/resume', checkDbConnection, aiResumeRoutes);

// AI Mock Interview System Routes
app.use('/api/v1/candidate/ai-interview', checkDbConnection, interviewAIRoutes);

// AI Coding Assessment System Routes
app.use('/api/v1/candidate/ai-coding', checkDbConnection, codingAIRoutes);

// AI Video Interview System Routes
app.use('/api/v1/candidate/video-interview', checkDbConnection, videoInterviewRoutes);

// Private Video Interview Room System Routes
app.use('/api/v1/interviews/private', checkDbConnection, interviewRoomRoutes);

// Company Calendar System Routes
app.use('/api/v1/company/calendar', checkDbConnection, companyCalendarRoutes);

// Offer Letter Generator Routes
app.use('/api/v1/company/offer-letters', checkDbConnection, offerLetterRoutes);

// Enterprise HRMS Employee Auto-Onboarding Routes
app.use('/api/v1/company/employees', checkDbConnection, employeeRoutes);

// Document Repository & Management System Routes
app.use('/api/v1/documents', checkDbConnection, documentRoutes);

// Enterprise Audit Logs & Activity Center Routes
app.use('/api/v1/audit-logs', auditLogRoutes);

// AI Resume Assistant Routes (Gateway to FastAPI)
app.use('/api/v1/ai', aiRoutes);

// Admin Monitoring & Telemetry Routes
app.use('/api/v1/admin/control', checkDbConnection, adminControlRoutes);
app.use('/api/v1/admin', monitoringRoutes);

// Handle Unmatched 404 Routes
app.use(notFoundHandler);

// Attach Global Error Handler
app.use(errorHandler);

export default app;
