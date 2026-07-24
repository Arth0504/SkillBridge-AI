import { getCache, setCache, deleteCache, isRedisConnected } from '../config/redis.js';

export const CacheService = {
  get: getCache,
  set: setCache,
  delete: deleteCache,
  isAvailable: isRedisConnected,

  /**
   * Helper to execute a query with caching
   */
  fetchOrCache: async (key, queryFn, ttlSeconds = 300) => {
    const cached = await getCache(key);
    if (cached) {
      return cached;
    }
    const freshData = await queryFn();
    if (freshData) {
      await setCache(key, freshData, ttlSeconds);
    }
    return freshData;
  },
};
