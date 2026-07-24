import mongoose from 'mongoose';
import { register, mongoDbStatusGauge, redisStatusGauge, aiServiceStatusGauge } from '../config/metrics.js';
import { isRedisConnected } from '../config/redis.js';
import { getAuditAnalyticsService } from '../services/auditAnalytics.service.js';
import { checkSystemAlerts } from '../services/alert.service.js';
import { sendResponse } from '../utils/sendResponse.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Prometheus Metrics Exposition Handler
 * @route GET /metrics
 */
export const getPrometheusMetricsHandler = async (_req, res) => {
  try {
    // Update Gauge status metrics before exposition
    mongoDbStatusGauge.set(mongoose.connection.readyState === 1 ? 1 : 0);
    redisStatusGauge.set(isRedisConnected() ? 1 : 0);

    res.set('Content-Type', register.contentType);
    const metricsData = await register.metrics();
    return res.status(200).send(metricsData);
  } catch (err) {
    return res.status(500).send(`Error generating metrics: ${err.message}`);
  }
};

/**
 * Enterprise Performance & Monitoring Dashboard API
 * @route GET /api/v1/admin/system/metrics
 */
export const getSystemMetricsDashboardHandler = async (_req, res) => {
  const mem = process.memoryUsage();
  const alertReport = await checkSystemAlerts();

  // MongoDB status
  const mongoConnected = mongoose.connection.readyState === 1;

  // Redis status
  const redisConnected = isRedisConnected();

  // AI Service check
  let aiStatus = 'offline';
  try {
    const aiRes = await fetch(`${AI_SERVICE_URL}/health`);
    if (aiRes.ok) aiStatus = 'healthy';
  } catch (err) {
    aiStatus = 'offline';
  }

  const dashboardTelemetry = {
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV || 'development',
    },
    memory: {
      rssMB: Math.round(mem.rss / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      externalMB: Math.round(mem.external / 1024 / 1024),
    },
    services: {
      mongodb: {
        status: mongoConnected ? 'connected' : 'disconnected',
        databaseName: mongoose.connection.name || 'skillbridge_ai',
      },
      redis: {
        status: redisConnected ? 'connected' : 'offline (in-memory fallback active)',
      },
      aiService: {
        status: aiStatus,
        url: AI_SERVICE_URL,
      },
      socketIoGateway: {
        status: 'running',
      },
    },
    alertSummary: alertReport,
  };

  return sendResponse(res, 200, true, 'System telemetry and performance metrics retrieved', dashboardTelemetry);
};

/**
 * Audit Analytics Handler
 * @route GET /api/v1/admin/analytics/audit
 */
export const getAuditAnalyticsHandler = async (_req, res) => {
  const analyticsData = await getAuditAnalyticsService();
  return sendResponse(res, 200, true, 'Audit analytics and security log summary retrieved', analyticsData);
};
