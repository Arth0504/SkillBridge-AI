import mongoose from 'mongoose';
import { InterviewSession } from './models/interviewSession.model.js';
import { sanitizeInterviewConfig } from './services/interviewAI.service.js';
import dotenv from 'dotenv';

dotenv.config();

const runRefactoringTest = async () => {
  console.log('=== VERIFYING REFACTORED INTERVIEWSESSION MODEL & MIGRATION ===\n');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_test';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    console.log('[1] Testing sanitizeInterviewConfig migration logic...');
    
    // Case A: Refactored clean inputs
    const cleanConfig = sanitizeInterviewConfig('Hard', 'Architect');
    console.log('Clean Input ("Hard", "Architect") ->', cleanConfig);
    if (cleanConfig.difficulty !== 'Hard' || cleanConfig.experienceLevel !== 'Architect') {
      throw new Error('Clean config sanitization failed');
    }

    // Case B: Legacy input with job title in difficulty
    const legacyConfig = sanitizeInterviewConfig('Lead Architect', null);
    console.log('Legacy Input ("Lead Architect") ->', legacyConfig);
    if (legacyConfig.difficulty !== 'Hard' || legacyConfig.experienceLevel !== 'Architect') {
      throw new Error('Legacy config sanitization failed');
    }

    console.log('✅ Sanitizer & Legacy Migration Logic Verified.');

    console.log('\n[2] Testing MongoDB Mongoose persistence with refactored fields...');
    const dummyCandidateId = new mongoose.Types.ObjectId();

    const sessionDoc = await InterviewSession.create({
      candidateId: dummyCandidateId,
      interviewType: 'Technical',
      difficulty: cleanConfig.difficulty,
      experienceLevel: cleanConfig.experienceLevel,
      status: 'In Progress',
      questions: [
        {
          questionId: new mongoose.Types.ObjectId().toString(),
          questionText: 'Explain microservices architecture tradeoffs.',
          category: 'Technical',
          difficulty: 'Hard',
          expectedKeyPoints: ['Service boundaries', 'Eventual consistency', 'Distributed tracing'],
        }
      ]
    });

    console.log('Created Session Document in MongoDB:');
    console.log(`- ID: ${sessionDoc._id}`);
    console.log(`- Difficulty: ${sessionDoc.difficulty}`);
    console.log(`- ExperienceLevel: ${sessionDoc.experienceLevel}`);
    console.log(`- Question Difficulty: ${sessionDoc.questions[0].difficulty}`);

    if (sessionDoc.difficulty !== 'Hard' || sessionDoc.experienceLevel !== 'Architect' || sessionDoc.questions[0].difficulty !== 'Hard') {
      throw new Error('Persisted document fields do not match refactored schema expectations');
    }

    // Cleanup
    await InterviewSession.findByIdAndDelete(sessionDoc._id);
    console.log('✅ MongoDB Record Cleaned Up.');

    console.log('\n🎉 ALL REFACTORED INTERVIEWSESSION TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Refactor Test Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runRefactoringTest();
