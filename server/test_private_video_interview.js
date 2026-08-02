import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application } from './models/application.model.js';
import { InterviewRoom } from './models/interviewRoom.model.js';
import {
  schedulePrivateInterview,
  getPrivateInterviewRoom,
  updateRoomNotesAndScores,
  endPrivateInterview,
  getInterviewReport,
} from './controllers/interviewRoom.controller.js';

const logPass = (msg) => console.log(`✅ [PASS] ${msg}`);
const logFail = (msg, err) => {
  console.error(`❌ [FAIL] ${msg}`, err || '');
  process.exit(1);
};

const runQA = async () => {
  console.log('🚀 Starting Automated QA Audit for Enterprise Private Video Interview System...');

  try {
    await connectDB();
    logPass('MongoDB Connected');

    // 1. Create Test Domain Entities
    const testCandidate = await Candidate.create({
      fullName: 'QA Video Candidate',
      email: `candidate_qa_${Date.now()}@skillbridge.ai`,
      password: 'Password123!',
      role: 'candidate',
      isEmailVerified: true,
      skills: ['React', 'Node.js', 'WebRTC', 'Python'],
      experienceYears: 5,
      resumeUrl: 'https://skillbridge.ai/resumes/qa_candidate.pdf',
    });
    logPass(`Test Candidate Created: ${testCandidate._id}`);

    const testCompany = await Company.create({
      companyName: 'QA Video Enterprise Corp',
      email: `company_qa_${Date.now()}@skillbridge.ai`,
      password: 'Password123!',
      role: 'company',
      isEmailVerified: true,
      location: 'San Francisco, CA',
    });
    logPass(`Test Company Created: ${testCompany._id}`);

    const testUnauthorizedCandidate = await Candidate.create({
      fullName: 'Unauthorized Candidate',
      email: `unauth_cand_${Date.now()}@skillbridge.ai`,
      password: 'Password123!',
      role: 'candidate',
      isEmailVerified: true,
    });

    const testJob = await Job.create({
      companyId: testCompany._id,
      createdBy: testCompany._id,
      company: testCompany.companyName,
      title: 'Senior WebRTC Engineer',
      department: 'Engineering',
      description: 'Design and build high scale real-time WebRTC private interview video infrastructure.',
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      status: 'open',
    });
    logPass(`Test Job Created: ${testJob._id}`);

    const testApp = await Application.create({
      jobId: testJob._id,
      candidateId: testCandidate._id,
      companyId: testCompany._id,
      status: 'Under Review',
      matchScore: 92,
    });
    logPass(`Test Application Created: ${testApp._id}`);

    // Mock Express Request / Response Helper
    const mockReqRes = (reqData, user) => {
      const req = {
        body: reqData.body || {},
        params: reqData.params || {},
        query: reqData.query || {},
        user,
      };

      let responseObj = {
        statusCode: 200,
        body: null,
      };

      const res = {
        status: (code) => {
          responseObj.statusCode = code;
          return res;
        },
        json: (data) => {
          responseObj.body = data;
          return res;
        },
      };

      return { req, res, getResponse: () => responseObj };
    };

    // 2. TEST: Schedule Private Interview Room
    const scheduleData = {
      body: {
        applicationId: testApp._id.toString(),
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 45,
        interviewType: 'Technical',
        notes: 'Conduct WebRTC peer connection & live coding test.',
      },
    };

    const companyUser = { _id: testCompany._id, companyId: testCompany._id, role: 'company' };
    const { req: schedReq, res: schedRes, getResponse: getSchedResp } = mockReqRes(scheduleData, companyUser);

    await schedulePrivateInterview(schedReq, schedRes, (err) => { throw err; });
    const schedResult = getSchedResp();

    if (schedResult.statusCode !== 201 || !schedResult.body?.success) {
      logFail('Schedule private interview failed', schedResult.body);
    }
    const createdRoomId = schedResult.body.data.roomId;
    if (!createdRoomId || typeof createdRoomId !== 'string') {
      logFail('Room ID is not a valid string UUID');
    }
    logPass(`Private Interview Room Scheduled with UUID: ${createdRoomId}`);

    // Verify UUID format (Never expose Mongo ObjectIDs in URL)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(createdRoomId);
    if (!isUUID) {
      logFail(`Room ID ${createdRoomId} is not a valid UUID v4!`);
    }
    logPass('Verified Room ID is a secure crypto UUID (No MongoDB _id exposed)');

    // 3. TEST: Authorized Candidate Access (200 OK)
    const candUser = { _id: testCandidate._id, role: 'candidate', fullName: testCandidate.fullName };
    const { req: candReq, res: candRes, getResponse: getCandResp } = mockReqRes({ params: { roomId: createdRoomId } }, candUser);
    await getPrivateInterviewRoom(candReq, candRes, (err) => { throw err; });
    const candResult = getCandResp();
    if (candResult.statusCode !== 200 || !candResult.body?.success) {
      logFail('Candidate failed to access assigned interview room', candResult.body);
    }
    logPass('Assigned Candidate successfully joined private interview room (200 OK)');

    // 4. TEST: Authorized Recruiter Access (200 OK)
    const { req: recReq, res: recRes, getResponse: getRecResp } = mockReqRes({ params: { roomId: createdRoomId } }, companyUser);
    await getPrivateInterviewRoom(recReq, recRes, (err) => { throw err; });
    const recResult = getRecResp();
    if (recResult.statusCode !== 200 || !recResult.body?.success) {
      logFail('Recruiter failed to access assigned interview room', recResult.body);
    }
    logPass('Assigned Recruiter successfully joined private interview room (200 OK)');

    // 5. TEST: Unauthorized User Access Blocked (403 Forbidden)
    const unauthCandidateUser = { _id: testUnauthorizedCandidate._id, role: 'candidate' };
    const { req: unauthReq, res: unauthRes, getResponse: getUnauthResp } = mockReqRes({ params: { roomId: createdRoomId } }, unauthCandidateUser);
    await getPrivateInterviewRoom(unauthReq, unauthRes, (err) => { throw err; });
    const unauthResult = getUnauthResp();
    if (unauthResult.statusCode !== 403) {
      logFail(`Expected 403 Forbidden for unauthorized user, got ${unauthResult.statusCode}`);
    }
    logPass('Unauthorized candidate access blocked with 403 Forbidden');

    // 6. TEST: Save Recruiter Live Notes & Evaluation Sliders
    const evalData = {
      params: { roomId: createdRoomId },
      body: {
        recruiterNotes: 'Excellent WebRTC signaling knowledge and solid problem solving under time pressure.',
        recommendation: 'Yes',
        evaluationScores: {
          technical: 95,
          communication: 90,
          confidence: 88,
          problemSolving: 92,
        },
      },
    };
    const { req: evalReq, res: evalRes, getResponse: getEvalResp } = mockReqRes(evalData, companyUser);
    await updateRoomNotesAndScores(evalReq, evalRes, (err) => { throw err; });
    const evalResult = getEvalResp();
    if (evalResult.statusCode !== 200 || !evalResult.body?.success) {
      logFail('Failed to save recruiter evaluation notes & scores', evalResult.body);
    }
    logPass('Recruiter live notes & evaluation scores saved successfully');

    // 7. TEST: End Interview Session
    const { req: endReq, res: endRes, getResponse: getEndResp } = mockReqRes({ params: { roomId: createdRoomId } }, companyUser);
    await endPrivateInterview(endReq, endRes, (err) => { throw err; });
    const endResult = getEndResp();
    if (endResult.statusCode !== 200 || !endResult.body?.success) {
      logFail('Failed to conclude interview session', endResult.body);
    }
    logPass('Interview session ended successfully (status: completed)');

    // 8. TEST: Fetch Post-Interview Structured Report
    const { req: repReq, res: repRes, getResponse: getRepResp } = mockReqRes({ params: { roomId: createdRoomId } }, companyUser);
    await getInterviewReport(repReq, repRes, (err) => { throw err; });
    const repResult = getRepResp();
    if (repResult.statusCode !== 200 || !repResult.body?.data?.report) {
      logFail('Failed to retrieve post-interview structured report', repResult.body);
    }
    logPass('Post-Interview Evaluation Report generated successfully');

    // 9. TEST: Expired Room Handling (410 Gone)
    const expiredRoom = await InterviewRoom.create({
      roomId: crypto.randomUUID(),
      applicationId: testApp._id,
      candidateId: testCandidate._id,
      companyId: testCompany._id,
      jobId: testJob._id,
      interviewType: 'HR',
      scheduledDate: new Date(Date.now() - 5 * 24 * 3600 * 1000), // 5 days ago
      durationMinutes: 45,
      status: 'expired',
    });

    const { req: expReq, res: expRes, getResponse: getExpResp } = mockReqRes({ params: { roomId: expiredRoom.roomId } }, candUser);
    await getPrivateInterviewRoom(expReq, expRes, (err) => { throw err; });
    const expResult = getExpResp();
    if (expResult.statusCode !== 410) {
      logFail(`Expected 410 Gone for expired interview, got ${expResult.statusCode}`);
    }
    logPass('Expired interview room link correctly returned 410 Gone');

    // Cleanup Test Data
    await Candidate.deleteMany({ _id: { $in: [testCandidate._id, testUnauthorizedCandidate._id] } });
    await Company.deleteMany({ _id: testCompany._id });
    await Job.deleteMany({ _id: testJob._id });
    await Application.deleteMany({ _id: testApp._id });
    await InterviewRoom.deleteMany({ roomId: { $in: [createdRoomId, expiredRoom.roomId] } });
    logPass('Cleaned up test QA records');

    console.log('\n🎉 ALL QA CHECKS PASSED FOR PRIVATE VIDEO INTERVIEW SYSTEM!');
    process.exit(0);
  } catch (error) {
    logFail('Unhandled exception during QA execution', error);
  }
};

runQA();
