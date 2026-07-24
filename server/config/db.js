import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Configure DNS fallback to ensure MongoDB Atlas SRV resolution works across all network adapters
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore DNS override errors if environment restricts DNS configuration
}

// Disable Mongoose command buffering so queries fail fast if DB is disconnected
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Connection Disconnected. Reconnecting...');
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('authentication failed')) {
      logger.warn(
        '⚠️ Database Authentication Failed: Please check the username and password in server/.env MONGODB_URI.'
      );
    }

    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
