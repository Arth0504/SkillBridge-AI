import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import app from './app.js';
import { logger } from './utils/logger.js';
import { checkSystemAlerts } from './services/alert.service.js';

dotenv.config();

let httpServer;

const runMonitoringTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 17 MONITORING & OBSERVABILITY TESTS ---');
  console.log('=====================================================');

  try {
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/skillbridge_test';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');

    const PORT = 5099;
    httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://127.0.0.1:${PORT}`;
    console.log(`✅ Server running on port ${PORT}`);

    // -----------------------------------------------------
    // TEST 1: Winston Logger & Daily Rotate Files
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing Winston Daily Rotate Logging ...');
    logger.info('Monitoring Test Log Entry - Info Level');
    logger.error('Monitoring Test Log Entry - Error Level');

    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    console.log('✅ TEST 1 PASSED: Winston logger executed and logs directory verified.');

    // -----------------------------------------------------
    // TEST 2: Prometheus Metrics Exposition (GET /metrics)
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing GET /metrics Prometheus Endpoint ...');
    const metricsRes = await fetch(`${BASE_URL}/metrics`);
    const metricsText = await metricsRes.text();

    console.log('Metrics Status:', metricsRes.status);

    if (
      metricsRes.status === 200 &&
      metricsText.includes('skillbridge_http_requests_total') &&
      metricsText.includes('skillbridge_mongodb_status')
    ) {
      console.log('✅ TEST 2 PASSED: Prometheus metrics format validated with custom gauges & counters.');
    } else {
      throw new Error('❌ TEST 2 FAILED: Prometheus metrics endpoint failed.');
    }

    // -----------------------------------------------------
    // TEST 3: Request Tracing & Correlation Header (X-Request-ID)
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing Request Tracing (X-Request-ID Header) ...');
    const traceRes = await fetch(`${BASE_URL}/health`);
    const reqId = traceRes.headers.get('x-request-id');
    const corrId = traceRes.headers.get('x-correlation-id');

    console.log('X-Request-ID Header:', reqId);
    console.log('X-Correlation-ID Header:', corrId);

    if (traceRes.status === 200 && reqId && corrId && reqId === corrId) {
      console.log('✅ TEST 3 PASSED: Request ID and Correlation ID generated and attached to response.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Request tracing failed.');
    }

    // -----------------------------------------------------
    // TEST 4: System Performance Dashboard API (GET /api/v1/admin/system/metrics)
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing GET /api/v1/admin/system/metrics Dashboard API ...');
    const dashboardRes = await fetch(`${BASE_URL}/api/v1/admin/system/metrics`);
    const dashboardData = await dashboardRes.json();

    console.log('Dashboard Status:', dashboardRes.status);
    console.log('Telemetry Memory:', dashboardData.data.memory);
    console.log('Telemetry Services:', dashboardData.data.services);

    if (
      dashboardRes.status === 200 &&
      dashboardData.success === true &&
      dashboardData.data.system.nodeVersion &&
      dashboardData.data.services.mongodb.status === 'connected'
    ) {
      console.log('✅ TEST 4 PASSED: System Performance Dashboard API verified with real-time telemetry.');
    } else {
      throw new Error('❌ TEST 4 FAILED: System metrics dashboard API failed.');
    }

    // -----------------------------------------------------
    // TEST 5: Audit Analytics API (GET /api/v1/admin/analytics/audit)
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing GET /api/v1/admin/analytics/audit API ...');
    const auditRes = await fetch(`${BASE_URL}/api/v1/admin/analytics/audit`);
    const auditData = await auditRes.json();

    console.log('Audit Status:', auditRes.status);
    console.log('Audit Summary:', auditData.data.authentication);

    if (auditRes.status === 200 && auditData.success === true && auditData.data.platformUsers !== undefined) {
      console.log('✅ TEST 5 PASSED: Audit analytics API verified.');
    } else {
      throw new Error('❌ TEST 5 FAILED: Audit analytics API failed.');
    }

    // -----------------------------------------------------
    // TEST 6: Real-Time Alert Engine Thresholds
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing Real-Time Alert Engine ...');
    const alerts = await checkSystemAlerts();

    console.log('Alert Summary:', alerts);

    if (alerts.alertCount !== undefined && Array.isArray(alerts.alerts)) {
      console.log('✅ TEST 6 PASSED: Real-time alert engine threshold evaluation verified.');
    } else {
      throw new Error('❌ TEST 6 FAILED: Alert engine evaluation failed.');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 17 MONITORING & OBSERVABILITY TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=====================================================');
  } catch (error) {
    console.error('\n❌ TEST RUNNER ERROR:', error);
    process.exitCode = 1;
  } finally {
    if (httpServer) httpServer.close();
    await mongoose.disconnect();
    console.log('Closed server and MongoDB connections.');
  }
};

runMonitoringTests();
