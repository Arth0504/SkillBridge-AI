import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { AuditLog } from './models/auditLog.model.js';
import { Session } from './models/session.model.js';

dotenv.config();

let httpServer;

const runSecurityTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 13 ENTERPRISE SECURITY MODULE TESTS ---');
  console.log('=====================================================');

  try {
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/skillbridge_test';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');

    // Clear test collections
    await Promise.all([
      Candidate.deleteMany({}),
      Company.deleteMany({}),
      AuditLog.deleteMany({}),
      Session.deleteMany({}),
    ]);

    const PORT = 5099;
    httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://127.0.0.1:${PORT}`;
    console.log(`✅ Server running on port ${PORT}`);

    const timeSuffix = Date.now();
    const candidateEmail = `security_${timeSuffix}@gmail.com`;
    const candidatePassword = 'Password123!';

    // 1. Create Base Candidate
    await Candidate.create({
      fullName: 'Security Tester',
      email: candidateEmail,
      password: candidatePassword,
      isEmailVerified: true,
    });
    console.log('✅ Base candidate created for security tests.');

    // -----------------------------------------------------
    // TEST 1: Account Lockout after 5 consecutive failed login attempts
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing Account Lockout (5 failed attempts) ...');
    for (let i = 1; i <= 4; i++) {
      const res = await fetch(`${BASE_URL}/api/v1/auth/candidate/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: candidateEmail, password: 'WrongPassword!' }),
      });
      console.log(`Failed Attempt ${i} Status: ${res.status}`);
    }

    // 5th Failed Attempt should trigger Account Lockout (423 Locked)
    const fifthRes = await fetch(`${BASE_URL}/api/v1/auth/candidate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: candidateEmail, password: 'WrongPassword!' }),
    });
    const fifthBody = await fifthRes.json();
    console.log('5th Attempt Status:', fifthRes.status);
    console.log('5th Attempt Response:', fifthBody.message);

    // Attempting even correct password on locked account should be blocked (423 Locked)
    const lockedRes = await fetch(`${BASE_URL}/api/v1/auth/candidate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: candidateEmail, password: candidatePassword }),
    });
    const lockedBody = await lockedRes.json();
    console.log('Correct Password on Locked Account Status:', lockedRes.status);

    if (fifthRes.status === 423 && lockedRes.status === 423) {
      console.log('✅ TEST 1 PASSED: Account locked for 15 min after 5 failed attempts (HTTP 423).');
    } else {
      throw new Error('❌ TEST 1 FAILED: Account lockout failed.');
    }

    // Manually unlock candidate for remaining tests
    await Candidate.updateOne({ email: candidateEmail }, { $set: { failedLoginAttempts: 0 }, $unset: { lockUntil: 1 } });

    // -----------------------------------------------------
    // TEST 2: Login Success & Session Creation
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing Successful Login & Session Creation ...');
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/candidate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: candidateEmail, password: candidatePassword }),
    });
    const loginBody = await loginRes.json();

    console.log('Login Status:', loginRes.status);

    if (loginRes.status === 200 && loginBody.data.accessToken && loginBody.data.refreshToken) {
      console.log('✅ TEST 2 PASSED: Login successful & access/refresh token pair issued.');
    } else {
      throw new Error('❌ TEST 2 FAILED: Login failed.');
    }

    const firstRefreshToken = loginBody.data.refreshToken;

    // -----------------------------------------------------
    // TEST 3: Refresh Token Rotation & Session Revocation
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing Refresh Token Rotation ...');
    const rotateRes = await fetch(`${BASE_URL}/api/v1/auth/candidate/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: firstRefreshToken }),
    });
    const rotateBody = await rotateRes.json();

    console.log('Rotate Token Status:', rotateRes.status);
    console.log('Rotate Body:', JSON.stringify(rotateBody, null, 2));

    if (rotateRes.status === 200 && rotateBody.data.refreshToken && rotateBody.data.refreshToken !== firstRefreshToken) {
      console.log('✅ TEST 3 PASSED: Refresh token rotated successfully.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Refresh token rotation failed.');
    }

    // -----------------------------------------------------
    // TEST 4: Security Breach Detection (Reusing Old Revoked Refresh Token)
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing Security Breach Detection (Reusing Revoked Token) ...');
    const breachRes = await fetch(`${BASE_URL}/api/v1/auth/candidate/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: firstRefreshToken }),
    });
    const breachBody = await breachRes.json();

    console.log('Breach Attempt Status:', breachRes.status);
    console.log('Breach Response:', breachBody.message);

    if (breachRes.status === 401 && breachBody.message.includes('Security Alert')) {
      console.log('✅ TEST 4 PASSED: Token reuse detected; all active sessions revoked (401).');
    } else {
      throw new Error('❌ TEST 4 FAILED: Security breach detection failed.');
    }

    // -----------------------------------------------------
    // TEST 5: Helmet Security Headers Verification
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing Helmet Security Headers ...');
    const healthRes = await fetch(`${BASE_URL}/api/v1/health`);

    const frameOptions = healthRes.headers.get('x-frame-options');
    const contentTypeOptions = healthRes.headers.get('x-content-type-options');

    console.log('X-Frame-Options Header:', frameOptions);
    console.log('X-Content-Type-Options Header:', contentTypeOptions);

    if (frameOptions === 'DENY' && contentTypeOptions === 'nosniff') {
      console.log('✅ TEST 5 PASSED: Helmet security headers verified (DENY & nosniff).');
    } else {
      throw new Error('❌ TEST 5 FAILED: Helmet headers verification failed.');
    }

    // -----------------------------------------------------
    // TEST 6: Audit Log Verification
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing Audit Log Persistence ...');
    const logs = await AuditLog.find({}).lean();
    console.log(`Total Audit Logs Created: ${logs.length}`);
    const actionsLogged = logs.map((l) => l.action);
    console.log('Actions Logged:', actionsLogged);

    if (
      actionsLogged.includes('LOGIN_FAILED') &&
      actionsLogged.includes('ACCOUNT_LOCKED') &&
      actionsLogged.includes('LOGIN_SUCCESS') &&
      actionsLogged.includes('TOKEN_REFRESH') &&
      actionsLogged.includes('SECURITY_BREACH_DETECTED')
    ) {
      console.log('✅ TEST 6 PASSED: Security audit logs verified for all authentication actions.');
    } else {
      throw new Error('❌ TEST 6 FAILED: Audit log verification failed.');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 13 ENTERPRISE SECURITY TESTS PASSED SUCCESSFULLY! 🎉');
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

runSecurityTests();
