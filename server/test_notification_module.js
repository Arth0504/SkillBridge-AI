import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import { io as ClientIO } from 'socket.io-client';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application, APPLICATION_STATUS } from './models/application.model.js';
import { Notification } from './models/notification.model.js';
import { initSocketServer } from './sockets/notification.socket.js';
import { generateToken } from './utils/generateToken.js';
import { submitApplication, updateApplicationStatus } from './services/application.service.js';
import { updateJobStatus } from './controllers/jobCompany.controller.js';

dotenv.config();

let httpServer;

const runNotificationTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 6 REAL-TIME NOTIFICATION MODULE TESTS ---');
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
      Notification.deleteMany({}),
    ]);

    const PORT = 5058;
    httpServer = http.createServer(app);
    initSocketServer(httpServer);

    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://localhost:${PORT}`;
    console.log(`✅ Express & Socket.IO server running on port ${PORT}`);

    const timeSuffix = Date.now();

    // 1. Create Test Candidate
    const candidate = await Candidate.create({
      fullName: 'Emily Watson',
      email: `emily_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      isEmailVerified: true,
      profileCompleted: true,
      resumeUrl: 'https://cloudinary.com/resumes/emily_watson.pdf',
    });
    const candidateToken = generateToken({ id: candidate._id, role: 'candidate' });
    const candidateHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`,
    };

    // 2. Create Test Company
    const company = await Company.create({
      companyName: 'Starlight Tech',
      email: `company_${timeSuffix}@starlight.io`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    const companyToken = generateToken({ id: company._id, role: 'company' });
    const companyHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`,
    };

    // 3. Create Secondary Candidate (Security check)
    const otherCandidate = await Candidate.create({
      fullName: 'Other Candidate',
      email: `other_${timeSuffix}@gmail.com`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    const otherCandidateToken = generateToken({ id: otherCandidate._id, role: 'candidate' });

    // 4. Create Job
    const job = await Job.create({
      title: 'Full Stack Engineer',
      department: 'Engineering',
      company: company.companyName,
      companyId: company._id,
      description: 'Building modern web apps.',
      requiredSkills: ['Node.js', 'React'],
      experienceLevel: 'mid',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'open',
      createdBy: company._id,
    });

    console.log('✅ Base test entities created successfully.');

    // -----------------------------------------------------
    // SOCKET.IO REAL-TIME CONNECTION TESTS
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing Real-time Socket.IO Connection & Authentication ...');
    
    const candidateSocket = ClientIO(BASE_URL, {
      auth: { token: candidateToken },
      transports: ['websocket'],
    });

    const companySocket = ClientIO(BASE_URL, {
      auth: { token: companyToken },
      transports: ['websocket'],
    });

    await new Promise((resolve, reject) => {
      let connectedCount = 0;
      const checkDone = () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      };

      candidateSocket.on('connect', () => {
        console.log(`Candidate Socket Connected (ID: ${candidateSocket.id})`);
        checkDone();
      });

      companySocket.on('connect', () => {
        console.log(`Company Socket Connected (ID: ${companySocket.id})`);
        checkDone();
      });

      candidateSocket.on('connect_error', (err) => reject(err));
      companySocket.on('connect_error', (err) => reject(err));
    });

    console.log('✅ TEST 1 PASSED: Candidate & Company Socket.IO clients authenticated & connected.');

    // Prepare arrays to capture real-time socket events
    const companyReceivedNotifications = [];
    const candidateReceivedNotifications = [];

    companySocket.on('notification:new', (data) => {
      console.log('🔔 [REAL-TIME EVENT] Company received notification:new ->', data.notification.title);
      companyReceivedNotifications.push(data);
    });

    candidateSocket.on('notification:new', (data) => {
      console.log('🔔 [REAL-TIME EVENT] Candidate received notification:new ->', data.notification.title);
      candidateReceivedNotifications.push(data);
    });

    // -----------------------------------------------------
    // TEST 2: Automatic Notification on Candidate Applying
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing Automatic Notification on Candidate Job Application ...');
    const application = await submitApplication({
      candidateId: candidate._id,
      jobId: job._id,
      coverLetter: 'Interested in this full stack role.',
    });

    // Wait 500ms for Socket event emission
    await new Promise((res) => setTimeout(res, 500));

    if (companyReceivedNotifications.length >= 1) {
      const notif = companyReceivedNotifications[0].notification;
      if (notif.type === 'Job Applied' && notif.receiverRole === 'company') {
        console.log('✅ TEST 2 PASSED: Automatic notification & socket event fired to Company.');
      } else {
        throw new Error('❌ TEST 2 FAILED: Notification type or receiverRole mismatch.');
      }
    } else {
      throw new Error('❌ TEST 2 FAILED: Company socket did not receive notification:new event.');
    }

    // -----------------------------------------------------
    // TEST 3: Automatic Notification on Company Shortlisting & Scheduling Interview
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing Automatic Notification on Status Update & Interview Scheduling ...');
    await updateApplicationStatus(application._id, company._id, {
      status: APPLICATION_STATUS.SHORTLISTED,
      notes: 'Impressive profile',
    });

    await updateApplicationStatus(application._id, company._id, {
      status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
      notes: 'Scheduled round 1',
      interviewDate: new Date(Date.now() + 86400000),
    });

    await new Promise((res) => setTimeout(res, 500));

    if (candidateReceivedNotifications.length >= 2) {
      console.log('✅ TEST 3 PASSED: Candidate socket received Shortlisted & Interview Scheduled events.');
    } else {
      throw new Error('❌ TEST 3 FAILED: Candidate did not receive status update notifications.');
    }

    // -----------------------------------------------------
    // TEST 4: Candidate GET /api/v1/candidate/notifications
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing GET /api/v1/candidate/notifications ...');
    const res4 = await fetch(`${BASE_URL}/api/v1/candidate/notifications`, {
      method: 'GET',
      headers: candidateHeaders,
    });
    const body4 = await res4.json();

    console.log('Response Status:', res4.status);
    console.log('Candidate Notifications:', JSON.stringify(body4.data, null, 2));

    if (
      res4.status === 200 &&
      body4.success === true &&
      body4.data.notifications.length === 2 &&
      body4.data.unreadCount === 2
    ) {
      console.log('✅ TEST 4 PASSED: Candidate notifications retrieved successfully.');
    } else {
      throw new Error('❌ TEST 4 FAILED: Candidate notification retrieval mismatch.');
    }

    const testNotifId = body4.data.notifications[0]._id;

    // -----------------------------------------------------
    // TEST 5: Candidate PATCH /api/v1/candidate/notifications/:id/read
    // -----------------------------------------------------
    console.log('\n[TEST 5] Testing PATCH /api/v1/candidate/notifications/:id/read ...');
    const res5 = await fetch(`${BASE_URL}/api/v1/candidate/notifications/${testNotifId}/read`, {
      method: 'PATCH',
      headers: candidateHeaders,
    });
    const body5 = await res5.json();

    console.log('Response Status:', res5.status);

    if (res5.status === 200 && body5.data.notification.isRead === true && body5.data.unreadCount === 1) {
      console.log('✅ TEST 5 PASSED: Single notification marked as read.');
    } else {
      throw new Error('❌ TEST 5 FAILED: Failed to mark notification as read.');
    }

    // -----------------------------------------------------
    // TEST 6: Candidate PATCH /api/v1/candidate/notifications/read-all
    // -----------------------------------------------------
    console.log('\n[TEST 6] Testing PATCH /api/v1/candidate/notifications/read-all ...');
    const res6 = await fetch(`${BASE_URL}/api/v1/candidate/notifications/read-all`, {
      method: 'PATCH',
      headers: candidateHeaders,
    });
    const body6 = await res6.json();

    console.log('Response Status:', res6.status);

    if (res6.status === 200 && body6.data.unreadCount === 0) {
      console.log('✅ TEST 6 PASSED: All candidate notifications marked as read.');
    } else {
      throw new Error('❌ TEST 6 FAILED: Failed to mark all notifications as read.');
    }

    // -----------------------------------------------------
    // TEST 7: Candidate DELETE /api/v1/candidate/notifications/:id
    // -----------------------------------------------------
    console.log('\n[TEST 7] Testing DELETE /api/v1/candidate/notifications/:id ...');
    const res7 = await fetch(`${BASE_URL}/api/v1/candidate/notifications/${testNotifId}`, {
      method: 'DELETE',
      headers: candidateHeaders,
    });
    const body7 = await res7.json();

    console.log('Response Status:', res7.status);

    if (res7.status === 200 && body7.success === true) {
      console.log('✅ TEST 7 PASSED: Notification soft deleted successfully.');
    } else {
      throw new Error('❌ TEST 7 FAILED: Failed to delete notification.');
    }

    // -----------------------------------------------------
    // TEST 8: Multi-Tenant Security Check (Accessing another user's notification)
    // -----------------------------------------------------
    console.log('\n[TEST 8] Testing Multi-Tenant Security: Accessing another user notification ...');
    const res8 = await fetch(`${BASE_URL}/api/v1/candidate/notifications/${testNotifId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherCandidateToken}`,
      },
    });
    const body8 = await res8.json();

    console.log('Response Status:', res8.status);

    if (res8.status === 404 && body8.success === false) {
      console.log('✅ TEST 8 PASSED: Unauthorized candidate cannot access another user notification (404).');
    } else {
      throw new Error('❌ TEST 8 FAILED: Multi-tenant notification security check failed.');
    }

    // Cleanup sockets
    candidateSocket.disconnect();
    companySocket.disconnect();

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 6 REAL-TIME NOTIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
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

runNotificationTests();
