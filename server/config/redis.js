import { logger } from '../utils/logger.js';

let redisClient = null;
let isConnected = false;

// Simple in-memory fallback cache if Redis is unavailable or unconfigured
const inMemoryCache = new Map();

export const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;

  if (!redisUrl) {
    logger.info('ℹ️ REDIS_URL not configured. Redis cache operating in silent in-memory fallback mode.');
    return;
  }

  try {
    // Dynamic import to allow application boot even if redis library is uninstalled
    const { createClient } = await import('redis');
    redisClient = createClient({ url: redisUrl });

    redisClient.on('connect', () => {
      isConnected = true;
      logger.info('✅ Redis Cache Client Connected Successfully.');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      logger.warn(`⚠️ Redis Cache Warning: ${err.message}. Operating in silent in-memory fallback mode.`);
    });

    redisClient.on('end', () => {
      isConnected = false;
    });

    await redisClient.connect().catch((err) => {
      logger.warn(`⚠️ Redis Initial Connection Warning: ${err.message}`);
    });
  } catch (err) {
    logger.warn(`⚠️ Redis Init Exception: ${err.message}. Using silent in-memory fallback mode.`);
  }
};

export const isRedisConnected = () => isConnected;

export const getCache = async (key) => {
  if (isConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.warn(`Redis getCache error: ${err.message}`);
    }
  }

  // In-Memory Fallback
  const cached = inMemoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  return null;
};

export const setCache = async (key, value, ttlSeconds = 300) => {
  if (isConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
      return;
    } catch (err) {
      logger.warn(`Redis setCache error: ${err.message}`);
    }
  }

  // In-Memory Fallback
  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const deleteCache = async (key) => {
  if (isConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.warn(`Redis deleteCache error: ${err.message}`);
    }
  }
  inMemoryCache.delete(key);
};

export const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      isConnected = false;
      logger.info('✅ Redis connection closed.');
    } catch (err) {
      logger.warn(`Redis close warning: ${err.message}`);
    }
  }
  inMemoryCache.clear();
};
