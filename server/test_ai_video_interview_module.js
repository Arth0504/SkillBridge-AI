import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { VideoInterview } from './models/videoInterview.model.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config();

let httpServer;

const runAIVideoInterviewTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 12 AI VIDEO INTERVIEW MODULE TESTS ---');
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
      Job.deleteMany({}),
      VideoInterview.deleteMany({}),
    ]);

    const PORT = 5098;
    httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://127.0.0.1:${PORT}`;
    console.log(`✅ Server running on port ${PORT}`);

    const timeSuffix = Date.now();

    // 1. Create Candidate 1
    const candidate1 = await Candidate.create({
      fullName: 'Marcus Vance',
      email: `marcus_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      skills: ['Node.js', 'System Design', 'Leadership', 'React'],
      isEmailVerified: true,
    });
    const candidate1Token = generateToken({ id: candidate1._id, role: 'candidate' });
    const candidate1Headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidate1Token}`,
    };

    // 2. Create Candidate 2 (Security test)
    const candidate2 = await Candidate.create({
      fullName: 'Other Candidate',
      email: `other_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    const candidate2Token = generateToken({ id: candidate2._id, role: 'candidate' });
    const candidate2Headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidate2Token}`,
    };

    // 3. Create Company & Job
    const company = await Company.create({
      companyName: 'Apex Cloud Solutions',
      email: `company_${timeSuffix}@apexcloud.io`,
      password: 'Password123!',
      isEmailVerified: true,
    });

    const job = await Job.create({
      title: 'Senior Engineering Lead',
      department: 'Cloud Architecture',
      company: company.companyName,
      companyId: company._id,
      description: 'Lead engineering teams, design microservices, and foster technical culture.',
      requiredSkills: ['Node.js', 'System Design', 'Leadership'],
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'open',
      createdBy: company._id,
    });

    console.log('✅ Base test entities created.');

    // -----------------------------------------------------
    // TEST 1: Create & Schedule AI Video Interview (POST /api/v1/candidate/video-interview/start)
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing POST /api/v1/candidate/video-interview/start ...');
    const startRes = await fetch(`${BASE_URL}/api/v1/candidate/video-interview/start`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify({
        companyId: company._id.toString(),
        jobId: job._id.toString(),
        title: 'Asynchronous Senior Engineering Lead Interview',
        description: 'HireVue-style asynchronous video assessment.',
        interviewType: 'Technical',
        customQuestions: ['What is your approach to technical debt refactoring?'],
        totalQuestions: 2,
      }),
    });
    const startBody = await startRes.json();

    console.log('Start Status:', startRes.status);
    console.log('Video Interview Data:', JSON.stringify(startBody.data, null, 2));

    if (
      startRes.status === 201 &&
      startBody.success === true &&
      startBody.data.videoInterview._id &&
      startBody.data.videoInterview.status === 'Scheduled' &&
      startBody.data.videoInterview.questions.length === 2
    ) {
      console.log('✅ TEST 1 PASSED: AI Video Interview scheduled with generated & custom questions.');
    } else {
      throw new Error('❌ TEST 1 FAILED: Schedule video interview failed.');
    }

    const interviewId = startBody.data.videoInterview._id;
    const questionId1 = startBody.data.videoInterview.questions[0].questionId;

    // -----------------------------------------------------
    // TEST 2: Start Candidate Active Session (POST /api/v1/candidate/video-interview/:id/start-session)
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing POST /api/v1/candidate/video-interview/:id/start-session ...');
    const sessionRes = await fetch(`${BASE_URL}/api/v1/candidate/video-interview/${interviewId}/start-session`, {
      method: 'POST',
      headers: candidate1Headers,
    });
    const sessionBody = await sessionRes.json();

    console.log('Start Session Status:', sessionRes.status);

    if (sessionRes.status === 200 && sessionBody.data.interview.status === 'In Progress') {
      console.log('✅ TEST 2 PASSED: Active video interview session started.');
    } else {
      throw new Error('❌ TEST 2 FAILED: Start session failed.');
    }

    // -----------------------------------------------------
    // TEST 3: Get Video Interview Details (GET /api/v1/candidate/video-interview/:id)
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing GET /api/v1/candidate/video-interview/:id ...');
    const detailRes = await fetch(`${BASE_URL}/api/v1/candidate/video-interview/${interviewId}`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const detailBody = await detailRes.json();

    console.log('Detail Status:', detailRes.status);

    if (detailRes.status === 200 && detailBody.data.interview._id === interviewId) {
      console.log('✅ TEST 3 PASSED: Video interview details retrieved successfully.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Get video interview details failed.');
    }

    // -----------------------------------------------------
    // TEST 4: Submit Cloudinary Video Response (POST /api/v1/candidate/video-interview/:id/submit-video)
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing POST /api/v1/candidate/video-interview/:id/submit-video ...');
    const submitRes = await fetch(`${BASE_URL}/api/v1/candidate/video-interview/${interviewId}/submit-video`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify({
        questionId: questionId1,
        videoUrl: 'https://res.cloudinary.com/skillbridge/video/upload/v123456/interview_q1.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/skillbridge/image/upload/v123456/interview_q1_thumb.jpg',
        durationSeconds: 110,
        fileSizeBytes: 4200000,
        resolution: '1920x1080',
        transcriptText: 'When managing technical debt, we set aside 20% of each sprint capacity for refactoring core modules, measuring latency gains with APM tools.',
      }),
    });
    const submitBody = await submitRes.json();

    console.log('Submit Video Response Status:', submitRes.status);
    console.log('Evaluated Response:', JSON.stringify(submitBody.data.evaluatedResponse, null, 2));

    if (
      submitRes.status === 200 &&
      submitBody.success === true &&
      submitBody.data.evaluatedResponse.videoUrl &&
      typeof submitBody.data.evaluatedResponse.evaluation.communication === 'number' &&
      submitBody.data.evaluatedResponse.evaluation.bodyLanguageScore !== undefined
    ) {
      console.log('✅ TEST 4 PASSED: Cloudinary video response registered & Gemini transcript evaluated.');
    } else {
      throw new Error('❌ TEST 4 FAILED: Submit video response failed.');
    }

    // -----------------------------------------------------
    // TEST 5: Finish Video Interview & Generate Executive Report (POST /api/v1/candidate/video-interview/:id/finish)
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing POST /api/v1/candidate/video-interview/:id/finish ...');
    const finishRes = await fetch(`${BASE_URL}/api/v1/candidate/video-interview/${interviewId}/finish`, {
      method: 'POST',
      headers: candidate1Headers,
    });
    const finishBody = await finishRes.json();

    console.log('Finish Status:', finishRes.status);
    console.log('Final Report Data:', JSON.stringify(finishBody.data.interview.feedback, null, 2));

    if (
      finishRes.status === 200 &&
      finishBody.data.interview.status === 'Completed' &&
      typeof finishBody.data.interview.overallScore === 'number' &&
      Array.isArray(finishBody.data.interview.feedback.strengths)
    ) {
      console.log('✅ TEST 5 PASSED: Video interview finished & executive report compiled.');
    } else {
      throw new Error('❌ TEST 5 FAILED: Finish video interview failed.');
    }

    // -----------------------------------------------------
    // TEST 6: Get Candidate Video History List (GET /api/v1/candidate/video-interview/history)
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing GET /api/v1/candidate/video-interview/history ...');
    const historyRes = await fetch(`${BASE_URL}/api/v1/candidate/video-interview/history`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const historyBody = await historyRes.json();

    console.log('History Status:', historyRes.status);

    if (historyRes.status === 200 && historyBody.data.history.length === 1) {
      console.log('✅ TEST 6 PASSED: Candidate video interview history retrieved.');
    } else {
      throw new Error('❌ TEST 6 FAILED: Get video history failed.');
    }

    // -----------------------------------------------------
    // TEST 7: Candidate Security Isolation (Candidate 2 accessing Candidate 1's video interview)
    // -----------------------------------------------------
    console.log('\n[TEST 7] Testing Candidate Security & Data Isolation ...');
    const secRes = await fetch(`${BASE_URL}/api/v1/candidate/video-interview/${interviewId}`, {
      method: 'GET',
      headers: candidate2Headers,
    });
    const secBody = await secRes.json();

    console.log('Security Check Status:', secRes.status);

    if (secRes.status === 404 && secBody.success === false) {
      console.log('✅ TEST 7 PASSED: Candidate 2 blocked from accessing Candidate 1 video interview (404).');
    } else {
      throw new Error('❌ TEST 7 FAILED: Security breach detected!');
    }

    // -----------------------------------------------------
    // TEST 8: Delete Video Interview (DELETE /api/v1/candidate/video-interview/history/:id)
    // -----------------------------------------------------
    console.log('\n[TEST 8] Testing DELETE /api/v1/candidate/video-interview/history/:id ...');
    const deleteRes = await fetch(`${BASE_URL}/api/v1/candidate/video-interview/history/${interviewId}`, {
      method: 'DELETE',
      headers: candidate1Headers,
    });
    const deleteBody = await deleteRes.json();

    console.log('Delete Status:', deleteRes.status);

    if (deleteRes.status === 200 && deleteBody.success === true) {
      console.log('✅ TEST 8 PASSED: Video interview session soft deleted.');
    } else {
      throw new Error('❌ TEST 8 FAILED: Delete video interview failed.');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 12 AI VIDEO INTERVIEW TESTS PASSED SUCCESSFULLY! 🎉');
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

runAIVideoInterviewTests();
