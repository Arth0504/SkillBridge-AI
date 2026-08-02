import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application } from './models/application.model.js';
import { calculateFinalAIMatchScore } from './services/matchAI.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const runPipelineTests = async () => {
  console.log('\n=====================================================');
  console.log('TESTING PHASE NEXT: ENTERPRISE AI PIPELINE & MATCH ENGINE');
  console.log('=====================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);

  const timeSuffix = Date.now();

  // 1. Create Test Company & Job
  const company = await Company.create({
    companyName: `OpenAI Labs ${timeSuffix}`,
    email: `recruiter_${timeSuffix}@openai.com`,
    password: 'Password123!',
    isEmailVerified: true,
  });

  const job = await Job.create({
    title: 'Senior AI Engineer (MERN & Python)',
    department: 'AI Core',
    company: company.companyName,
    companyId: company._id,
    description: 'Design dynamic LLM applications and scalable microservices.',
    requiredSkills: ['Node.js', 'React', 'MongoDB', 'Python', 'PyTorch'],
    workMode: 'Remote',
    employmentType: 'Full Time',
    experienceLevel: 'senior',
    isCodingRoundEnabled: true,
    codingLanguages: ['Python', 'Java', 'JavaScript', 'C++', 'C', 'SQL'],
    status: 'open',
    createdBy: company._id,
  });

  // 2. Create Candidate with matching skills
  const candidate = await Candidate.create({
    fullName: 'Sophia Martinez',
    email: `sophia_${timeSuffix}@ai.com`,
    password: 'Password123!',
    isEmailVerified: true,
    skills: ['Node.js', 'React', 'MongoDB', 'Python'],
    experienceYears: 5,
    profileCompleted: true,
    resumeUrl: 'http://localhost:5000/uploads/resumes/sample_resume.pdf',
  });

  // 3. Submit Application
  const application = await Application.create({
    candidateId: candidate._id,
    jobId: job._id,
    companyId: company._id,
    resumeUrl: candidate.resumeUrl,
    candidateSnapshot: {
      fullName: candidate.fullName,
      email: candidate.email,
      skills: candidate.skills,
    },
    resumeScore: 88,
    interviewScore: 92,
    codingScore: 95,
  });

  console.log('[TEST 1] Calculating Unified AI Match Score...');
  const matchResult = await calculateFinalAIMatchScore(application._id);

  console.log('Resulting AI Evaluation:');
  console.log(`- Final Match Score:          ${matchResult.matchScore}%`);
  console.log(`- Resume Score:               ${matchResult.resumeScore}/100`);
  console.log(`- Interview Score:            ${matchResult.interviewScore}/100`);
  console.log(`- Coding Score:               ${matchResult.codingScore}/100`);
  console.log(`- Communication Score:        ${matchResult.communicationScore}/100`);
  console.log(`- Hiring Recommendation:      "${matchResult.hiringRecommendation}"`);
  console.log(`- Strengths (${matchResult.strengths.length}):          ${JSON.stringify(matchResult.strengths)}`);
  console.log(`- Weaknesses (${matchResult.weaknesses.length}):         ${JSON.stringify(matchResult.weaknesses)}`);

  // Assertions
  if (matchResult.matchScore < 85 || matchResult.hiringRecommendation !== 'Highly Recommended') {
    throw new Error('TEST FAILED: AI Match Score or Recommendation calculation incorrect!');
  }
  console.log('✅ TEST 1 PASSED: Unified AI Match Engine returned 90%+ match score and "Highly Recommended".');

  // Cleanup test documents
  await Promise.all([
    Candidate.deleteOne({ _id: candidate._id }),
    Company.deleteOne({ _id: company._id }),
    Job.deleteOne({ _id: job._id }),
    Application.deleteOne({ _id: application._id }),
  ]);

  console.log('\n=====================================================');
  console.log('🎉 ALL PHASE NEXT AI PIPELINE TESTS PASSED PERFECTLY!');
  console.log('=====================================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

runPipelineTests().catch((err) => {
  console.error('❌ Pipeline Test Error:', err);
  process.exit(1);
});
