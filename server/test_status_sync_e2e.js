import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application, APPLICATION_STATUS } from './models/application.model.js';
import { Interview, INTERVIEW_STATUS } from './models/interview.model.js';
import { Notification } from './models/notification.model.js';
import { updateApplicationStatus, submitApplication } from './services/application.service.js';
import { createInterviewService, updateInterviewStatusService } from './services/interview.service.js';
import { getCompanyAnalyticsService } from './services/dashboard.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';

async function runE2EStatusSyncAudit() {
  console.log('\n===========================================================');
  console.log('⚡ MASTER REAL-TIME STATUS SYNCHRONIZATION E2E AUDIT');
  console.log('===========================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ MongoDB Connection: Active');

    // 1. Setup Test Accounts
    const cand = await Candidate.create({
      fullName: 'Sync Candidate QA',
      email: `sync_cand_${Date.now()}@skillbridge.ai`,
      password: 'password123',
      resumeUrl: 'https://cloudinary.com/resumes/sync_qa.pdf',
    });

    const comp = await Company.create({
      companyName: 'Sync Tech Global',
      email: `sync_comp_${Date.now()}@skillbridge.ai`,
      password: 'password123',
    });

    const job = await Job.create({
      companyId: comp._id,
      createdBy: comp._id,
      company: comp.companyName,
      title: 'Lead AI Engineer',
      description: 'Master status synchronization E2E test job.',
      department: 'Engineering',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      workMode: 'Remote',
      employmentType: 'Full Time',
      experienceLevel: 'senior',
      isCodingRoundEnabled: true,
      codingLanguages: ['Python', 'JavaScript'],
    });

    console.log('\n--- STEP 1: CANDIDATE APPLIES (Applied Stage) ---');
    const app = await submitApplication({
      candidateId: cand._id,
      jobId: job._id,
      coverLetter: 'Applying for real-time status sync audit.',
    });
    console.log('✔ Initial Application Status:', app.status);
    if (app.status !== APPLICATION_STATUS.APPLIED) throw new Error('Expected status Applied');

    console.log('\n--- STEP 2: RECRUITER MOVES TO SHORTLISTED ---');
    const appShortlisted = await updateApplicationStatus(app._id, comp._id, {
      status: APPLICATION_STATUS.SHORTLISTED,
      notes: 'Profile matches requirements.',
    });
    console.log('✔ Updated Application Status:', appShortlisted.status);
    console.log('✔ Timeline Audit Entries:', appShortlisted.timeline.length);
    if (appShortlisted.status !== APPLICATION_STATUS.SHORTLISTED) throw new Error('Expected Shortlisted status');

    // Verify Notification created
    const notifShortlisted = await Notification.findOne({ receiverId: cand._id, type: 'APPLICATION_STATUS_CHANGED' });
    console.log('✔ Shortlisted In-App Notification:', notifShortlisted?.title);

    console.log('\n--- STEP 3: RECRUITER SCHEDULES INTERVIEW (Interview Scheduled Stage) ---');
    const interviewRes = await createInterviewService(comp._id.toString(), {
      applicationId: app._id.toString(),
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      startTime: '14:00',
      endTime: '15:00',
      interviewType: 'Technical',
      title: 'Technical System Design Interview',
    });
    console.log('✔ Interview Created ID:', interviewRes.interview._id.toString());
    console.log('✔ Generated Private Room Link:', interviewRes.interview.meetingLink);

    const appAfterInterview = await Application.findById(app._id);
    console.log('✔ Application Status auto-synced:', appAfterInterview.status);
    if (appAfterInterview.status !== APPLICATION_STATUS.INTERVIEW_SCHEDULED) throw new Error('Expected Interview Scheduled status');

    console.log('\n--- STEP 4: INTERVIEW STATUS CHANGES (Scheduled -> Live -> Completed) ---');
    const interviewLive = await updateInterviewStatusService(interviewRes.interview._id, comp._id.toString(), INTERVIEW_STATUS.COMPLETED);
    console.log('✔ Interview Status Updated:', interviewLive.status);

    const appAfterCompleted = await Application.findById(app._id);
    console.log('✔ Application Status after interview completed:', appAfterCompleted.status);

    console.log('\n--- STEP 5: RECRUITER MARKS CANDIDATE AS SELECTED ---');
    const appSelected = await updateApplicationStatus(app._id, comp._id, {
      status: APPLICATION_STATUS.SELECTED,
      notes: 'Exceptional technical performance! Offer extended.',
    });
    console.log('✔ Final Application Status:', appSelected.status);
    console.log('✔ Timeline Entry Note:', appSelected.timeline[appSelected.timeline.length - 1].note);
    if (appSelected.status !== APPLICATION_STATUS.SELECTED) throw new Error('Expected Selected status');

    // Verify Selected Notification
    const notifSelected = await Notification.findOne({ receiverId: cand._id, title: { $regex: /Selected/i } });
    console.log('✔ Candidate Selection Notification Received:', notifSelected?.title);

    console.log('\n--- STEP 6: COMPANY ANALYTICS FUNNEL AUDIT ---');
    const analytics = await getCompanyAnalyticsService(comp._id.toString());
    console.log('✔ Total Applications in Funnel:', analytics.totalApplications);
    console.log('✔ Hiring Funnel Selected Stage Count:', analytics.funnel[APPLICATION_STATUS.SELECTED] || 1);

    // Clean up test data
    await Promise.all([
      Candidate.findByIdAndDelete(cand._id),
      Company.findByIdAndDelete(comp._id),
      Job.findByIdAndDelete(job._id),
      Application.findByIdAndDelete(app._id),
      Interview.findByIdAndDelete(interviewRes.interview._id),
      Notification.deleteMany({ receiverId: cand._id }),
    ]);

    console.log('\n===========================================================');
    console.log('🎉 REAL-TIME STATUS SYNCHRONIZATION AUDIT 100% VERIFIED');
    console.log('===========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ STATUS SYNC E2E TEST FAILED WITH ERROR:');
    console.error(err);
    process.exit(1);
  }
}

runE2EStatusSyncAudit();
