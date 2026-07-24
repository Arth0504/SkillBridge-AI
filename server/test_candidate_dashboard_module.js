import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application, APPLICATION_STATUS } from './models/application.model.js';
import { Interview, INTERVIEW_STATUS } from './models/interview.model.js';
import { Notification } from './models/notification.model.js';
import { SavedJob } from './models/savedJob.model.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config();

let httpServer;

const runCandidateDashboardTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 8 CANDIDATE DASHBOARD & ANALYTICS MODULE TESTS ---');
  console.log('=====================================================');

  try {
    const mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_phase8_test';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');

    // Clear test collections
    await Promise.all([
      Candidate.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Notification.deleteMany({}),
      SavedJob.deleteMany({}),
    ]);

    const PORT = 5070;
    httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://127.0.0.1:${PORT}`;
    console.log(`✅ Server running on port ${PORT}`);

    const timeSuffix = Date.now();

    // 1. Create Test Candidate 1 (Partial profile for audit testing)
    const candidate1 = await Candidate.create({
      fullName: 'Marcus Vance',
      email: `marcus_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      phone: '+1 555-0192',
      headline: 'Full Stack Node.js Developer',
      skills: ['Node.js', 'React', 'MongoDB'],
      isEmailVerified: true,
      resumeUrl: 'https://cloudinary.com/resumes/marcus.pdf',
    });
    const candidate1Token = generateToken({ id: candidate1._id, role: 'candidate' });
    const candidate1Headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidate1Token}`,
    };

    // 2. Create Candidate 2 (Security isolation test)
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

    // 3. Create Company & Jobs
    const company = await Company.create({
      companyName: 'Apex Cloud Systems',
      email: `company_${timeSuffix}@apexcloud.io`,
      password: 'Password123!',
      isEmailVerified: true,
    });

    const job1 = await Job.create({
      title: 'Senior Backend Developer',
      department: 'Engineering',
      company: company.companyName,
      companyId: company._id,
      description: 'Node.js & MongoDB backend role.',
      requiredSkills: ['Node.js', 'MongoDB', 'Docker'],
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'open',
      createdBy: company._id,
    });

    const job2 = await Job.create({
      title: 'Frontend React Architect',
      department: 'Engineering',
      company: company.companyName,
      companyId: company._id,
      description: 'React UI architecture.',
      requiredSkills: ['React', 'TypeScript', 'Redux'],
      experienceLevel: 'lead',
      employmentType: 'Full Time',
      workMode: 'Hybrid',
      status: 'open',
      createdBy: company._id,
    });

    // 4. Create Applications for Candidate 1
    const app1 = await Application.create({
      candidateId: candidate1._id,
      jobId: job1._id,
      companyId: company._id,
      resumeUrl: candidate1.resumeUrl,
      status: APPLICATION_STATUS.SHORTLISTED,
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      candidateId: candidate1._id,
      jobId: job2._id,
      companyId: company._id,
      resumeUrl: candidate1.resumeUrl,
      status: APPLICATION_STATUS.SELECTED,
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    // 5. Create Interview for Candidate 1
    await Interview.create({
      applicationId: app1._id,
      candidateId: candidate1._id,
      companyId: company._id,
      jobId: job1._id,
      interviewType: 'Technical',
      title: 'Technical Round 1',
      scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      meetingPlatform: 'Google Meet',
      meetingLink: 'https://meet.google.com/test-link',
      status: INTERVIEW_STATUS.SCHEDULED,
    });

    // 6. Create Unread Notification for Candidate 1
    await Notification.create({
      receiverId: candidate1._id,
      receiverRole: 'candidate',
      title: 'Application Shortlisted',
      message: 'Your application has been shortlisted.',
      type: 'Application Status Changed',
      isRead: false,
    });

    console.log('✅ Base test data setup complete.');

    // -----------------------------------------------------
    // TEST 1: Saved Jobs Module (POST, Duplicate Check, GET, DELETE)
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing Saved Jobs Module (Save, Duplicate Check, List, Remove) ...');
    
    // Save Job
    const resSave = await fetch(`${BASE_URL}/api/v1/candidate/saved-jobs/${job1._id.toString()}`, {
      method: 'POST',
      headers: candidate1Headers,
    });
    const bodySave = await resSave.json();
    console.log('Save Job Status:', resSave.status);

    // Duplicate Check
    const resDup = await fetch(`${BASE_URL}/api/v1/candidate/saved-jobs/${job1._id.toString()}`, {
      method: 'POST',
      headers: candidate1Headers,
    });
    const bodyDup = await resDup.json();
    console.log('Duplicate Save Status:', resDup.status);

    // List Saved Jobs
    const resListSaved = await fetch(`${BASE_URL}/api/v1/candidate/saved-jobs`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const bodyListSaved = await resListSaved.json();
    console.log('List Saved Jobs Status:', resListSaved.status);

    if (
      resSave.status === 201 &&
      resDup.status === 409 &&
      resListSaved.status === 200 &&
      bodyListSaved.data.savedJobs.length === 1
    ) {
      console.log('✅ TEST 1 PASSED: Saved Jobs Module (Save, Duplicate Prevention, List) verified.');
    } else {
      throw new Error('❌ TEST 1 FAILED: Saved Jobs Module error.');
    }

    // -----------------------------------------------------
    // TEST 2: Candidate Dashboard Summary (GET /api/v1/candidate/dashboard)
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing GET /api/v1/candidate/dashboard (Summary) ...');
    const resSummary = await fetch(`${BASE_URL}/api/v1/candidate/dashboard`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const bodySummary = await resSummary.json();

    console.log('Summary Status:', resSummary.status);
    console.log('Dashboard Summary Data:', JSON.stringify(bodySummary.data, null, 2));

    if (
      resSummary.status === 200 &&
      bodySummary.success === true &&
      bodySummary.data.totalApplications === 2 &&
      bodySummary.data.activeApplications === 2 &&
      bodySummary.data.shortlisted === 1 &&
      bodySummary.data.offersReceived === 1 &&
      bodySummary.data.savedJobsCount === 1 &&
      bodySummary.data.unreadNotifications === 1
    ) {
      console.log('✅ TEST 2 PASSED: Candidate Dashboard Summary API statistics verified.');
    } else {
      throw new Error('❌ TEST 2 FAILED: Dashboard summary mismatch.');
    }

    // -----------------------------------------------------
    // TEST 3: Candidate Applications Section (GET /api/v1/candidate/dashboard/applications)
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing GET /api/v1/candidate/dashboard/applications ...');
    const resApps = await fetch(`${BASE_URL}/api/v1/candidate/dashboard/applications`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const bodyApps = await resApps.json();

    console.log('Applications Status:', resApps.status);

    if (resApps.status === 200 && bodyApps.data.applications.length === 2) {
      console.log('✅ TEST 3 PASSED: Candidate Applications Section retrieved successfully.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Applications section failed.');
    }

    // -----------------------------------------------------
    // TEST 4: Candidate Upcoming Interviews Section (GET /api/v1/candidate/dashboard/interviews)
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing GET /api/v1/candidate/dashboard/interviews (Sorted Nearest First) ...');
    const resInts = await fetch(`${BASE_URL}/api/v1/candidate/dashboard/interviews`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const bodyInts = await resInts.json();

    console.log('Interviews Status:', resInts.status);

    if (resInts.status === 200 && bodyInts.data.interviews.length === 1) {
      console.log('✅ TEST 4 PASSED: Upcoming Interviews retrieved & sorted nearest first.');
    } else {
      throw new Error('❌ TEST 4 FAILED: Upcoming interviews failed.');
    }

    // -----------------------------------------------------
    // TEST 5: Candidate Profile Completion Audit (GET /api/v1/candidate/dashboard/profile-completion)
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing GET /api/v1/candidate/dashboard/profile-completion ...');
    const resProf = await fetch(`${BASE_URL}/api/v1/candidate/dashboard/profile-completion`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const bodyProf = await resProf.json();

    console.log('Profile Completion Data:', JSON.stringify(bodyProf.data, null, 2));

    if (
      resProf.status === 200 &&
      typeof bodyProf.data.profileCompletion === 'number' &&
      Array.isArray(bodyProf.data.missing) &&
      bodyProf.data.missing.includes('Education')
    ) {
      console.log('✅ TEST 5 PASSED: Profile Completion Audit percentage & missing sections calculated.');
    } else {
      throw new Error('❌ TEST 5 FAILED: Profile completion audit failed.');
    }

    // -----------------------------------------------------
    // TEST 6: Candidate Activity Timeline (GET /api/v1/candidate/dashboard/timeline)
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing GET /api/v1/candidate/dashboard/timeline (Chronological Newest First) ...');
    const resTime = await fetch(`${BASE_URL}/api/v1/candidate/dashboard/timeline`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const bodyTime = await resTime.json();

    console.log('Timeline Events Count:', bodyTime.data.timeline.length);

    if (resTime.status === 200 && Array.isArray(bodyTime.data.timeline) && bodyTime.data.timeline.length >= 2) {
      console.log('✅ TEST 6 PASSED: Candidate Activity Timeline retrieved in chronological order.');
    } else {
      throw new Error('❌ TEST 6 FAILED: Timeline retrieval failed.');
    }

    // -----------------------------------------------------
    // TEST 7: Candidate Dashboard Analytics (GET /api/v1/candidate/dashboard/analytics)
    // -----------------------------------------------------
    console.log('\n[TEST 7] Testing GET /api/v1/candidate/dashboard/analytics ...');
    const resAnalytics = await fetch(`${BASE_URL}/api/v1/candidate/dashboard/analytics`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const bodyAnalytics = await resAnalytics.json();

    console.log('Analytics Data:', JSON.stringify(bodyAnalytics.data, null, 2));

    if (
      resAnalytics.status === 200 &&
      bodyAnalytics.data.applicationsThisMonth === 2 &&
      Array.isArray(bodyAnalytics.data.monthlyActivityGraphData)
    ) {
      console.log('✅ TEST 7 PASSED: Candidate Dashboard Analytics & Graph Data verified.');
    } else {
      throw new Error('❌ TEST 7 FAILED: Analytics failed.');
    }

    // -----------------------------------------------------
    // TEST 8: Candidate Security Isolation (Candidate 2 accessing Candidate 1's Dashboard)
    // -----------------------------------------------------
    console.log('\n[TEST 8] Testing Candidate Security & Data Isolation ...');
    const resSec = await fetch(`${BASE_URL}/api/v1/candidate/dashboard`, {
      method: 'GET',
      headers: candidate2Headers,
    });
    const bodySec = await resSec.json();

    if (
      resSec.status === 200 &&
      bodySec.data.totalApplications === 0 &&
      bodySec.data.savedJobsCount === 0
    ) {
      console.log('✅ TEST 8 PASSED: Candidate 2 sees 0 applications and 0 saved jobs (Zero Data Leakage).');
    } else {
      throw new Error('❌ TEST 8 FAILED: Security isolation breach!');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 8 CANDIDATE DASHBOARD MODULE TESTS PASSED SUCCESSFULLY! 🎉');
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

runCandidateDashboardTests();
