import http from 'http';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import app from './app.js';
import { initSocketServer } from './sockets/notification.socket.js';

import { initRedis } from './config/redis.js';
import { setupGracefulShutdown } from './utils/gracefulShutdown.js';

// Catch Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! 💥 Shutting down... ${err.name}: ${err.message}`);
  logger.error(err.stack || '');
  process.exit(1);
});

const startServer = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Initialize optional Redis Cache (silent fallback if offline)
  await initRedis();

  // 3. Create HTTP Server & Initialize Socket.IO Gateway
  const httpServer = http.createServer(app);
  const io = initSocketServer(httpServer);

  // 4. Start Listening
  const server = httpServer.listen(env.PORT, () => {
    logger.info(
      `🚀 SkillBridge AI Server & Socket.IO Gateway running in [${env.NODE_ENV}] mode on port ${env.PORT}`
    );
  });

  // Attach Graceful Shutdown Handlers (SIGINT, SIGTERM)
  setupGracefulShutdown(server, io);

  // Catch Unhandled Promise Rejections
  process.on('unhandledRejection', (reason) => {
    logger.error(`UNHANDLED REJECTION! 💥 Shutting down... ${reason}`);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
