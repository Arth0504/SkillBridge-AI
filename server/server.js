import http from 'http';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import app from './app.js';
import { initSocketServer } from './sockets/notification.socket.js';

// Catch Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! 💥 Shutting down... ${err.name}: ${err.message}`);
  logger.error(err.stack || '');
  process.exit(1);
});

const startServer = async () => {
  // 1. Connect to MongoDB Atlas
  await connectDB();

  // 2. Create HTTP Server & Initialize Socket.IO
  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  // 3. Start Listening
  const server = httpServer.listen(env.PORT, () => {
    logger.info(
      `🚀 SkillBridge AI Server & Socket.IO Gateway running in [${env.NODE_ENV}] mode on port ${env.PORT}`
    );
  });

  // Graceful Shutdown Handler
  const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Catch Unhandled Promise Rejections
  process.on('unhandledRejection', (reason) => {
    logger.error(`UNHANDLED REJECTION! 💥 Shutting down... ${reason}`);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
