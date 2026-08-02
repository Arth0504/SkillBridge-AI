import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application } from './models/application.model.js';
import { Interview } from './models/interview.model.js';
import { InterviewRoom } from './models/interviewRoom.model.js';
import { createInterviewService } from './services/interview.service.js';
import expressApp from './app.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';
const TEST_PORT = 5059;
const BASE_URL = 'http://127.0.0.1:5059';

async function runCandidateJoinE2EVerification() {
  console.log('\n===========================================================');
  console.log('⚡ CANDIDATE PRIVATE INTERVIEW ROOM JOIN E2E VERIFICATION');
  console.log('===========================================================\n');

  let server;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ Connected to MongoDB.');

    await new Promise((resolve) => {
      server = expressApp.listen(TEST_PORT, () => {
        console.log(`✔ Test Server listening on port ${TEST_PORT}`);
        resolve();
      });
    });

    // 1. Setup Test Entities
    const cand = await Candidate.create({
      fullName: 'Join Candidate QA',
      email: `join_cand_${Date.now()}@skillbridge.ai`,
      password: 'password123',
    });

    const unauthCand = await Candidate.create({
      fullName: 'Unauthorized Candidate QA',
      email: `unauth_cand_${Date.now()}@skillbridge.ai`,
      password: 'password123',
    });

    const comp = await Company.create({
      companyName: 'Join Tech Enterprise',
      email: `join_comp_${Date.now()}@skillbridge.ai`,
      password: 'password123',
    });

    const job = await Job.create({
      companyId: comp._id,
      createdBy: comp._id,
      company: comp.companyName,
      title: 'Senior WebRTC Engineer',
      description: 'Candidate room join test job.',
      department: 'Engineering',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      workMode: 'Remote',
      employmentType: 'Full Time',
      experienceLevel: 'senior',
    });

    const app = await Application.create({
      candidateId: cand._id,
      companyId: comp._id,
      jobId: job._id,
      status: 'Interview Scheduled',
      appliedAt: new Date(),
    });

    // Generate JWT tokens
    const candToken = generateToken({ id: cand._id, role: 'candidate' });
    const unauthCandToken = generateToken({ id: unauthCand._id, role: 'candidate' });
    const compToken = generateToken({ id: comp._id, role: 'company' });

    console.log('\n--- STEP 1: RECRUITER SCHEDULES INTERVIEW ---');
    const interviewRes = await createInterviewService(comp._id.toString(), {
      applicationId: app._id.toString(),
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      startTime: '14:00',
      endTime: '15:00',
      interviewType: 'Technical',
      title: 'Technical WebRTC Private Session',
    });

    const roomId = interviewRes.roomId;
    console.log('✔ Interview Scheduled ID:', interviewRes.interview._id.toString());
    console.log('✔ Private Room UUID:', roomId);
    console.log('✔ Meeting Link:', interviewRes.interview.meetingLink);

    console.log('\n--- STEP 2: CANDIDATE JOINS PRIVATE ROOM VIA UUID ---');
    const resUuid = await fetch(`${BASE_URL}/api/v1/interviews/private/room/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candToken}`,
      },
    });
    const bodyUuid = await resUuid.json();
    console.log('Candidate UUID Room Join Status:', resUuid.status);
    console.log('Room Title:', bodyUuid.data?.room?.jobId?.title || bodyUuid.data?.room?.title);
    if (resUuid.status !== 200 || !bodyUuid.data?.room) {
      throw new Error('Candidate UUID room join failed!');
    }
    console.log('✔ Candidate joined room via UUID successfully (200 OK)');

    console.log('\n--- STEP 3: CANDIDATE JOINS VIA INTERVIEW MONGO OBJECTID (AUTO-RESOLVE) ---');
    const resIvId = await fetch(`${BASE_URL}/api/v1/interviews/private/room/${interviewRes.interview._id.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candToken}`,
      },
    });
    const bodyIvId = await resIvId.json();
    console.log('Candidate Interview ID Join Status:', resIvId.status);
    if (resIvId.status !== 200 || !bodyIvId.data?.room) {
      throw new Error('Candidate Interview ID auto-resolve room join failed!');
    }
    console.log('✔ Candidate joined room via Interview ObjectId auto-resolution (200 OK)');

    console.log('\n--- STEP 4: CANDIDATE JOINS VIA APPLICATION MONGO OBJECTID (AUTO-RESOLVE) ---');
    const resAppId = await fetch(`${BASE_URL}/api/v1/interviews/private/room/${app._id.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candToken}`,
      },
    });
    const bodyAppId = await resAppId.json();
    console.log('Candidate Application ID Join Status:', resAppId.status);
    if (resAppId.status !== 200 || !bodyAppId.data?.room) {
      throw new Error('Candidate Application ID auto-resolve room join failed!');
    }
    console.log('✔ Candidate joined room via Application ObjectId auto-resolution (200 OK)');

    console.log('\n--- STEP 5: SECURITY CHECK - UNAUTHORIZED CANDIDATE ACCESS ---');
    const resUnauth = await fetch(`${BASE_URL}/api/v1/interviews/private/room/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unauthCandToken}`,
      },
    });
    console.log('Unauthorized Candidate Join Status:', resUnauth.status);
    if (resUnauth.status !== 403) {
      throw new Error('Security failure: Unauthorized candidate was not blocked with 403!');
    }
    console.log('✔ Unauthorized candidate correctly blocked with 403 Forbidden');

    // Clean up test data
    await Promise.all([
      Candidate.findByIdAndDelete(cand._id),
      Candidate.findByIdAndDelete(unauthCand._id),
      Company.findByIdAndDelete(comp._id),
      Job.findByIdAndDelete(job._id),
      Application.findByIdAndDelete(app._id),
      Interview.findByIdAndDelete(interviewRes.interview._id),
      InterviewRoom.deleteOne({ roomId }),
    ]);

    console.log('\n===========================================================');
    console.log('🎉 CANDIDATE ROOM JOIN E2E VERIFICATION 100% SUCCESSFUL');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('❌ E2E VERIFICATION ERROR:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runCandidateJoinE2EVerification();
