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

async function runFullVideoInterviewE2ETest() {
  console.log('\n===============================================================');
  console.log('🚀 MASTER E2E QA AUDIT: AI VIDEO INTERVIEW LIFECYCLE');
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
    console.log(`✅ Test server active on: ${baseUrl}`);

    let candidate = await Candidate.findOne({ isDeleted: { $ne: true } });
    if (!candidate) {
      candidate = await Candidate.create({
        fullName: 'E2E Video Candidate',
        email: 'e2evideo@skillbridge.ai',
        password: 'Password123!',
      });
    }

    const token = generateToken({ id: candidate._id.toString(), role: ROLES.CANDIDATE });
    console.log(`📌 Candidate authenticated: ${candidate.fullName} (${candidate._id})`);

    // STEP 1: Candidate clicks "Start AI Interview" (POST /api/v1/candidate/video-interview/start)
    console.log('\n📌 STEP 1: Candidate starts AI Video Interview session...');
    const startRes = await fetch(`${baseUrl}/api/v1/candidate/video-interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Senior Full Stack AI Video Screening',
        interviewType: 'Technical',
        totalQuestions: 3,
      }),
    });

    const startJson = await startRes.json();
    console.log(`HTTP Status: ${startRes.status}`);

    if (startRes.status !== 200 && startRes.status !== 201) {
      console.error(`❌ [FAIL] Start endpoint returned HTTP ${startRes.status}`, startJson);
      process.exit(1);
    }

    const interviewData = startJson.data?.videoInterview || startJson.data?.interview || startJson.data;
    const interviewId = interviewData._id || startJson.data?.interviewId;
    const sessionToken = startJson.data?.sessionToken;
    const questions = interviewData.questions || [];

    console.log(`✅ AI Video Interview Created: ${interviewId}`);
    console.log(`Session Token: ${sessionToken}`);
    console.log(`Questions Count: ${questions.length}`);
    console.log(`First Question: "${questions[0]?.questionText}"`);

    // STEP 2: Candidate initializes active session (POST /api/v1/candidate/video-interview/:id/start-session)
    console.log('\n📌 STEP 2: Initializing active candidate session...');
    const sessionStartRes = await fetch(`${baseUrl}/api/v1/candidate/video-interview/${interviewId}/start-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const sessionStartJson = await sessionStartRes.json();
    console.log(`HTTP Status: ${sessionStartRes.status}`);
    const activeStatus = sessionStartJson.data?.interview?.status;
    console.log(`Session Status: ${activeStatus}`);

    if (sessionStartRes.status !== 200 || activeStatus !== 'In Progress') {
      console.error(`❌ [FAIL] Start session failed or status is not 'In Progress'`);
      process.exit(1);
    }
    console.log('✅ [PASS] Video interview status updated to "In Progress".');

    // STEP 3: Retrieve interview details by ID (GET /api/v1/candidate/video-interview/:id)
    console.log('\n📌 STEP 3: Fetching interview details by ID...');
    const detailRes = await fetch(`${baseUrl}/api/v1/candidate/video-interview/${interviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const detailJson = await detailRes.json();
    console.log(`HTTP Status: ${detailRes.status}`);
    if (detailRes.status !== 200) {
      console.error(`❌ [FAIL] Fetch interview detail failed.`);
      process.exit(1);
    }
    console.log('✅ [PASS] Retrieved interview details successfully.');

    // STEP 4: Candidate records & submits video responses for each question
    console.log('\n📌 STEP 4: Submitting video responses & AI evaluations...');
    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      console.log(`\nSubmitting response for Question ${idx + 1}: "${q.questionText}"`);

      const submitRes = await fetch(`${baseUrl}/api/v1/candidate/video-interview/${interviewId}/submit-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: q.questionId,
          videoUrl: `https://res.cloudinary.com/skillbridge/video/upload/v1/interviews/response_q${idx + 1}.mp4`,
          durationSeconds: 90,
          resolution: '1920x1080',
          transcriptText: `This is my video answer for question ${idx + 1}. In my previous role, I led the full-stack architecture using React 18, Node.js, and MongoDB. We optimized render performance and database indexes using explain executionStats.`,
        }),
      });

      const submitJson = await submitRes.json();
      console.log(`HTTP Status: ${submitRes.status}`);

      if (submitRes.status !== 200) {
        console.error(`❌ [FAIL] Video response submission failed on question ${idx + 1}`, submitJson);
        process.exit(1);
      }

      const evalData = submitJson.data?.evaluatedResponse?.evaluation;
      console.log(`✅ Question ${idx + 1} Evaluated Score: ${evalData?.overallResponseScore}% (Comm: ${evalData?.communication}%, Tech: ${evalData?.technicalAccuracy}%)`);
    }

    // STEP 5: Finish Video Interview & Generate Executive Report
    console.log('\n📌 STEP 5: Finishing video interview & compiling executive report...');
    const finishRes = await fetch(`${baseUrl}/api/v1/candidate/video-interview/${interviewId}/finish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const finishJson = await finishRes.json();
    console.log(`HTTP Status: ${finishRes.status}`);

    if (finishRes.status !== 200) {
      console.error(`❌ [FAIL] Finishing video interview failed`, finishJson);
      process.exit(1);
    }

    const finalDoc = finishJson.data?.interview;
    console.log(`✅ Interview Final Status: ${finalDoc?.status}`);
    console.log(`✅ Overall Score: ${finalDoc?.overallScore}%`);
    console.log(`✅ Recommendation: ${finalDoc?.feedback?.hiringRecommendation}`);
    console.log(`✅ Summary: "${finalDoc?.feedback?.recruiterSummary}"`);

    if (finalDoc?.status !== 'Completed') {
      console.error(`❌ [FAIL] Expected status 'Completed' but got '${finalDoc?.status}'`);
      process.exit(1);
    }

    // STEP 6: Check Candidate Video History (GET /api/v1/candidate/video-interview/history)
    console.log('\n📌 STEP 6: Verifying Candidate Video History list...');
    const historyRes = await fetch(`${baseUrl}/api/v1/candidate/video-interview/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const historyJson = await historyRes.json();
    console.log(`HTTP Status: ${historyRes.status}`);

    if (historyRes.status !== 200) {
      console.error(`❌ [FAIL] Video history request failed`);
      process.exit(1);
    }

    const historyList = historyJson.data?.history || historyJson.data || [];
    console.log(`Candidate History Count: ${historyList.length}`);
    const foundSession = historyList.find((item) => item._id.toString() === interviewId.toString());

    if (foundSession) {
      console.log('✅ [PASS] Completed video interview session is listed in Candidate Video History!');
    } else {
      console.error('❌ [FAIL] Session not found in candidate history');
      process.exit(1);
    }

    console.log('\n===============================================================');
    console.log('🎉 MASTER E2E QA AUDIT: AI VIDEO INTERVIEW PASSED WITH ZERO ERRORS!');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('❌ Master E2E Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runFullVideoInterviewE2ETest();
