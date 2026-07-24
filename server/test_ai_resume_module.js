import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { ResumeAnalysis } from './models/resumeAnalysis.model.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config();

let httpServer;

const runAIResumeTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 9 AI SERVICE + RESUME ANALYZER MODULE TESTS ---');
  console.log('=====================================================');

  try {
    const mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_phase9_test';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');

    // Clear test collections
    await Promise.all([
      Candidate.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      ResumeAnalysis.deleteMany({}),
    ]);

    const PORT = 5080;
    httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://127.0.0.1:${PORT}`;
    console.log(`✅ Server running on port ${PORT}`);

    const timeSuffix = Date.now();

    // 1. Create Test Candidates
    const candidate1 = await Candidate.create({
      fullName: 'David Sterling',
      email: `david_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      isEmailVerified: true,
      profileCompleted: true,
    });
    const candidate1Token = generateToken({ id: candidate1._id, role: 'candidate' });
    const candidate1Headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidate1Token}`,
    };

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

    // 2. Create Company & Job
    const company = await Company.create({
      companyName: 'Quantum AI Systems',
      email: `company_${timeSuffix}@quantum.ai`,
      password: 'Password123!',
      isEmailVerified: true,
    });

    const job = await Job.create({
      title: 'Senior Node.js & React Full Stack Engineer',
      department: 'Engineering',
      company: company.companyName,
      companyId: company._id,
      description: 'Building high throughput microservices with Node.js, Express, MongoDB, Docker, and React UI.',
      requiredSkills: ['Node.js', 'React', 'MongoDB', 'Docker', 'AWS'],
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'open',
      createdBy: company._id,
    });

    console.log('✅ Base test entities created.');

    // -----------------------------------------------------
    // TEST 1: Analyze Resume with Job Match (POST /api/v1/candidate/resume/analyze)
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing POST /api/v1/candidate/resume/analyze (ATS & Job Match) ...');
    const analyzePayload = {
      resumeText: `
      DAVID STERLING
      Senior Full Stack Software Engineer
      Email: david@gmail.com | Phone: +1 555-0199 | Location: San Francisco, CA

      PROFESSIONAL SUMMARY
      Accomplished Full Stack Software Engineer with 5+ years experience building web architectures using Node.js, Express, React, and MongoDB.

      TECHNICAL SKILLS
      Programming Languages: JavaScript, TypeScript, Python
      Backend & DB: Node.js, Express, MongoDB, Redis, SQL
      Frontend & Tools: React, Redux, TailwindCSS, Git, Docker

      EXPERIENCE
      Senior Backend Developer - Tech Innovations (2022 - Present)
      - Engineered REST APIs handling 100K+ daily requests using Node.js and MongoDB.
      - Reduced API latency by 35% through query optimization and caching.

      EDUCATION
      B.S. in Computer Science - University of California (2018 - 2022)
      `,
      jobId: job._id.toString(),
    };

    const res1 = await fetch(`${BASE_URL}/api/v1/candidate/resume/analyze`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify(analyzePayload),
    });
    const body1 = await res1.json();

    console.log('Analyze Status:', res1.status);
    console.log('Analysis Result Data:', JSON.stringify(body1.data, null, 2));

    if (
      res1.status === 200 &&
      body1.success === true &&
      body1.data.analysis._id &&
      typeof body1.data.analysis.atsScore === 'number' &&
      body1.data.analysis.atsScore >= 0 &&
      body1.data.analysis.atsScore <= 100 &&
      body1.data.analysis.aiResponse.jobMatch !== null
    ) {
      console.log('✅ TEST 1 PASSED: Resume ATS & Job Match Analysis executed & persisted successfully.');
    } else {
      throw new Error('❌ TEST 1 FAILED: Resume Analysis failed.');
    }

    const createdAnalysisId = body1.data.analysis._id;

    // -----------------------------------------------------
    // TEST 2: Validation Check - Missing Resume Text & File
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing Validation: Missing both file and raw text ...');
    const res2 = await fetch(`${BASE_URL}/api/v1/candidate/resume/analyze`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify({ resumeText: '' }),
    });
    const body2 = await res2.json();

    console.log('Response Status:', res2.status);

    if (res2.status === 400 && body2.success === false) {
      console.log('✅ TEST 2 PASSED: Missing input correctly rejected with 400 Bad Request.');
    } else {
      throw new Error('❌ TEST 2 FAILED: Validation failed to block empty input.');
    }

    // -----------------------------------------------------
    // TEST 3: Get Analysis History List (GET /api/v1/candidate/resume/history)
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing GET /api/v1/candidate/resume/history ...');
    const res3 = await fetch(`${BASE_URL}/api/v1/candidate/resume/history`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const body3 = await res3.json();

    console.log('History List Status:', res3.status);

    if (
      res3.status === 200 &&
      body3.success === true &&
      body3.data.history.length === 1 &&
      body3.data.history[0]._id === createdAnalysisId
    ) {
      console.log('✅ TEST 3 PASSED: Candidate analysis history list retrieved.');
    } else {
      throw new Error('❌ TEST 3 FAILED: History retrieval failed.');
    }

    // -----------------------------------------------------
    // TEST 4: Get Analysis History Detail (GET /api/v1/candidate/resume/history/:id)
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing GET /api/v1/candidate/resume/history/:id ...');
    const res4 = await fetch(`${BASE_URL}/api/v1/candidate/resume/history/${createdAnalysisId}`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const body4 = await res4.json();

    console.log('History Detail Status:', res4.status);

    if (
      res4.status === 200 &&
      body4.success === true &&
      body4.data.record._id === createdAnalysisId
    ) {
      console.log('✅ TEST 4 PASSED: Candidate analysis history detail retrieved.');
    } else {
      throw new Error('❌ TEST 4 FAILED: History detail retrieval failed.');
    }

    // -----------------------------------------------------
    // TEST 5: Security Isolation (Candidate 2 accessing Candidate 1's analysis record)
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing Candidate Security & Data Isolation ...');
    const res5 = await fetch(`${BASE_URL}/api/v1/candidate/resume/history/${createdAnalysisId}`, {
      method: 'GET',
      headers: candidate2Headers,
    });
    const body5 = await res5.json();

    console.log('Security Status:', res5.status);

    if (res5.status === 404 && body5.success === false) {
      console.log('✅ TEST 5 PASSED: Unauthorized candidate cannot access another candidate analysis (404).');
    } else {
      throw new Error('❌ TEST 5 FAILED: Security breach detected!');
    }

    // -----------------------------------------------------
    // TEST 6: Delete History Record (DELETE /api/v1/candidate/resume/history/:id)
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing DELETE /api/v1/candidate/resume/history/:id ...');
    const res6 = await fetch(`${BASE_URL}/api/v1/candidate/resume/history/${createdAnalysisId}`, {
      method: 'DELETE',
      headers: candidate1Headers,
    });
    const body6 = await res6.json();

    console.log('Delete Status:', res6.status);

    if (res6.status === 200 && body6.success === true) {
      console.log('✅ TEST 6 PASSED: Resume analysis record deleted (soft deleted).');
    } else {
      throw new Error('❌ TEST 6 FAILED: History deletion failed.');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 9 AI SERVICE & RESUME ANALYZER TESTS PASSED SUCCESSFULLY! 🎉');
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

runAIResumeTests();
