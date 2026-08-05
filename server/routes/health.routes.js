import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Liveness check (Is process responsive?)
router.get('/liveness', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness check (Is MongoDB database connected?)
router.get('/readiness', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    res.status(200).json({
      status: 'READY',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'NOT_READY',
      database: 'DISCONNECTED',
      timestamp: new Date().toISOString(),
    });
  }
});

// Full Diagnostic Health Check
router.get('/', (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    service: 'SkillBridge-AI Production Backend',
    status: 'HEALTHY',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    databaseState: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    memoryUsage: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
    },
  });
});

export default router;
