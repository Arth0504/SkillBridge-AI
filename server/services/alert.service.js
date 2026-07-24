import mongoose from 'mongoose';
import { isRedisConnected } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * System Health & Reliability Alert Rule Evaluator
 */
export const checkSystemAlerts = async () => {
  const alerts = [];

  // 1. High Memory Alert Rule (> 85% heap used)
  const mem = process.memoryUsage();
  const heapUsedRatio = mem.heapUsed / mem.heapTotal;
  if (heapUsedRatio > 0.85) {
    const msg = `ALERT: High Heap Memory Usage (${Math.round(heapUsedRatio * 100)}% used)`;
    alerts.push({ level: 'CRITICAL', metric: 'Memory', message: msg });
    logger.error(msg);
  }

  // 2. MongoDB Health Alert Rule
  if (mongoose.connection.readyState !== 1) {
    const msg = 'ALERT: MongoDB connection is DOWN or disconnected!';
    alerts.push({ level: 'CRITICAL', metric: 'MongoDB', message: msg });
    logger.error(msg);
  }

  // 3. Redis Health Alert Rule
  if (!isRedisConnected()) {
    alerts.push({
      level: 'WARNING',
      metric: 'Redis',
      message: 'NOTICE: Redis cache is offline. Silent in-memory fallback is active.',
    });
  }

  // 4. FastAPI AI Service Alert Rule
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const aiRes = await fetch(`${AI_SERVICE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!aiRes.ok) {
      alerts.push({
        level: 'WARNING',
        metric: 'AIService',
        message: 'ALERT: FastAPI AI Microservice returned non-200 status!',
      });
    }
  } catch (err) {
    alerts.push({
      level: 'WARNING',
      metric: 'AIService',
      message: `ALERT: FastAPI AI Microservice is unreachable at ${AI_SERVICE_URL}`,
    });
  }

  return {
    alertCount: alerts.length,
    criticalCount: alerts.filter((a) => a.level === 'CRITICAL').length,
    warningCount: alerts.filter((a) => a.level === 'WARNING').length,
    alerts,
  };
};
