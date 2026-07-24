import mongoose from 'mongoose';
import { logger } from './logger.js';

let isShuttingDown = false;

/**
 * Configure Graceful Shutdown Handler for SIGINT and SIGTERM signals
 * @param {Object} server HTTP Server Instance
 * @param {Object} io Socket.IO Server Instance (optional)
 */
export const setupGracefulShutdown = (server, io = null) => {
  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`\n🛑 Signal [${signal}] received. Initiating graceful shutdown...`);

    // 1. Close HTTP Server (Stop taking new incoming requests)
    if (server) {
      server.close(() => {
        logger.info('✅ HTTP Server closed cleanly.');
      });
    }

    // 2. Close Socket.IO Gateway connections
    if (io && io.close) {
      try {
        io.close();
        logger.info('✅ Socket.IO Gateway closed.');
      } catch (err) {
        logger.warn(`Socket.IO shutdown warning: ${err.message}`);
      }
    }

    // 3. Disconnect MongoDB Connection
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        logger.info('✅ MongoDB connection closed.');
      }
    } catch (err) {
      logger.warn(`MongoDB disconnect warning: ${err.message}`);
    }

    logger.info('👋 Graceful shutdown complete. Exiting process.\n');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
