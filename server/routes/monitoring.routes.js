import express from 'express';
import {
  getSystemMetricsDashboardHandler,
  getAuditAnalyticsHandler,
} from '../controllers/monitoring.controller.js';
import { checkDbConnection } from '../middleware/db.middleware.js';

const router = express.Router();

// System Telemetry Dashboard
router.get('/system/metrics', checkDbConnection, getSystemMetricsDashboardHandler);

// Audit Analytics & Security Log Summary
router.get('/analytics/audit', checkDbConnection, getAuditAnalyticsHandler);

export default router;
