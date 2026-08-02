import mongoose from 'mongoose';
import { logger } from './logger.js';
import { closeRedis } from '../config/redis.js';

let isShuttingDown = false;

/**
 * Configure Graceful Shutdown Handler for SIGINT, SIGTERM, and SIGUSR2 signals
 * @param {Object} server HTTP Server Instance
 * @param {Object} io Socket.IO Server Instance (optional)
 */
export const setupGracefulShutdown = (server, io = null) => {
  const shutdown = (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`\n🛑 Signal [${signal}] received. Initiating graceful shutdown...`);

    // 1. Close Socket.IO Gateway connections to release client WebSockets
    if (io && typeof io.close === 'function') {
      try {
        io.close();
        logger.info('✅ Socket.IO Gateway closed.');
      } catch (err) {
        logger.warn(`Socket.IO shutdown warning: ${err.message}`);
      }
    }

    // 2. Initiate non-blocking async disconnect for DB & Redis
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      mongoose.disconnect().catch((err) => logger.warn(`MongoDB disconnect error: ${err.message}`));
    }
    closeRedis().catch(() => {});

    // 3. Force close HTTP keep-alive connections & exit immediately on server.close callback
    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      server.close(() => {
        logger.info('✅ HTTP Server closed cleanly. Exiting process.\n');
        process.exit(0);
      });

      // Safety fallback exit if server.close callback hangs
      setTimeout(() => {
        logger.info('⚠️ Force exiting process after timeout.');
        process.exit(0);
      }, 500).unref();
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGUSR2', () => shutdown('SIGUSR2'));
};
