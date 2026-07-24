import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { InterviewSession } from './models/interviewSession.model.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config();

let httpServer;

const runAIInterviewTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 10 AI MOCK INTERVIEW MODULE TESTS ---');
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
      InterviewSession.deleteMany({}),
    ]);

    const PORT = 5090;
    httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://127.0.0.1:${PORT}`;
    console.log(`✅ Server running on port ${PORT}`);

    const timeSuffix = Date.now();

    // 1. Create Candidate 1
    const candidate1 = await Candidate.create({
      fullName: 'Samantha Miller',
      email: `samantha_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      skills: ['Node.js', 'React', 'MongoDB', 'System Design'],
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
      companyName: 'Apex Microservices Corp',
      email: `company_${timeSuffix}@apex.io`,
      password: 'Password123!',
      isEmailVerified: true,
    });

    const job = await Job.create({
      title: 'Senior Backend Engineer (Node.js & Cloud)',
      department: 'Platform Engineering',
      company: company.companyName,
      companyId: company._id,
      description: 'Design distributed microservices, event loops, and database indexing.',
      requiredSkills: ['Node.js', 'MongoDB', 'Docker', 'AWS'],
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'open',
      createdBy: company._id,
    });

    console.log('✅ Base test entities created.');

    // -----------------------------------------------------
    // TEST 1: Start AI Mock Interview Session (POST /api/v1/candidate/ai-interview/start)
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing POST /api/v1/candidate/ai-interview/start ...');
    const startRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-interview/start`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify({
        jobId: job._id.toString(),
        interviewType: 'Technical',
        difficulty: 'Medium',
        totalQuestions: 2,
      }),
    });
    const startBody = await startRes.json();

    console.log('Start Status:', startRes.status);
    console.log('Session Data:', JSON.stringify(startBody.data, null, 2));

    if (
      startRes.status === 201 &&
      startBody.success === true &&
      startBody.data.session._id &&
      startBody.data.session.questions.length === 1 &&
      startBody.data.session.status === 'In Progress'
    ) {
      console.log('✅ TEST 1 PASSED: AI Mock Interview session started with initial question.');
    } else {
      throw new Error('❌ TEST 1 FAILED: Start interview session failed.');
    }

    const sessionId = startBody.data.session._id;

    // -----------------------------------------------------
    // TEST 2: Get Interview Session Details (GET /api/v1/candidate/ai-interview/:sessionId)
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing GET /api/v1/candidate/ai-interview/:sessionId ...');
    const detailRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-interview/${sessionId}`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const detailBody = await detailRes.json();

    console.log('Detail Status:', detailRes.status);

    if (detailRes.status === 200 && detailBody.data.session._id === sessionId) {
      console.log('✅ TEST 2 PASSED: Interview session details retrieved successfully.');
    } else {
      throw new Error('❌ TEST 2 FAILED: Get interview session failed.');
    }

    // -----------------------------------------------------
    // TEST 3: Submit Answer to Question 1 & Receive Evaluation + Next Question
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing POST /api/v1/candidate/ai-interview/:sessionId/submit-answer (Q1) ...');
    const answerRes1 = await fetch(`${BASE_URL}/api/v1/candidate/ai-interview/${sessionId}/submit-answer`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify({
        answerText: 'In Node.js, asynchronous I/O is managed by libuv event loop. I ensure heavy CPU tasks are offloaded to worker threads or external queues to keep main looper unblocked.',
      }),
    });
    const answerBody1 = await answerRes1.json();

    console.log('Submit Answer Q1 Status:', answerRes1.status);
    console.log('Evaluation Q1:', JSON.stringify(answerBody1.data.evaluatedAnswer, null, 2));

    if (
      answerRes1.status === 200 &&
      answerBody1.success === true &&
      typeof answerBody1.data.evaluatedAnswer.technicalAccuracy === 'number' &&
      answerBody1.data.nextQuestion !== null
    ) {
      console.log('✅ TEST 3 PASSED: Answer 1 evaluated across 6 metrics & next adaptive question generated.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Submit answer Q1 failed.');
    }

    // -----------------------------------------------------
    // TEST 4: Submit Answer to Question 2 (Completing questions)
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing POST /api/v1/candidate/ai-interview/:sessionId/submit-answer (Q2) ...');
    const answerRes2 = await fetch(`${BASE_URL}/api/v1/candidate/ai-interview/${sessionId}/submit-answer`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify({
        answerText: 'For MongoDB optimization, I create compound indexes following the ESR rule and analyze execution stats using explain query planner to ensure covered index scans.',
      }),
    });
    const answerBody2 = await answerRes2.json();

    console.log('Submit Answer Q2 Status:', answerRes2.status);
    console.log('Is Complete:', answerBody2.data.isInterviewComplete);

    if (answerRes2.status === 200 && answerBody2.data.isInterviewComplete === true) {
      console.log('✅ TEST 4 PASSED: Final answer submitted and session flagged as complete.');
    } else {
      throw new Error('❌ TEST 4 FAILED: Submit answer Q2 failed.');
    }

    // -----------------------------------------------------
    // TEST 5: Finish Interview & Generate Recruiter Report (POST /api/v1/candidate/ai-interview/:sessionId/finish)
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing POST /api/v1/candidate/ai-interview/:sessionId/finish ...');
    const finishRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-interview/${sessionId}/finish`, {
      method: 'POST',
      headers: candidate1Headers,
    });
    const finishBody = await finishRes.json();

    console.log('Finish Status:', finishRes.status);
    console.log('Final Report Data:', JSON.stringify(finishBody.data.session.feedback, null, 2));
    console.log('Overall Score:', finishBody.data.session.overallScore);

    if (
      finishRes.status === 200 &&
      finishBody.data.session.status === 'Completed' &&
      typeof finishBody.data.session.overallScore === 'number' &&
      finishBody.data.session.feedback.hiringRecommendation !== undefined
    ) {
      console.log('✅ TEST 5 PASSED: Interview finished & final recruiter evaluation report compiled.');
    } else {
      throw new Error('❌ TEST 5 FAILED: Finish interview session failed.');
    }

    // -----------------------------------------------------
    // TEST 6: Get Candidate Interview History List (GET /api/v1/candidate/ai-interview/history)
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing GET /api/v1/candidate/ai-interview/history ...');
    const historyRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-interview/history`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const historyBody = await historyRes.json();

    console.log('History Status:', historyRes.status);

    if (historyRes.status === 200 && historyBody.data.history.length === 1) {
      console.log('✅ TEST 6 PASSED: Candidate interview history list retrieved.');
    } else {
      throw new Error('❌ TEST 6 FAILED: Get interview history failed.');
    }

    // -----------------------------------------------------
    // TEST 7: Candidate Security Isolation (Candidate 2 accessing Candidate 1's interview session)
    // -----------------------------------------------------
    console.log('\n[TEST 7] Testing Candidate Security & Data Isolation ...');
    const secRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-interview/${sessionId}`, {
      method: 'GET',
      headers: candidate2Headers,
    });
    const secBody = await secRes.json();

    console.log('Security Check Status:', secRes.status);

    if (secRes.status === 404 && secBody.success === false) {
      console.log('✅ TEST 7 PASSED: Candidate 2 blocked from accessing Candidate 1 session (404).');
    } else {
      throw new Error('❌ TEST 7 FAILED: Security breach detected!');
    }

    // -----------------------------------------------------
    // TEST 8: Delete Interview Session (DELETE /api/v1/candidate/ai-interview/history/:sessionId)
    // -----------------------------------------------------
    console.log('\n[TEST 8] Testing DELETE /api/v1/candidate/ai-interview/history/:sessionId ...');
    const deleteRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-interview/history/${sessionId}`, {
      method: 'DELETE',
      headers: candidate1Headers,
    });
    const deleteBody = await deleteRes.json();

    console.log('Delete Status:', deleteRes.status);

    if (deleteRes.status === 200 && deleteBody.success === true) {
      console.log('✅ TEST 8 PASSED: Interview session deleted (soft delete).');
    } else {
      throw new Error('❌ TEST 8 FAILED: Delete interview session failed.');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 10 AI MOCK INTERVIEW TESTS PASSED SUCCESSFULLY! 🎉');
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

runAIInterviewTests();
