import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { CodingAssessment } from './models/codingAssessment.model.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config();

let httpServer;

const runAICodingTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 11 AI CODING ASSESSMENT MODULE TESTS ---');
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
      CodingAssessment.deleteMany({}),
    ]);

    const PORT = 5095;
    httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://127.0.0.1:${PORT}`;
    console.log(`✅ Server running on port ${PORT}`);

    const timeSuffix = Date.now();

    // 1. Create Candidate 1
    const candidate1 = await Candidate.create({
      fullName: 'Elena Rostova',
      email: `elena_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      skills: ['Python', 'Data Structures', 'SQL', 'Algorithms'],
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
      companyName: 'DataScale Systems',
      email: `company_${timeSuffix}@datascale.io`,
      password: 'Password123!',
      isEmailVerified: true,
    });

    const job = await Job.create({
      title: 'Python Algorithmic Software Engineer',
      department: 'Data Engineering',
      company: company.companyName,
      companyId: company._id,
      description: 'Algorithmic optimization, data structures, and SQL query tuning.',
      requiredSkills: ['Python', 'SQL', 'Algorithms', 'Docker'],
      experienceLevel: 'mid',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'open',
      createdBy: company._id,
    });

    console.log('✅ Base test entities created.');

    // -----------------------------------------------------
    // TEST 1: Start AI Coding Assessment (POST /api/v1/candidate/ai-coding/start)
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing POST /api/v1/candidate/ai-coding/start ...');
    const startRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-coding/start`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify({
        jobId: job._id.toString(),
        language: 'Python',
        difficulty: 'Medium',
        questionType: 'Coding Challenge',
        totalQuestions: 2,
      }),
    });
    const startBody = await startRes.json();

    console.log('Start Status:', startRes.status);
    console.log('Assessment Data:', JSON.stringify(startBody.data, null, 2));

    if (
      startRes.status === 201 &&
      startBody.success === true &&
      startBody.data.assessment._id &&
      startBody.data.assessment.language === 'Python' &&
      startBody.data.assessment.questions.length === 1 &&
      startBody.data.assessment.status === 'In Progress'
    ) {
      console.log('✅ TEST 1 PASSED: AI Coding Assessment started with initial Python question.');
    } else {
      throw new Error('❌ TEST 1 FAILED: Start coding assessment failed.');
    }

    const assessmentId = startBody.data.assessment._id;

    // -----------------------------------------------------
    // TEST 2: Get Coding Assessment Details (GET /api/v1/candidate/ai-coding/:assessmentId)
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing GET /api/v1/candidate/ai-coding/:assessmentId ...');
    const detailRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-coding/${assessmentId}`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const detailBody = await detailRes.json();

    console.log('Detail Status:', detailRes.status);

    if (detailRes.status === 200 && detailBody.data.assessment._id === assessmentId) {
      console.log('✅ TEST 2 PASSED: Coding assessment details retrieved successfully.');
    } else {
      throw new Error('❌ TEST 2 FAILED: Get coding assessment details failed.');
    }

    // -----------------------------------------------------
    // TEST 3: Submit Answer to Question 1 & Receive AI Evaluation + Next Question
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing POST /api/v1/candidate/ai-coding/:assessmentId/submit-answer (Q1) ...');
    const submitRes1 = await fetch(`${BASE_URL}/api/v1/candidate/ai-coding/${assessmentId}/submit-answer`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify({
        submittedAnswer: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`,
      }),
    });
    const submitBody1 = await submitRes1.json();

    console.log('Submit Code Q1 Status:', submitRes1.status);
    console.log('Evaluation Q1:', JSON.stringify(submitBody1.data.evaluatedAnswer, null, 2));

    if (
      submitRes1.status === 200 &&
      submitBody1.success === true &&
      typeof submitBody1.data.evaluatedAnswer.correctness === 'number' &&
      submitBody1.data.evaluatedAnswer.timeComplexity !== undefined &&
      submitBody1.data.nextQuestion !== null
    ) {
      console.log('✅ TEST 3 PASSED: Code 1 evaluated (Complexity & Quality) and next question generated.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Submit code Q1 failed.');
    }

    // -----------------------------------------------------
    // TEST 4: Submit Answer to Question 2 (Completing assessment)
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing POST /api/v1/candidate/ai-coding/:assessmentId/submit-answer (Q2) ...');
    const submitRes2 = await fetch(`${BASE_URL}/api/v1/candidate/ai-coding/${assessmentId}/submit-answer`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify({
        submittedAnswer: 'B) O(log N)',
      }),
    });
    const submitBody2 = await submitRes2.json();

    console.log('Submit Code Q2 Status:', submitRes2.status);
    console.log('Is Complete:', submitBody2.data.isAssessmentComplete);

    if (submitRes2.status === 200 && submitBody2.data.isAssessmentComplete === true) {
      console.log('✅ TEST 4 PASSED: Final answer submitted and assessment marked complete.');
    } else {
      throw new Error('❌ TEST 4 FAILED: Submit code Q2 failed.');
    }

    // -----------------------------------------------------
    // TEST 5: Finish Assessment & Generate Final Code Report (POST /api/v1/candidate/ai-coding/:assessmentId/finish)
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing POST /api/v1/candidate/ai-coding/:assessmentId/finish ...');
    const finishRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-coding/${assessmentId}/finish`, {
      method: 'POST',
      headers: candidate1Headers,
    });
    const finishBody = await finishRes.json();

    console.log('Finish Status:', finishRes.status);
    console.log('Final Report Data:', JSON.stringify(finishBody.data.assessment.feedback, null, 2));

    if (
      finishRes.status === 200 &&
      finishBody.data.assessment.status === 'Completed' &&
      typeof finishBody.data.assessment.score === 'number' &&
      Array.isArray(finishBody.data.assessment.feedback.strengths)
    ) {
      console.log('✅ TEST 5 PASSED: Assessment finished & final code report compiled.');
    } else {
      throw new Error('❌ TEST 5 FAILED: Finish coding assessment failed.');
    }

    // -----------------------------------------------------
    // TEST 6: Get Candidate Coding History List (GET /api/v1/candidate/ai-coding/history)
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing GET /api/v1/candidate/ai-coding/history ...');
    const historyRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-coding/history`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const historyBody = await historyRes.json();

    console.log('History Status:', historyRes.status);

    if (historyRes.status === 200 && historyBody.data.history.length === 1) {
      console.log('✅ TEST 6 PASSED: Candidate coding assessment history retrieved.');
    } else {
      throw new Error('❌ TEST 6 FAILED: Get coding history failed.');
    }

    // -----------------------------------------------------
    // TEST 7: Candidate Security Isolation (Candidate 2 accessing Candidate 1's assessment)
    // -----------------------------------------------------
    console.log('\n[TEST 7] Testing Candidate Security & Data Isolation ...');
    const secRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-coding/${assessmentId}`, {
      method: 'GET',
      headers: candidate2Headers,
    });
    const secBody = await secRes.json();

    console.log('Security Check Status:', secRes.status);

    if (secRes.status === 404 && secBody.success === false) {
      console.log('✅ TEST 7 PASSED: Candidate 2 blocked from accessing Candidate 1 assessment (404).');
    } else {
      throw new Error('❌ TEST 7 FAILED: Security breach detected!');
    }

    // -----------------------------------------------------
    // TEST 8: Delete Coding Assessment (DELETE /api/v1/candidate/ai-coding/history/:assessmentId)
    // -----------------------------------------------------
    console.log('\n[TEST 8] Testing DELETE /api/v1/candidate/ai-coding/history/:assessmentId ...');
    const deleteRes = await fetch(`${BASE_URL}/api/v1/candidate/ai-coding/history/${assessmentId}`, {
      method: 'DELETE',
      headers: candidate1Headers,
    });
    const deleteBody = await deleteRes.json();

    console.log('Delete Status:', deleteRes.status);

    if (deleteRes.status === 200 && deleteBody.success === true) {
      console.log('✅ TEST 8 PASSED: Coding assessment record soft deleted.');
    } else {
      throw new Error('❌ TEST 8 FAILED: Delete coding assessment failed.');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 11 AI CODING ASSESSMENT TESTS PASSED SUCCESSFULLY! 🎉');
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

runAICodingTests();
