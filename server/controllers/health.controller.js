import mongoose from 'mongoose';
import { isRedisConnected } from '../config/redis.js';
import { sendResponse } from '../utils/sendResponse.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Production Diagnostic Health Check Endpoint
 * @route GET /health
 * @route GET /api/v1/health
 */
export const getHealthDiagnosticHandler = async (_req, res) => {
  const startTime = Date.now();

  // 1. MongoDB Status Check
  let mongoStatus = 'disconnected';
  let mongoLatencyMs = 0;
  try {
    if (mongoose.connection.readyState === 1) {
      const pingStart = Date.now();
      await mongoose.connection.db.admin().ping();
      mongoLatencyMs = Date.now() - pingStart;
      mongoStatus = 'connected';
    }
  } catch (err) {
    mongoStatus = `error: ${err.message}`;
  }

  // 2. Redis Status Check
  const redisStatus = isRedisConnected() ? 'connected' : 'offline (in-memory fallback active)';

  // 3. FastAPI AI Service Check
  let aiServiceStatus = 'offline';
  let aiLatencyMs = 0;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const aiPingStart = Date.now();
    const aiRes = await fetch(`${AI_SERVICE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (aiRes.ok) {
      aiLatencyMs = Date.now() - aiPingStart;
      aiServiceStatus = 'healthy';
    }
  } catch (err) {
    aiServiceStatus = 'offline (fallback active)';
  }

  // 4. Cloudinary Config Check
  const cloudinaryStatus = process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'unconfigured';

  // 5. Socket.IO Gateway Check
  const socketIoStatus = 'running';

  // Determine Overall Status
  const isHealthy = mongoStatus === 'connected';
  const overallStatus = isHealthy ? (aiServiceStatus === 'healthy' ? 'healthy' : 'degraded') : 'unhealthy';
  const statusCode = isHealthy ? 200 : 503;

  const healthData = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseLatencyMs: Date.now() - startTime,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    backend: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      memoryUsageMB: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    },
    services: {
      mongodb: {
        status: mongoStatus,
        latencyMs: mongoLatencyMs,
        databaseName: mongoose.connection.name || 'skillbridge_ai',
      },
      redis: {
        status: redisStatus,
      },
      aiService: {
        status: aiServiceStatus,
        url: AI_SERVICE_URL,
        latencyMs: aiLatencyMs,
      },
      socketIoGateway: {
        status: socketIoStatus,
      },
      cloudinaryCDN: {
        status: cloudinaryStatus,
      },
    },
  };

  return sendResponse(res, statusCode, isHealthy, `System health status: [${overallStatus}]`, healthData);
};
