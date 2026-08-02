import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Interview } from './models/interview.model.js';
import { updateInterviewStatusService, deleteInterviewService } from './services/interview.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';

async function testTargetInterview() {
  console.log('\n===========================================================');
  console.log('🔍 REPRODUCING INTERVIEW 500 ERROR ON TARGET ID: 6a6b188d58c54d58e9b72e1c');
  console.log('===========================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ Connected to MongoDB');

    const targetId = '6a6b188d58c54d58e9b72e1c';
    const interview = await Interview.findById(targetId);

    if (!interview) {
      console.log(`ℹ Interview document ${targetId} not found in database.`);
      // Find any existing interview document to test against live database schema
      const anyInterview = await Interview.findOne({});
      if (anyInterview) {
        console.log('Found existing interview in DB:', anyInterview._id.toString(), 'Company:', anyInterview.companyId?.toString());
        console.log('Testing updateInterviewStatusService on existing DB interview...');
        try {
          await updateInterviewStatusService(anyInterview._id.toString(), anyInterview.companyId.toString(), 'Completed');
          console.log('✔ Update status success!');
        } catch (err) {
          console.error('❌ STACK TRACE ON UPDATE STATUS:');
          console.error(err);
        }

        console.log('Testing deleteInterviewService on existing DB interview...');
        try {
          await deleteInterviewService(anyInterview._id.toString(), anyInterview.companyId.toString());
          console.log('✔ Delete success!');
        } catch (err) {
          console.error('❌ STACK TRACE ON DELETE:');
          console.error(err);
        }
      } else {
        console.log('No interviews exist in MongoDB database.');
      }
    } else {
      console.log('Found target interview document:', interview);
      console.log('Testing updateInterviewStatusService...');
      try {
        await updateInterviewStatusService(interview._id.toString(), interview.companyId.toString(), 'Completed');
        console.log('✔ Update status success!');
      } catch (err) {
        console.error('❌ STACK TRACE ON UPDATE STATUS:');
        console.error(err);
      }

      console.log('Testing deleteInterviewService...');
      try {
        await deleteInterviewService(interview._id.toString(), interview.companyId.toString());
        console.log('✔ Delete success!');
      } catch (err) {
        console.error('❌ STACK TRACE ON DELETE:');
        console.error(err);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ REPRODUCTION SCRIPT ERROR:');
    console.error(err);
    process.exit(1);
  }
}

testTargetInterview();
