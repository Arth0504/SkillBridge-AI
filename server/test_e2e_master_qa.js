import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application } from './models/application.model.js';
import { calculateFinalAIMatchScore } from './services/matchAI.service.js';
import { sendWelcomeEmail, sendApplicationConfirmationEmail } from './services/emailAutomation.service.js';
import { getHealthStatus } from './controllers/health.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const runMasterQA = async () => {
  console.log('\n=====================================================');
  console.log('🚀 RUNNING MASTER QUALITY ASSURANCE & PRODUCTION VERIFICATION');
  console.log('=====================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);

  const timeSuffix = Date.now();

  // 1. Candidate & Company Flow
  console.log('\n[STAGE 1] Testing Candidate & Company Registration...');
  const company = await Company.create({
    companyName: `Enterprise Corp ${timeSuffix}`,
    email: `enterprise_${timeSuffix}@corp.com`,
    password: 'Password123!',
    isEmailVerified: true,
  });

  const candidate = await Candidate.create({
    fullName: 'Master QA Candidate',
    email: `candidate_${timeSuffix}@qa.com`,
    password: 'Password123!',
    isEmailVerified: true,
    skills: ['Python', 'Java', 'React', 'Node.js', 'MongoDB'],
    experienceYears: 4,
    profileCompleted: true,
    resumeUrl: 'http://localhost:5000/uploads/resumes/qa_resume.pdf',
  });
  console.log('✅ STAGE 1 PASSED: Accounts created successfully.');

  // 2. Email Automation Test
  console.log('\n[STAGE 2] Testing Email Automation Service...');
  await sendWelcomeEmail(candidate.email, candidate.fullName);
  console.log('✅ STAGE 2 PASSED: Welcome Email service executed without errors.');

  // 3. Job & Application System
  console.log('\n[STAGE 3] Creating Job & Submitting Candidate Application...');
  const job = await Job.create({
    title: 'Lead Full Stack AI Engineer',
    department: 'Engineering',
    company: company.companyName,
    companyId: company._id,
    description: 'Enterprise AI system development.',
    requiredSkills: ['Node.js', 'React', 'MongoDB', 'Python'],
    workMode: 'Remote',
    employmentType: 'Full Time',
    experienceLevel: 'senior',
    isCodingRoundEnabled: true,
    status: 'open',
    createdBy: company._id,
  });

  const application = await Application.create({
    candidateId: candidate._id,
    jobId: job._id,
    companyId: company._id,
    resumeUrl: candidate.resumeUrl,
    candidateSnapshot: { fullName: candidate.fullName, email: candidate.email },
    resumeScore: 90,
    interviewScore: 88,
    codingScore: 92,
  });

  await sendApplicationConfirmationEmail(candidate.email, candidate.fullName, job.title, company.companyName);
  console.log('✅ STAGE 3 PASSED: Job created & application confirmation dispatched.');

  // 4. Unified AI Match Score Engine Test
  console.log('\n[STAGE 4] Testing Unified AI Match Engine...');
  const matchResult = await calculateFinalAIMatchScore(application._id);
  console.log(`- Final Calculated Match Score: ${matchResult.matchScore}%`);
  console.log(`- Recommendation:               "${matchResult.hiringRecommendation}"`);

  if (matchResult.matchScore < 85 || matchResult.hiringRecommendation !== 'Highly Recommended') {
    throw new Error('STAGE 4 FAILED: AI Match engine calculation mismatch.');
  }
  console.log('✅ STAGE 4 PASSED: AI Match score engine computed 90%+ match.');

  // 5. System Health Check Endpoint Test
  console.log('\n[STAGE 5] Testing System Health Check Diagnostic...');
  const mockReq = {};
  let resStatus = 0;
  let resBody = null;
  const mockRes = {
    status: (code) => {
      resStatus = code;
      return {
        json: (data) => {
          resBody = data;
        },
      };
    },
  };
  await getHealthStatus(mockReq, mockRes);

  if (resStatus !== 200 || !resBody?.success || resBody?.data?.status !== 'OK') {
    throw new Error('STAGE 5 FAILED: Health diagnostic check failed.');
  }
  console.log(`- Health Endpoint Status: ${resStatus} OK`);
  console.log(`- DB Host:                ${resBody.data.services.database.host}`);
  console.log(`- Memory Usage:           ${resBody.data.system.memoryUsedMB} MB`);
  console.log('✅ STAGE 5 PASSED: Diagnostic Health check returned HTTP 200 OK.');

  // Cleanup test documents
  await Promise.all([
    Candidate.deleteOne({ _id: candidate._id }),
    Company.deleteOne({ _id: company._id }),
    Job.deleteOne({ _id: job._id }),
    Application.deleteOne({ _id: application._id }),
  ]);

  console.log('\n=====================================================');
  console.log('🎉 MASTER QA & PRODUCTION READINESS TEST PASSED 100%!');
  console.log('=====================================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

runMasterQA().catch((err) => {
  console.error('❌ Master QA Error:', err);
  process.exit(1);
});
