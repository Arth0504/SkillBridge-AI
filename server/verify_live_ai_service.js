import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { ResumeAnalysis } from './models/resumeAnalysis.model.js';
import { generateToken } from './utils/generateToken.js';
import { extractTextFromBuffer, analyzeATSWithAI, matchJobWithAI } from './services/ai.service.js';

dotenv.config();

const FASTAPI_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const SHARED_SECRET = process.env.AI_SHARED_SECRET || 'skillbridge_secret_ai_key_2026';

const runVerification = async () => {
  console.log('=====================================================');
  console.log('--- STARTING LIVE FASTAPI AI SERVICE VERIFICATION ---');
  console.log('=====================================================');
  console.log(`Configured AI_SERVICE_URL: ${FASTAPI_URL}`);

  let report = {
    serviceHealth: 'UNKNOWN',
    endpointResults: {},
    geminiStatus: 'UNKNOWN',
    integrationStatus: 'UNKNOWN',
    errors: [],
  };

  try {
    // -----------------------------------------------------
    // PART 1 & 2: Test Direct Endpoints of FastAPI Service
    // -----------------------------------------------------
    console.log('\n[1] Testing Direct FastAPI Endpoints ...');

    // 1. GET /
    try {
      const resRoot = await fetch(`${FASTAPI_URL}/`);
      const bodyRoot = await resRoot.json();
      console.log('GET / Response:', resRoot.status, bodyRoot);
      report.endpointResults['GET /'] = resRoot.status === 200 && bodyRoot.status === 'running' ? 'PASSED' : 'FAILED';
    } catch (e) {
      report.endpointResults['GET /'] = `FAILED: ${e.message}`;
      report.errors.push(`GET / failed: ${e.message}`);
    }

    // 2. GET /health
    try {
      const resHealth = await fetch(`${FASTAPI_URL}/health`);
      const bodyHealth = await resHealth.json();
      console.log('GET /health Response:', resHealth.status, bodyHealth);
      if (resHealth.status === 200 && bodyHealth.status === 'healthy') {
        report.serviceHealth = 'HEALTHY';
        report.endpointResults['GET /health'] = 'PASSED';
      } else {
        report.serviceHealth = 'UNHEALTHY';
        report.endpointResults['GET /health'] = 'FAILED';
      }
    } catch (e) {
      report.serviceHealth = `OFFLINE (${e.message})`;
      report.endpointResults['GET /health'] = `FAILED: ${e.message}`;
      report.errors.push(`GET /health failed: ${e.message}`);
    }

    // 3. POST /api/v1/ai/analyze-resume (With Secret Key)
    try {
      const resAnalyze = await fetch(`${FASTAPI_URL}/api/v1/ai/analyze-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-SECRET-KEY': SHARED_SECRET,
        },
        body: JSON.stringify({
          resumeText: 'Full Stack Node.js and React Developer with MongoDB expertise.',
          jobDescription: 'Software Engineer Node.js',
        }),
      });
      const bodyAnalyze = await resAnalyze.json();
      console.log('POST /api/v1/ai/analyze-resume Response Status:', resAnalyze.status);
      console.log('ATS Score:', bodyAnalyze.overallAtsScore);
      report.endpointResults['POST /api/v1/ai/analyze-resume'] =
        resAnalyze.status === 200 && typeof bodyAnalyze.overallAtsScore === 'number' ? 'PASSED' : 'FAILED';
    } catch (e) {
      report.endpointResults['POST /api/v1/ai/analyze-resume'] = `FAILED: ${e.message}`;
      report.errors.push(`Analyze Resume endpoint error: ${e.message}`);
    }

    // 4. POST /api/v1/ai/match-job
    try {
      const resMatch = await fetch(`${FASTAPI_URL}/api/v1/ai/match-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-SECRET-KEY': SHARED_SECRET,
        },
        body: JSON.stringify({
          resumeText: 'Node.js Developer with 5 years experience',
          jobDescription: 'Backend Engineer proficient in Node.js and MongoDB',
        }),
      });
      const bodyMatch = await resMatch.json();
      console.log('POST /api/v1/ai/match-job Response Status:', resMatch.status);
      console.log('Match Score:', bodyMatch.matchScore, 'Recommendation:', bodyMatch.recommendation);
      report.endpointResults['POST /api/v1/ai/match-job'] =
        resMatch.status === 200 && typeof bodyMatch.matchScore === 'number' ? 'PASSED' : 'FAILED';
    } catch (e) {
      report.endpointResults['POST /api/v1/ai/match-job'] = `FAILED: ${e.message}`;
      report.errors.push(`Job Match endpoint error: ${e.message}`);
    }

    // 5. POST /api/v1/ai/extract-text (Form File Upload)
    try {
      const formData = new FormData();
      const mockPdfContent = '%PDF-1.4\n1 0 obj\n<< /Title (Test Resume) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF';
      const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
      formData.append('file', blob, 'sample_resume.pdf');

      const resExtract = await fetch(`${FASTAPI_URL}/api/v1/ai/extract-text`, {
        method: 'POST',
        headers: {
          'X-AI-SECRET-KEY': SHARED_SECRET,
        },
        body: formData,
      });
      const bodyExtract = await resExtract.json();
      console.log('POST /api/v1/ai/extract-text Response Status:', resExtract.status);
      report.endpointResults['POST /api/v1/ai/extract-text'] =
        resExtract.status === 200 && bodyExtract.text !== undefined ? 'PASSED' : 'FAILED';
    } catch (e) {
      report.endpointResults['POST /api/v1/ai/extract-text'] = `FAILED: ${e.message}`;
      report.errors.push(`Extract Text endpoint error: ${e.message}`);
    }

    // -----------------------------------------------------
    // PART 3 & 4: Test Node.js ai.service.js Communication & Fallback
    // -----------------------------------------------------
    console.log('\n[2] Testing Node.js Integration Layer (ai.service.js) ...');

    const atsRes = await analyzeATSWithAI('Experienced Senior Node.js Engineer with React & AWS experience');
    console.log('Node ai.service.js analyzeATSWithAI Score:', atsRes.overallAtsScore);

    const matchRes = await matchJobWithAI(
      'Senior Backend Engineer Node.js MongoDB',
      'Senior Node.js Developer wanted with MongoDB'
    );
    console.log('Node ai.service.js matchJobWithAI Score:', matchRes.matchScore);

    if (typeof atsRes.overallAtsScore === 'number' && typeof matchRes.matchScore === 'number') {
      report.integrationStatus = 'PASSED';
      report.geminiStatus = process.env.GEMINI_API_KEY ? 'ACTIVE (GEMINI)' : 'ACTIVE (FALLBACK ENGINE)';
    } else {
      report.integrationStatus = 'FAILED';
    }

    // -----------------------------------------------------
    // PART 5: Run Express Backend Integration Tests
    // -----------------------------------------------------
    console.log('\n[3] Running Express REST API Integration Tests against Live FastAPI Service ...');

    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/skillbridge_test';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    await Promise.all([
      Candidate.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      ResumeAnalysis.deleteMany({}),
    ]);

    const PORT = 5088;
    const httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://127.0.0.1:${PORT}`;

    const candidate = await Candidate.create({
      fullName: 'Verification Candidate',
      email: `verify_${Date.now()}@gmail.com`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    const candidateToken = generateToken({ id: candidate._id, role: 'candidate' });
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`,
    };

    const resApi = await fetch(`${BASE_URL}/api/v1/candidate/resume/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        resumeText: 'Full Stack Node.js Engineer with Express, MongoDB, Docker and AWS.',
      }),
    });
    const bodyApi = await resApi.json();

    console.log('Express API Analyze Status:', resApi.status);

    httpServer.close();
    await mongoose.disconnect();

    if (resApi.status === 200 && bodyApi.success === true) {
      report.endpointResults['Express REST API Integration'] = 'PASSED';
    } else {
      report.endpointResults['Express REST API Integration'] = 'FAILED';
    }

    console.log('\n=====================================================');
    console.log('--- VERIFICATION SUMMARY REPORT ---');
    console.log('=====================================================');
    console.log(JSON.stringify(report, null, 2));

  } catch (error) {
    console.error('Verification Error:', error);
    report.errors.push(error.message);
  }
};

runVerification();
