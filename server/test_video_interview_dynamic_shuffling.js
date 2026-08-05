import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { generateToken } from './utils/generateToken.js';
import { ROLES } from './config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';

async function runDynamicShufflingTest() {
  console.log('\n===============================================================');
  console.log('🚀 MULTI-SESSION AI VIDEO INTERVIEW DYNAMIC SHUFFLING TEST');
  console.log('===============================================================\n');

  let server;
  let baseUrl;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    let candidate = await Candidate.findOne({ isDeleted: { $ne: true } });
    if (!candidate) {
      candidate = await Candidate.create({
        fullName: 'Dynamic Video Candidate',
        email: 'dynamicvideo@skillbridge.ai',
        password: 'Password123!',
      });
    }

    const token = generateToken({ id: candidate._id.toString(), role: ROLES.CANDIDATE });

    const sessionQuestions = [];

    // Run 3 consecutive interview sessions
    for (let sessionNum = 1; sessionNum <= 3; sessionNum++) {
      console.log(`\n📌 Starting Video Interview Session #${sessionNum}...`);
      const startRes = await fetch(`${baseUrl}/api/v1/candidate/video-interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Session ${sessionNum} AI Screening`,
          interviewType: 'Technical',
          totalQuestions: 3,
        }),
      });

      const startJson = await startRes.json();
      console.log(`HTTP Status: ${startRes.status}`);

      if (startRes.status !== 200 && startRes.status !== 201) {
        console.error(`❌ [FAIL] Session #${sessionNum} failed to start`);
        process.exit(1);
      }

      const interviewData = startJson.data?.videoInterview || startJson.data?.interview || startJson.data;
      const questions = interviewData.questions || [];
      const questionTexts = questions.map((q) => q.questionText);

      console.log(`Session #${sessionNum} Questions:`);
      questionTexts.forEach((q, idx) => console.log(`  ${idx + 1}. "${q}"`));

      sessionQuestions.push(questionTexts);
    }

    console.log('\n===============================================================');
    console.log('🔍 VERIFYING MULTI-SESSION QUESTION DIVERSITY');
    console.log('===============================================================');

    const firstQuestions = sessionQuestions.map((sq) => sq[0]);
    console.log('\nFirst Question of Each Session:');
    firstQuestions.forEach((q, idx) => console.log(`  Session #${idx + 1}: "${q}"`));

    // Verify session 1 and session 2 are not 100% identical
    const s1Str = JSON.stringify(sessionQuestions[0]);
    const s2Str = JSON.stringify(sessionQuestions[1]);
    const s3Str = JSON.stringify(sessionQuestions[2]);

    if (s1Str === s2Str && s2Str === s3Str) {
      console.error('\n❌ [FAIL] Question sequences were identical across sessions!');
      process.exit(1);
    }

    console.log('\n===============================================================');
    console.log('🎉 ALL DYNAMIC SHUFFLING & MULTI-SESSION DIVERSITY TESTS PASSED!');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('❌ Dynamic Shuffling Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runDynamicShufflingTest();
