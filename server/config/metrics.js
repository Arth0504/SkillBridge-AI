import client from 'prom-client';

// Create a Registry
export const register = new client.Registry();

// Add default metrics (CPU, Memory, Handles, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'skillbridge_',
});

// Custom HTTP Metrics
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'skillbridge_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2.5, 5, 10],
});

export const httpRequestsTotal = new client.Counter({
  name: 'skillbridge_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
});

// Custom Component Health Gauges
export const mongoDbStatusGauge = new client.Gauge({
  name: 'skillbridge_mongodb_status',
  help: 'MongoDB connection status (1 = connected, 0 = disconnected)',
});

export const redisStatusGauge = new client.Gauge({
  name: 'skillbridge_redis_status',
  help: 'Redis connection status (1 = connected, 0 = offline)',
});

export const aiServiceStatusGauge = new client.Gauge({
  name: 'skillbridge_ai_service_status',
  help: 'FastAPI AI microservice status (1 = healthy, 0 = offline)',
});

// Register metrics
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(mongoDbStatusGauge);
register.registerMetric(redisStatusGauge);
register.registerMetric(aiServiceStatusGauge);
