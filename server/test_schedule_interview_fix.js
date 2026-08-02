import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application } from './models/application.model.js';
import { createInterviewService } from './services/interview.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';

async function verifyInterviewScheduling() {
  console.log('\n===========================================================');
  console.log('🔍 VERIFYING POST /api/v1/company/interviews EXECUTION');
  console.log('===========================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ MongoDB Connected');

    // 1. Create Test Setup
    const cand = await Candidate.create({
      fullName: 'Interview Test Candidate',
      email: `test_cand_${Date.now()}@example.com`,
      password: 'password123',
    });

    const comp = await Company.create({
      companyName: 'Interview Test Company',
      email: `test_comp_${Date.now()}@example.com`,
      password: 'password123',
    });

    const job = await Job.create({
      companyId: comp._id,
      createdBy: comp._id,
      company: comp.companyName,
      title: 'Senior Frontend Developer',
      description: 'Test job description for video interview scheduling.',
      department: 'Engineering',
      location: { city: 'New York', state: 'NY', country: 'USA' },
      workMode: 'Remote',
      employmentType: 'Full Time',
      experienceLevel: 'senior',
    });

    const app = await Application.create({
      jobId: job._id,
      candidateId: cand._id,
      companyId: comp._id,
      status: 'Applied',
    });

    console.log('\n--- EXECUTING createInterviewService ---');
    const result = await createInterviewService(comp._id.toString(), {
      applicationId: app._id.toString(),
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      startTime: '10:00',
      endTime: '11:00',
      interviewType: 'Technical',
      title: 'Technical Deep Dive',
      notes: 'Please review system design guidelines.',
    });

    console.log('✔ Interview Record Created ID:', result.interview._id.toString());
    console.log('✔ Generated Private Room UUID:', result.roomId);
    console.log('✔ Meeting Link Generated:', result.interview.meetingLink);
    console.log('✔ Meeting Platform Saved:', result.interview.meetingPlatform);
    console.log('✔ Associated Candidate:', result.interview.candidateId?.fullName);

    // Cleanup
    await Promise.all([
      Candidate.findByIdAndDelete(cand._id),
      Company.findByIdAndDelete(comp._id),
      Job.findByIdAndDelete(job._id),
      Application.findByIdAndDelete(app._id),
    ]);

    console.log('\n===========================================================');
    console.log('🎉 SCHEDULING VERIFICATION PASSED');
    console.log('===========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ SCHEDULING TEST FAILED WITH ERROR:');
    console.error(err);
    process.exit(1);
  }
}

verifyInterviewScheduling();
