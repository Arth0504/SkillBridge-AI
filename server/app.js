import express from 'express';
import { configureSecurityMiddlewares } from './middleware/security.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { checkDbConnection } from './middleware/db.middleware.js';
import { sendResponse } from './utils/sendResponse.js';

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

const app = express();

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

// Configure Security & Request Parsing Middlewares
configureSecurityMiddlewares(app);

// API Version 1 Health Check Endpoint
app.get('/api/v1/health', (_req, res) => {
  return sendResponse(res, 200, true, 'SkillBridge AI Server is healthy and running', {
    environment: process.env.NODE_ENV,
    version: 'v1',
    timestamp: new Date().toISOString(),
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

// Handle Unmatched 404 Routes
app.use(notFoundHandler);

// Attach Global Error Handler
app.use(errorHandler);

export default app;
