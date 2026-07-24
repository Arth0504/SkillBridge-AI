import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import app from './app.js';
import { CacheService } from './services/cache.service.js';

dotenv.config();

let httpServer;

const runProductionTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 15 PRODUCTION INFRASTRUCTURE TESTS ---');
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
    // TEST 1: Infrastructure Files Existence Verification
    // -----------------------------------------------------
    console.log('\n[TEST 1] Verifying Production Infrastructure Files ...');
    const projectRoot = path.resolve(process.cwd(), '..');

    const requiredFiles = [
      path.join(process.cwd(), 'Dockerfile'),
      path.join(projectRoot, 'ai-service', 'Dockerfile'),
      path.join(projectRoot, 'client', 'Dockerfile'),
      path.join(projectRoot, 'docker-compose.yml'),
      path.join(projectRoot, 'nginx', 'nginx.conf'),
      path.join(projectRoot, 'nginx', 'conf.d', 'default.conf'),
      path.join(process.cwd(), 'ecosystem.config.js'),
      path.join(projectRoot, '.env.production'),
      path.join(projectRoot, '.env.docker'),
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Missing mandatory production file: ${file}`);
      }
    }
    console.log('✅ TEST 1 PASSED: All 9 Docker, Compose, Nginx, PM2, and .env files verified.');

    // -----------------------------------------------------
    // TEST 2: Diagnostic Health Endpoint (GET /health)
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing GET /health Diagnostic Endpoint ...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();

    console.log('Health Status:', healthRes.status);
    console.log('Health Output:', JSON.stringify(healthData.data, null, 2));

    if (
      healthRes.status === 200 &&
      healthData.success === true &&
      healthData.data.status !== undefined &&
      healthData.data.services.mongodb.status === 'connected' &&
      healthData.data.backend.memoryUsageMB !== undefined
    ) {
      console.log('✅ TEST 2 PASSED: Health diagnostic endpoint verified.');
    } else {
      throw new Error('❌ TEST 2 FAILED: Diagnostic health check failed.');
    }

    // -----------------------------------------------------
    // TEST 3: Resilient Redis Cache Optional Fallback
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing Optional Cache Fallback Resilience ...');
    const cacheKey = `test_key_${Date.now()}`;
    const cacheVal = { system: 'SkillBridge AI', status: 'cache_verified' };

    await CacheService.set(cacheKey, cacheVal, 60);
    const retrievedVal = await CacheService.get(cacheKey);

    console.log('Cache Fallback Test Key:', cacheKey);
    console.log('Cache Fallback Retrieved:', retrievedVal);

    if (retrievedVal && retrievedVal.status === 'cache_verified') {
      console.log('✅ TEST 3 PASSED: Cache helper operates seamlessly with in-memory fallback.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Cache fallback failed.');
    }

    // -----------------------------------------------------
    // TEST 4: Environment Variables Audit
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing Environment Variables Audit ...');
    const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    for (const key of requiredEnv) {
      if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`);
      }
    }
    console.log('✅ TEST 4 PASSED: Mandatory environment variables verified.');

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 15 INFRASTRUCTURE TESTS PASSED SUCCESSFULLY! 🎉');
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

runProductionTests();
