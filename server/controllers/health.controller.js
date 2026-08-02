import mongoose from 'mongoose';

export const getHealthStatus = async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Disconnected';
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: mongoStatus === 'Healthy' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: mongoStatus,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      aiMicroservice: {
        url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
        status: 'Operational',
      },
    },
    system: {
      memoryUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      memoryTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      nodeVersion: process.version,
    },
  };

  res.status(mongoStatus === 'Healthy' ? 200 : 503).json({
    success: mongoStatus === 'Healthy',
    data: healthData,
  });
};

export const getHealthDiagnosticHandler = getHealthStatus;
