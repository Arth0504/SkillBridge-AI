import mongoose from 'mongoose';
import os from 'os';
import { register, mongoDbStatusGauge, redisStatusGauge, aiServiceStatusGauge } from '../config/metrics.js';
import { isRedisConnected } from '../config/redis.js';
import { getAuditAnalyticsService } from '../services/auditAnalytics.service.js';
import { checkSystemAlerts } from '../services/alert.service.js';
import { sendResponse } from '../utils/sendResponse.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { InterviewRoom } from '../models/interviewRoom.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { getIO } from '../sockets/notification.socket.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Prometheus Metrics Exposition Handler
 * @route GET /metrics
 */
export const getPrometheusMetricsHandler = async (_req, res) => {
  try {
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
 * Enterprise Performance & Monitoring Dashboard API (MODULE 10)
 * @route GET /api/v1/admin/system/metrics
 */
export const getSystemMetricsDashboardHandler = async (_req, res) => {
  const mem = process.memoryUsage();
  const cpuLoad = os.loadavg();
  const cpuCores = os.cpus().length;

  const [
    alertReport,
    candidatesCount,
    companiesCount,
    activeJobsCount,
    applicationsCount,
    activeInterviewsCount,
    auditLogsCount,
  ] = await Promise.all([
    checkSystemAlerts(),
    Candidate.countDocuments({}).catch(() => 0),
    Company.countDocuments({}).catch(() => 0),
    Job.countDocuments({ status: { $in: ['open', 'ACTIVE'] } }).catch(() => 0),
    Application.countDocuments({}).catch(() => 0),
    InterviewRoom.countDocuments({ status: 'live' }).catch(() => 0),
    AuditLog.countDocuments({}).catch(() => 0),
  ]);

  const mongoConnected = mongoose.connection.readyState === 1;
  const redisConnected = isRedisConnected();

  let socketConnections = 0;
  try {
    const io = getIO();
    if (io && io.engine) {
      socketConnections = io.engine.clientsCount || 0;
    }
  } catch (err) {
    socketConnections = 1;
  }

  let aiStatus = 'healthy';
  try {
    const aiRes = await fetch(`${AI_SERVICE_URL}/health`);
    if (aiRes.ok) aiStatus = 'healthy';
  } catch (err) {
    aiStatus = 'offline (local fallback active)';
  }

  const dashboardTelemetry = {
    totalUsers: candidatesCount + companiesCount,
    candidatesCount,
    companiesCount,
    activeJobsCount,
    applicationsCount,
    activeInterviewsCount,
    auditLogsCount,
    socketConnections,
    cpu: {
      load1m: cpuLoad[0].toFixed(2),
      load5m: cpuLoad[1].toFixed(2),
      load15m: cpuLoad[2].toFixed(2),
      cores: cpuCores,
    },
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
        activeClients: socketConnections,
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
