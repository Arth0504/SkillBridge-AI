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
import { generateToken } from './utils/generateToken.js';

dotenv.config();

let httpServer;

const runInterviewTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 7 INTERVIEW MANAGEMENT MODULE TESTS ---');
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
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const PORT = 5059;
    httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://localhost:${PORT}`;
    console.log(`✅ Server running on port ${PORT}`);

    const timeSuffix = Date.now();

    // 1. Create Company
    const company = await Company.create({
      companyName: 'Nova Software',
      email: `company_${timeSuffix}@nova.io`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    const companyToken = generateToken({ id: company._id, role: 'company' });
    const companyHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`,
    };

    // 2. Create Secondary Company for multi-tenant isolation testing
    const otherCompany = await Company.create({
      companyName: 'Other Tech',
      email: `other_${timeSuffix}@other.io`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    const otherCompanyToken = generateToken({ id: otherCompany._id, role: 'company' });

    // 3. Create Candidate 1 & Candidate 2
    const candidate1 = await Candidate.create({
      fullName: 'Lucas Scott',
      email: `lucas_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      isEmailVerified: true,
      profileCompleted: true,
      resumeUrl: '',
    });
    const candidate1Token = generateToken({ id: candidate1._id, role: 'candidate' });
    const candidate1Headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidate1Token}`,
    };

    const candidate2 = await Candidate.create({
      fullName: 'Sophia Green',
      email: `sophia_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    const candidate2Token = generateToken({ id: candidate2._id, role: 'candidate' });

    // 4. Create Job
    const job = await Job.create({
      title: 'Senior Software Engineer',
      department: 'Engineering',
      company: company.companyName,
      companyId: company._id,
      description: 'Full stack development position.',
      requiredSkills: ['Node.js', 'React'],
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'open',
      createdBy: company._id,
    });

    // 5. Create Active Application (Eligible for interview)
    const activeApp = await Application.create({
      candidateId: candidate1._id,
      jobId: job._id,
      companyId: company._id,
      resumeUrl: candidate1.resumeUrl,
      status: APPLICATION_STATUS.APPLIED,
      candidateSnapshot: { fullName: candidate1.fullName, email: candidate1.email },
    });

    // 6. Create Rejected Application (Ineligible for interview)
    const rejectedApp = await Application.create({
      candidateId: candidate2._id,
      jobId: job._id,
      companyId: company._id,
      resumeUrl: '',
      status: APPLICATION_STATUS.REJECTED,
      candidateSnapshot: { fullName: candidate2.fullName, email: candidate2.email },
    });

    console.log('✅ Base test entities setup complete.');

    // -----------------------------------------------------
    // TEST 1: Schedule Interview for Active Application (POST /api/v1/company/interviews)
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing POST /api/v1/company/interviews (Schedule Interview) ...');
    const schedulePayload = {
      applicationId: activeApp._id.toString(),
      interviewType: 'Technical',
      round: 1,
      title: 'Technical Coding Round 1',
      description: 'Data Structures and Node.js backend concepts.',
      scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      meetingPlatform: 'SkillBridge AI Private Room',
      meetingLink: '/interview/room/4c6e2a5b-bbc5-45ef-bb76-87cdd8f6c812',
      interviewerName: 'Alex River',
      interviewerEmail: 'alex.river@nova.io',
    };

    const res1 = await fetch(`${BASE_URL}/api/v1/company/interviews`, {
      method: 'POST',
      headers: companyHeaders,
      body: JSON.stringify(schedulePayload),
    });
    const body1 = await res1.json();

    console.log('Response Status:', res1.status);
    console.log('Body:', JSON.stringify(body1, null, 2));

    if (res1.status === 201 && body1.success === true && body1.data.interview._id) {
      console.log('✅ TEST 1 PASSED: Interview scheduled successfully.');
    } else {
      throw new Error('❌ TEST 1 FAILED: Could not schedule interview.');
    }

    const createdInterviewId = body1.data.interview._id;

    // Check if notification was automatically sent to candidate1
    const notifs1 = await Notification.find({ receiverId: candidate1._id });
    if (notifs1.length > 0 && notifs1[0].type === 'Interview Scheduled') {
      console.log('✅ TEST 1 SUB-CHECK PASSED: Automatic "Interview Scheduled" notification delivered to Candidate.');
    } else {
      throw new Error('❌ TEST 1 SUB-CHECK FAILED: Automatic notification missed.');
    }

    // -----------------------------------------------------
    // TEST 2: Business Rule - Reject schedule attempt on Rejected Application
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing Business Rule: Reject scheduling for rejected applications ...');
    const invalidSchedulePayload = {
      applicationId: rejectedApp._id.toString(),
      interviewType: 'HR',
      title: 'HR Discussion',
      scheduledDate: new Date().toISOString(),
      startTime: '02:00 PM',
      endTime: '02:30 PM',
    };

    const res2 = await fetch(`${BASE_URL}/api/v1/company/interviews`, {
      method: 'POST',
      headers: companyHeaders,
      body: JSON.stringify(invalidSchedulePayload),
    });
    const body2 = await res2.json();

    console.log('Response Status:', res2.status);
    console.log('Body:', JSON.stringify(body2, null, 2));

    if (res2.status === 400 && body2.success === false) {
      console.log('✅ TEST 2 PASSED: Attempt to schedule interview for rejected application correctly blocked (400).');
    } else {
      throw new Error('❌ TEST 2 FAILED: Allowed scheduling for rejected application.');
    }

    // -----------------------------------------------------
    // TEST 3: Update / Reschedule Interview (PUT /api/v1/company/interviews/:id)
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing PUT /api/v1/company/interviews/:id (Reschedule Interview) ...');
    const updatePayload = {
      scheduledDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      meetingLink: '/interview/room/4c6e2a5b-bbc5-45ef-bb76-87cdd8f6c812',
    };

    const res3 = await fetch(`${BASE_URL}/api/v1/company/interviews/${createdInterviewId}`, {
      method: 'PUT',
      headers: companyHeaders,
      body: JSON.stringify(updatePayload),
    });
    const body3 = await res3.json();

    console.log('Response Status:', res3.status);
    console.log('Body:', JSON.stringify(body3, null, 2));

    if (res3.status === 200 && body3.data.interview.status === INTERVIEW_STATUS.RESCHEDULED) {
      console.log('✅ TEST 3 PASSED: Interview rescheduled successfully & status updated to Rescheduled.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Reschedule update failed.');
    }

    // -----------------------------------------------------
    // TEST 4: Update Interview Status to Completed (PATCH /api/v1/company/interviews/:id/status)
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing PATCH /api/v1/company/interviews/:id/status (Mark Completed) ...');
    const res4 = await fetch(`${BASE_URL}/api/v1/company/interviews/${createdInterviewId}/status`, {
      method: 'PATCH',
      headers: companyHeaders,
      body: JSON.stringify({ status: INTERVIEW_STATUS.COMPLETED }),
    });
    const body4 = await res4.json();

    console.log('Response Status:', res4.status);

    if (res4.status === 200 && body4.data.interview.status === INTERVIEW_STATUS.COMPLETED) {
      console.log('✅ TEST 4 PASSED: Interview status updated to Completed.');
    } else {
      throw new Error('❌ TEST 4 FAILED: Status update failed.');
    }

    // Check application status synced
    const updatedApp = await Application.findById(activeApp._id);
    if (updatedApp.status === APPLICATION_STATUS.INTERVIEW_COMPLETED) {
      console.log('✅ TEST 4 SUB-CHECK PASSED: Application status synced to Interview Completed.');
    } else {
      throw new Error('❌ TEST 4 SUB-CHECK FAILED: Application status did not sync.');
    }

    // -----------------------------------------------------
    // TEST 5: Submit Feedback & Rating (PATCH /api/v1/company/interviews/:id/feedback)
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing PATCH /api/v1/company/interviews/:id/feedback ...');
    const feedbackPayload = {
      feedback: 'Excellent problem solving skills and clean code structure.',
      rating: 4.8,
      result: 'Passed to Next Round',
      notes: 'Proceed to Managerial Round.',
    };

    const res5 = await fetch(`${BASE_URL}/api/v1/company/interviews/${createdInterviewId}/feedback`, {
      method: 'PATCH',
      headers: companyHeaders,
      body: JSON.stringify(feedbackPayload),
    });
    const body5 = await res5.json();

    console.log('Response Status:', res5.status);

    if (
      res5.status === 200 &&
      body5.data.interview.rating === 4.8 &&
      body5.data.interview.result === 'Passed to Next Round'
    ) {
      console.log('✅ TEST 5 PASSED: Interview feedback, rating, and result recorded.');
    } else {
      throw new Error('❌ TEST 5 FAILED: Feedback submission failed.');
    }

    // -----------------------------------------------------
    // TEST 6: GET /api/v1/company/interviews (Company List)
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing GET /api/v1/company/interviews ...');
    const res6 = await fetch(`${BASE_URL}/api/v1/company/interviews`, {
      method: 'GET',
      headers: companyHeaders,
    });
    const body6 = await res6.json();

    console.log('Response Status:', res6.status);

    if (res6.status === 200 && body6.data.interviews.length === 1) {
      console.log('✅ TEST 6 PASSED: Company interviews list retrieved.');
    } else {
      throw new Error('❌ TEST 6 FAILED: Company interview listing failed.');
    }

    // -----------------------------------------------------
    // TEST 7: Candidate Read-Only APIs (GET /api/v1/candidate/interviews & :id)
    // -----------------------------------------------------
    console.log('\n[TEST 7] Testing GET /api/v1/candidate/interviews & GET /api/v1/candidate/interviews/:id ...');
    const res7a = await fetch(`${BASE_URL}/api/v1/candidate/interviews`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const body7a = await res7a.json();

    const res7b = await fetch(`${BASE_URL}/api/v1/candidate/interviews/${createdInterviewId}`, {
      method: 'GET',
      headers: candidate1Headers,
    });
    const body7b = await res7b.json();

    console.log('Response Status List:', res7a.status, 'Detail:', res7b.status);

    if (
      res7a.status === 200 &&
      body7a.data.interviews.length === 1 &&
      res7b.status === 200 &&
      body7b.data.interview._id === createdInterviewId
    ) {
      console.log('✅ TEST 7 PASSED: Candidate read-only access to interviews functioning perfectly.');
    } else {
      throw new Error('❌ TEST 7 FAILED: Candidate read-only API failed.');
    }

    // -----------------------------------------------------
    // TEST 8: Security & Multi-Tenant Isolation
    // -----------------------------------------------------
    console.log('\n[TEST 8] Testing Security & Multi-Tenant Isolation ...');
    // Candidate attempting to POST company interview
    const res8a = await fetch(`${BASE_URL}/api/v1/company/interviews`, {
      method: 'POST',
      headers: candidate1Headers,
      body: JSON.stringify(schedulePayload),
    });

    // Other company attempting to view Company 1's interview details
    const res8b = await fetch(`${BASE_URL}/api/v1/company/interviews/${createdInterviewId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherCompanyToken}`,
      },
    });

    // Candidate 2 attempting to view Candidate 1's interview details
    const res8c = await fetch(`${BASE_URL}/api/v1/candidate/interviews/${createdInterviewId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidate2Token}`,
      },
    });

    console.log('Security Statuses -> Candidate POST:', res8a.status, 'Other Company GET:', res8b.status, 'Other Candidate GET:', res8c.status);

    if (res8a.status === 403 && res8b.status === 404 && res8c.status === 404) {
      console.log('✅ TEST 8 PASSED: All role security and multi-tenant access checks enforced cleanly.');
    } else {
      throw new Error('❌ TEST 8 FAILED: Multi-tenant or role security breach detected.');
    }

    // -----------------------------------------------------
    // TEST 9: Status transition to Live & Soft Delete (DELETE /api/v1/company/interviews/:id)
    // -----------------------------------------------------
    console.log('\n[TEST 9] Testing Status update to Live & DELETE /api/v1/company/interviews/:id ...');
    const res9a = await fetch(`${BASE_URL}/api/v1/company/interviews/${createdInterviewId}/status`, {
      method: 'PATCH',
      headers: companyHeaders,
      body: JSON.stringify({ status: 'Live' }),
    });

    const res9b = await fetch(`${BASE_URL}/api/v1/company/interviews/${createdInterviewId}`, {
      method: 'DELETE',
      headers: companyHeaders,
    });
    const body9b = await res9b.json();

    console.log('Live Status Response:', res9a.status, 'Delete Response:', res9b.status);

    if (res9a.status === 200 && res9b.status === 200 && body9b.success) {
      console.log('✅ TEST 9 PASSED: Live status update & interview soft delete executed cleanly.');
    } else {
      throw new Error('❌ TEST 9 FAILED: Live status or soft delete endpoint failed.');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 7 INTERVIEW MANAGEMENT MODULE TESTS PASSED SUCCESSFULLY! 🎉');
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

runInterviewTests();
