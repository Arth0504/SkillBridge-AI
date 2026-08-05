import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { VideoInterview } from './models/videoInterview.model.js';
import { generateToken } from './utils/generateToken.js';
import { ROLES } from './config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';

async function runVideoInterviewStartFixTest() {
  console.log('\n===============================================================');
  console.log('🚀 AI VIDEO INTERVIEW START BUG FIX QA VERIFICATION');
  console.log('===============================================================\n');

  let server;
  let baseUrl;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    // Spin up ephemeral test server instance
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`✅ Test server running on: ${baseUrl}`);

    // 1. Get or create candidate
    let candidate = await Candidate.findOne({ isDeleted: { $ne: true } });
    if (!candidate) {
      candidate = await Candidate.create({
        fullName: 'Fix Candidate Test',
        email: 'fixcandidate@skillbridge.ai',
        password: 'Password123!',
      });
    }

    const token = generateToken({ id: candidate._id.toString(), role: ROLES.CANDIDATE });
    console.log(`📌 Testing Candidate: ${candidate.fullName} (${candidate._id})`);

    // TEST 1: Send empty payload {} (No companyId, No jobId provided)
    console.log('\n[TEST 1] Testing POST /api/v1/candidate/video-interview/start with EMPTY payload {}...');
    const emptyPayloadRes = await fetch(`${baseUrl}/api/v1/candidate/video-interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const emptyPayloadJson = await emptyPayloadRes.json();
    console.log(`Status Code: ${emptyPayloadRes.status}`);
    console.log('Response Payload:', JSON.stringify(emptyPayloadJson, null, 2));

    if (emptyPayloadRes.status === 200 || emptyPayloadRes.status === 201) {
      console.log('✅ [PASS] POST /api/v1/candidate/video-interview/start returned HTTP 200/201 OK for empty payload!');
    } else {
      console.error(`❌ [FAIL] Expected 200/201 OK but got ${emptyPayloadRes.status}`);
      process.exit(1);
    }

    // Verify response properties
    const resData = emptyPayloadJson.data;
    if (resData?.interviewId && resData?.sessionToken && resData?.greetingText && resData?.firstQuestion) {
      console.log('✅ [PASS] Response payload contains interviewId, sessionToken, greetingText, & firstQuestion!');
    } else {
      console.error('❌ [FAIL] Missing expected properties in response payload');
      process.exit(1);
    }

    // TEST 2: Send custom title payload
    console.log('\n[TEST 2] Testing POST /api/v1/candidate/video-interview/start with title & duration payload...');
    const customPayloadRes = await fetch(`${baseUrl}/api/v1/candidate/video-interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'AI Automated Video Screening',
        durationMinutes: 15,
      }),
    });

    const customPayloadJson = await customPayloadRes.json();
    console.log(`Status Code: ${customPayloadRes.status}`);

    if (customPayloadRes.status === 200 || customPayloadRes.status === 201) {
      console.log('✅ [PASS] POST /api/v1/candidate/video-interview/start returned HTTP 200/201 OK for custom title payload!');
    } else {
      console.error(`❌ [FAIL] Expected 200/201 OK but got ${customPayloadRes.status}`);
      process.exit(1);
    }

    console.log('\n===============================================================');
    console.log('🎉 ALL VIDEO INTERVIEW START BUG FIX QA TESTS PASSED CLEANLY!');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runVideoInterviewStartFixTest();
