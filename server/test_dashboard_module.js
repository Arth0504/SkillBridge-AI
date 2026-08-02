import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application, APPLICATION_STATUS } from './models/application.model.js';
import { Interview, INTERVIEW_STATUS } from './models/interview.model.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config();

let server;

const runDashboardTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 5 COMPANY DASHBOARD & ANALYTICS MODULE TESTS ---');
  console.log('=====================================================');

  try {
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/skillbridge_test';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');

    // Clear test DB collections
    await Promise.all([
      Candidate.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
    ]);

    const PORT = 5057;
    server = app.listen(PORT);
    const BASE_URL = `http://localhost:${PORT}`;

    const timeSuffix = Date.now();

    // 1. Create Main Test Company
    const testCompany = await Company.create({
      companyName: 'TechCorp Solutions',
      email: `company_${timeSuffix}@techcorp.io`,
      password: 'Password123!',
      industry: 'Software Engineering',
      companySize: '51-200',
      location: 'San Francisco, CA',
      isEmailVerified: true,
    });
    const companyToken = generateToken({ id: testCompany._id, role: 'company' });
    const companyHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`,
    };

    // 2. Create Secondary Company for multi-tenant isolation testing
    const otherCompany = await Company.create({
      companyName: 'OtherCorp Inc',
      email: `other_${timeSuffix}@othercorp.io`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    const otherCompanyToken = generateToken({ id: otherCompany._id, role: 'company' });

    // 3. Create Candidate & Candidate Token
    const testCandidate = await Candidate.create({
      fullName: 'David Miller',
      email: `candidate_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    const candidateToken = generateToken({ id: testCandidate._id, role: 'candidate' });

    // 4. Create Jobs for Main Company across statuses, departments & skills
    const jobOpen1 = await Job.create({
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      company: testCompany.companyName,
      companyId: testCompany._id,
      description: 'Node.js & MongoDB backend role.',
      requiredSkills: ['Node.js', 'MongoDB', 'Redis', 'Docker'],
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'open',
      views: 120,
      totalApplications: 3,
      createdBy: testCompany._id,
    });

    const jobOpen2 = await Job.create({
      title: 'Lead Frontend Developer',
      department: 'Engineering',
      company: testCompany.companyName,
      companyId: testCompany._id,
      description: 'React & TypeScript lead role.',
      requiredSkills: ['React', 'TypeScript', 'TailwindCSS'],
      experienceLevel: 'lead',
      employmentType: 'Full Time',
      workMode: 'Hybrid',
      status: 'open',
      views: 85,
      totalApplications: 2,
      createdBy: testCompany._id,
    });

    const jobClosed = await Job.create({
      title: 'UI/UX Product Designer',
      department: 'Design',
      company: testCompany.companyName,
      companyId: testCompany._id,
      description: 'Figma & Design Systems.',
      requiredSkills: ['Figma', 'UI/UX', 'Prototyping'],
      experienceLevel: 'mid',
      employmentType: 'Full Time',
      workMode: 'On Site',
      status: 'closed',
      views: 45,
      totalApplications: 1,
      createdBy: testCompany._id,
    });

    const jobPaused = await Job.create({
      title: 'DevOps Specialist',
      department: 'Infrastructure',
      company: testCompany.companyName,
      companyId: testCompany._id,
      description: 'AWS & Kubernetes pipeline manager.',
      requiredSkills: ['AWS', 'Kubernetes', 'Docker'],
      experienceLevel: 'senior',
      employmentType: 'Contract',
      workMode: 'Remote',
      status: 'paused',
      views: 30,
      totalApplications: 0,
      createdBy: testCompany._id,
    });

    const jobDraft = await Job.create({
      title: 'AI Researcher',
      department: 'AI & Data',
      company: testCompany.companyName,
      companyId: testCompany._id,
      description: 'LLM & PyTorch scientist.',
      requiredSkills: ['Python', 'PyTorch', 'LLMs'],
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'draft',
      views: 0,
      totalApplications: 0,
      createdBy: testCompany._id,
    });

    // 5. Create Applications for Main Company Jobs with diverse valid schema statuses
    await Application.create({
      candidateId: testCandidate._id,
      jobId: jobOpen1._id,
      companyId: testCompany._id,
      resumeUrl: '',
      status: APPLICATION_STATUS.APPLIED,
      candidateSnapshot: { fullName: 'David Miller', email: 'david@gmail.com' },
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    });

    await Application.create({
      candidateId: new mongoose.Types.ObjectId(),
      jobId: jobOpen1._id,
      companyId: testCompany._id,
      resumeUrl: '',
      status: APPLICATION_STATUS.SHORTLISTED,
      candidateSnapshot: { fullName: 'Sarah Connor', email: 'sarah@gmail.com' },
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });

    const scheduledApp = await Application.create({
      candidateId: new mongoose.Types.ObjectId(),
      jobId: jobOpen1._id,
      companyId: testCompany._id,
      resumeUrl: '',
      status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
      interviewScheduled: true,
      interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
      candidateSnapshot: { fullName: 'John Doe', email: 'john@gmail.com' },
      appliedAt: new Date(),
    });

    await Interview.create({
      applicationId: scheduledApp._id,
      candidateId: scheduledApp.candidateId,
      companyId: testCompany._id,
      jobId: jobOpen1._id,
      interviewType: 'Technical',
      round: 1,
      title: 'Technical Coding Round 1',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      status: INTERVIEW_STATUS.SCHEDULED,
    });

    await Application.create({
      candidateId: new mongoose.Types.ObjectId(),
      jobId: jobOpen2._id,
      companyId: testCompany._id,
      resumeUrl: '',
      status: APPLICATION_STATUS.SELECTED,
      candidateSnapshot: { fullName: 'Alice Smith', email: 'alice@gmail.com' },
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      candidateId: new mongoose.Types.ObjectId(),
      jobId: jobOpen2._id,
      companyId: testCompany._id,
      resumeUrl: '',
      status: APPLICATION_STATUS.REJECTED,
      candidateSnapshot: { fullName: 'Bob Jones', email: 'bob@gmail.com' },
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      candidateId: new mongoose.Types.ObjectId(),
      jobId: jobClosed._id,
      companyId: testCompany._id,
      resumeUrl: '',
      status: APPLICATION_STATUS.SELECTED,
      notes: 'Offer Accepted by candidate',
      candidateSnapshot: { fullName: 'Charlie Brown', email: 'charlie@gmail.com' },
      appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    });

    console.log('✅ Test Data initialized successfully.');

    // -----------------------------------------------------
    // TEST 1: GET /api/v1/company/dashboard (Summary Statistics)
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing GET /api/v1/company/dashboard ...');
    const res1 = await fetch(`${BASE_URL}/api/v1/company/dashboard`, {
      method: 'GET',
      headers: companyHeaders,
    });
    const body1 = await res1.json();

    console.log('Response Status:', res1.status);
    console.log('Body Summary:', JSON.stringify(body1.data, null, 2));

    if (
      res1.status === 200 &&
      body1.success === true &&
      body1.data.jobs.totalJobs === 5 &&
      body1.data.jobs.openJobs === 2 &&
      body1.data.jobs.closedJobs === 1 &&
      body1.data.applications.totalApplications === 6 &&
      body1.data.interviews.upcomingInterviews === 1
    ) {
      console.log('✅ TEST 1 PASSED: Dashboard summary returns accurate statistics.');
    } else {
      throw new Error('❌ TEST 1 FAILED: Incorrect summary statistics.');
    }

    // -----------------------------------------------------
    // TEST 2: GET /api/v1/company/dashboard/analytics
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing GET /api/v1/company/dashboard/analytics ...');
    const res2 = await fetch(`${BASE_URL}/api/v1/company/dashboard/analytics`, {
      method: 'GET',
      headers: companyHeaders,
    });
    const body2 = await res2.json();

    console.log('Response Status:', res2.status);
    console.log('Body Analytics:', JSON.stringify(body2.data, null, 2));

    if (
      res2.status === 200 &&
      body2.success === true &&
      Array.isArray(body2.data.monthlyApplications) &&
      Array.isArray(body2.data.applicationsPerJob) &&
      body2.data.hiringRatio.totalApplications === 6 &&
      Array.isArray(body2.data.topSkillsRequested)
    ) {
      console.log('✅ TEST 2 PASSED: Analytics trends & reports retrieved successfully.');
    } else {
      throw new Error('❌ TEST 2 FAILED: Incorrect analytics response.');
    }

    // -----------------------------------------------------
    // TEST 3: GET /api/v1/company/dashboard/recent-applications
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing GET /api/v1/company/dashboard/recent-applications ...');
    const res3 = await fetch(`${BASE_URL}/api/v1/company/dashboard/recent-applications?page=1&limit=5`, {
      method: 'GET',
      headers: companyHeaders,
    });
    const body3 = await res3.json();

    console.log('Response Status:', res3.status);
    console.log('Recent Applications Data:', JSON.stringify(body3.data, null, 2));

    if (
      res3.status === 200 &&
      body3.success === true &&
      body3.data.latestApplications.length <= 5 &&
      Array.isArray(body3.data.recentlyPostedJobs) &&
      body3.data.pagination.totalItems === 6
    ) {
      console.log('✅ TEST 3 PASSED: Recent applications & activities retrieved successfully.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Incorrect recent applications response.');
    }

    // -----------------------------------------------------
    // TEST 4: GET /api/v1/company/dashboard/job-performance
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing GET /api/v1/company/dashboard/job-performance ...');
    const res4 = await fetch(`${BASE_URL}/api/v1/company/dashboard/job-performance`, {
      method: 'GET',
      headers: companyHeaders,
    });
    const body4 = await res4.json();

    console.log('Response Status:', res4.status);
    console.log('Job Performance Data:', JSON.stringify(body4.data, null, 2));

    if (
      res4.status === 200 &&
      body4.success === true &&
      body4.data.overview.totalJobs === 5 &&
      body4.data.overview.mostPopularJob.title === 'Senior Backend Engineer' &&
      Array.isArray(body4.data.jobs)
    ) {
      console.log('✅ TEST 4 PASSED: Job performance metrics retrieved successfully.');
    } else {
      throw new Error('❌ TEST 4 FAILED: Incorrect job performance metrics.');
    }

    // -----------------------------------------------------
    // TEST 5: GET /api/v1/company/dashboard/interviews
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing GET /api/v1/company/dashboard/interviews ...');
    const res5 = await fetch(`${BASE_URL}/api/v1/company/dashboard/interviews?interviewStatus=upcoming`, {
      method: 'GET',
      headers: companyHeaders,
    });
    const body5 = await res5.json();

    console.log('Response Status:', res5.status);
    console.log('Interviews Data:', JSON.stringify(body5.data, null, 2));

    if (
      res5.status === 200 &&
      body5.success === true &&
      body5.data.overview.upcoming === 1 &&
      body5.data.interviews.length === 1
    ) {
      console.log('✅ TEST 5 PASSED: Interview overview and list retrieved successfully.');
    } else {
      throw new Error('❌ TEST 5 FAILED: Incorrect interview overview.');
    }

    // -----------------------------------------------------
    // TEST 6: Security & Role Authorization Check
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing Security: Candidate accessing Company Dashboard ...');
    const res6 = await fetch(`${BASE_URL}/api/v1/company/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    const body6 = await res6.json();

    console.log('Response Status:', res6.status);

    if (res6.status === 403 && body6.success === false) {
      console.log('✅ TEST 6 PASSED: Non-company candidate is correctly forbidden (403).');
    } else {
      throw new Error('❌ TEST 6 FAILED: Candidate was not blocked from Company dashboard.');
    }

    // -----------------------------------------------------
    // TEST 7: Multi-Tenant Data Isolation Check
    // -----------------------------------------------------
    console.log('\n[TEST 7] Testing Multi-Tenant Data Isolation ...');
    const res7 = await fetch(`${BASE_URL}/api/v1/company/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherCompanyToken}`,
      },
    });
    const body7 = await res7.json();

    console.log('Response Status:', res7.status);

    if (
      res7.status === 200 &&
      body7.success === true &&
      body7.data.jobs.totalJobs === 0 &&
      body7.data.applications.totalApplications === 0
    ) {
      console.log('✅ TEST 7 PASSED: Other company sees 0 jobs & 0 applications (Strict Tenant Isolation).');
    } else {
      throw new Error('❌ TEST 7 FAILED: Tenant data leaked to another company!');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 5 DASHBOARD MODULE TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=====================================================');
  } catch (error) {
    console.error('\n❌ TEST RUNNER ERROR:', error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    console.log('Closed server and MongoDB connections.');
  }
};

runDashboardTests();
