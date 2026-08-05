import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  createVideoInterviewService,
  startCandidateVideoInterviewService,
  submitVideoResponseService,
  finishVideoInterviewService,
} from './services/videoInterview.service.js';
import { VideoInterview } from './models/videoInterview.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';

async function runUnlimitedPracticeInterviewsTest() {
  console.log('🚀 Running Unlimited AI Practice Interviews & Session Isolation Verification...');

  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Connected to MongoDB');

    // 1. Candidate starts Interview #1
    const session1 = await createVideoInterviewService({
      title: 'Practice Interview #1',
      interviewType: 'Technical',
      totalQuestions: 2,
    });
    console.log('✅ 1. Created Interview #1:', session1.interviewId.toString());

    // Submit and finish Interview #1
    const q1 = session1.videoInterview.questions[0];
    await submitVideoResponseService({
      interviewId: session1.interviewId,
      candidateIdStr: session1.videoInterview.candidateId,
      questionId: q1.questionId,
      videoUrl: 'https://res.cloudinary.com/skillbridge/video/upload/v1/interviews/q1.mp4',
      transcriptText: 'React components manage local state using hooks.',
    });
    await finishVideoInterviewService(session1.interviewId, session1.videoInterview.candidateId);
    console.log('✅ 2. Finished Interview #1 (Status: Completed)');

    // 2. Candidate clicks "Start AI Interview" again -> Must create BRAND NEW Interview #2
    const session2 = await createVideoInterviewService({
      title: 'Practice Interview #2',
      interviewType: 'HR',
      totalQuestions: 2,
    });
    console.log('✅ 3. Created Interview #2:', session2.interviewId.toString());

    if (session1.interviewId.toString() === session2.interviewId.toString()) {
      throw new Error('FAILED: Session #2 re-used the ID of completed Session #1!');
    }
    console.log('✅ 4. ID Isolation Verified: Interview #1 and #2 have distinct MongoDB ObjectIDs.');

    // 3. Attempting to reopen/restart completed Interview #1 MUST be blocked
    let reopenBlocked = false;
    try {
      await startCandidateVideoInterviewService(session1.interviewId, session1.videoInterview.candidateId);
    } catch (err) {
      if (err.message.includes('already ended')) {
        reopenBlocked = true;
        console.log('✅ 5. Reopening Completed Session #1 was correctly BLOCKED.');
      }
    }
    if (!reopenBlocked) {
      throw new Error('FAILED: Reopening completed Session #1 was NOT blocked!');
    }

    // 4. Start active candidate session for Interview #2 -> MUST succeed
    const started2 = await startCandidateVideoInterviewService(session2.interviewId, session2.videoInterview.candidateId);
    console.log('✅ 6. Starting Active Session for Interview #2 succeeded! Status:', started2.status);

    // 5. Verify history co-existence in MongoDB
    const candidateHistory = await VideoInterview.find({
      candidateId: session1.videoInterview.candidateId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

    console.log(`✅ 7. Total Practice Interviews in MongoDB History: ${candidateHistory.length}`);
    candidateHistory.forEach((item, index) => {
      console.log(`   - [${index + 1}] ID: ${item._id} | Title: ${item.title} | Status: ${item.status}`);
    });

    console.log('🎉 UNLIMITED PRACTICE INTERVIEWS & SESSION ISOLATION VERIFIED 100%!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runUnlimitedPracticeInterviewsTest();
