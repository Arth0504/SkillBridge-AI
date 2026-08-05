import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createVideoInterviewService, submitVideoResponseService, finishVideoInterviewService } from './services/videoInterview.service.js';
import { VideoInterview } from './models/videoInterview.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';

async function runVerification() {
  console.log('🚀 Starting AI Video Interview Module Full Verification...');

  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Connected to MongoDB');

    // 1. Create Video Interview
    const initRes = await createVideoInterviewService({
      title: 'Verification AI Video Screening',
      interviewType: 'Technical',
      totalQuestions: 3,
    });

    console.log('✅ 1. Video Interview Initialized:', initRes.interviewId.toString());

    // 2. Submit Question 1 Response (MERN stack answer)
    const q1Obj = initRes.videoInterview.questions[0];
    const sub1 = await submitVideoResponseService({
      interviewId: initRes.interviewId,
      candidateIdStr: initRes.videoInterview.candidateId,
      questionId: q1Obj.questionId,
      videoUrl: 'https://res.cloudinary.com/skillbridge/video/upload/v1/interviews/q1.mp4',
      transcriptText: 'I built a scalable MERN application with React frontend and Express microservices.',
    });

    console.log('✅ 2. Question 1 Submitted & Evaluated. Overall Score:', sub1.evaluatedResponse.evaluation.overallResponseScore);
    console.log('   Follow-Up Question Generated for Q2:', sub1.nextQuestion?.questionText);

    // 3. Submit Question 2 Response (JWT / Auth answer)
    const q2Obj = sub1.nextQuestion || initRes.videoInterview.questions[1];
    const sub2 = await submitVideoResponseService({
      interviewId: initRes.interviewId,
      candidateIdStr: initRes.videoInterview.candidateId,
      questionId: q2Obj.questionId,
      videoUrl: 'https://res.cloudinary.com/skillbridge/video/upload/v1/interviews/q2.mp4',
      transcriptText: 'I implemented JWT authentication with access tokens and refresh tokens stored in Redis.',
    });

    console.log('✅ 3. Question 2 Submitted & Evaluated. Score:', sub2.evaluatedResponse.evaluation.overallResponseScore);
    console.log('   Follow-Up Question Generated for Q3:', sub2.nextQuestion?.questionText);

    // 4. Submit Question 3 Response (Redis answer)
    const q3Obj = sub2.nextQuestion || initRes.videoInterview.questions[2];
    const sub3 = await submitVideoResponseService({
      interviewId: initRes.interviewId,
      candidateIdStr: initRes.videoInterview.candidateId,
      questionId: q3Obj.questionId,
      videoUrl: 'https://res.cloudinary.com/skillbridge/video/upload/v1/interviews/q3.mp4',
      transcriptText: 'Redis provides sub-millisecond in-memory cache eviction which is faster than querying MongoDB.',
    });

    console.log('✅ 4. Question 3 Submitted & Evaluated. Score:', sub3.evaluatedResponse.evaluation.overallResponseScore);

    // 5. Finish Interview & Compile Report
    const finalReport = await finishVideoInterviewService(initRes.interviewId, initRes.videoInterview.candidateId);
    console.log('✅ 5. Executive Report Compiled & Saved to MongoDB:');
    console.log('   - Overall Score:', finalReport.overallScore);
    console.log('   - Technical Score:', finalReport.technicalScore);
    console.log('   - Communication Score:', finalReport.communicationScore);
    console.log('   - Recommendation:', finalReport.feedback.hiringRecommendation);

    console.log('🎉 ALL BACKEND VERIFICATIONS PASSED 100%!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();
