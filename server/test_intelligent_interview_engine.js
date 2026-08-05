import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { generateToken } from './utils/generateToken.js';
import { ROLES } from './config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';

async function runIntelligentInterviewEngineTest() {
  console.log('\n===============================================================');
  console.log('🚀 INTELLIGENT AI INTERVIEW ENGINE DUPLICATE PREVENTION TEST');
  console.log('===============================================================\n');

  let server;
  let baseUrl;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    let candidate = await Candidate.findOne({ isDeleted: { $ne: true } });
    if (!candidate) {
      candidate = await Candidate.create({
        fullName: 'Interview Engine Candidate',
        email: 'enginecandidate@skillbridge.ai',
        password: 'Password123!',
      });
    }

    const token = generateToken({ id: candidate._id.toString(), role: ROLES.CANDIDATE });

    // 1. Start AI Mock Interview Session
    console.log('\n📌 1. Starting AI Mock Interview Session...');
    const startRes = await fetch(`${baseUrl}/api/v1/candidate/ai-interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        interviewType: 'Mixed',
        difficulty: 'Medium',
        experienceLevel: 'Senior',
      }),
    });

    const startJson = await startRes.json();
    console.log(`Start Status: ${startRes.status}`);
    const session = startJson.data?.session;
    const initialQuestion = session?.questions?.[0];

    if (!session || !initialQuestion) {
      console.error('❌ Failed to initialize interview session.', JSON.stringify(startJson));
      process.exit(1);
    }

    const sessionId = session._id;
    const askedQuestions = [initialQuestion.questionText];
    console.log(`✅ Session Started: ${sessionId}`);
    console.log(`Q1: ${initialQuestion.questionText}`);

    // 2. Simulate 4 successive answer submissions & question generation turns
    for (let turn = 1; turn <= 4; turn++) {
      console.log(`\n📌 Submitting turn ${turn} answer...`);
      const answerRes = await fetch(`${baseUrl}/api/v1/candidate/ai-interview/${sessionId}/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: initialQuestion.questionId || turn.toString(),
          answerText: `My detailed technical response for question ${turn}. We profiled component re-renders, fixed state mutations, applied React.memo referential checks, optimized MongoDB indexes using explain executionStats, and secured Express API endpoints with HttpOnly SameSite cookies.`,
        }),
      });

      const answerJson = await answerRes.json();
      console.log(`Turn ${turn} Status: ${answerRes.status}`);

      const nextQuestion = answerJson.data?.nextQuestion;
      if (nextQuestion && nextQuestion.questionText) {
        console.log(`Q${turn + 1}: ${nextQuestion.questionText}`);

        // Check for duplicates
        const isDuplicate = askedQuestions.some((q) => q.toLowerCase().trim() === nextQuestion.questionText.toLowerCase().trim());
        if (isDuplicate) {
          console.error(`❌ [FAIL] DUPLICATE QUESTION DETECTED ON TURN ${turn + 1}: "${nextQuestion.questionText}"`);
          process.exit(1);
        }

        askedQuestions.push(nextQuestion.questionText);
      } else if (answerJson.data?.isInterviewComplete) {
        console.log('✅ Interview completed turn progression cleanly.');
        break;
      }
    }

    console.log(`\nTotal Unique Questions Asked: ${askedQuestions.length}`);
    console.log('All Questions:');
    askedQuestions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));

    console.log('\n===============================================================');
    console.log('🎉 ALL INTELLIGENT QUESTION ENGINE DUPLICATE PREVENTION TESTS PASSED!');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runIntelligentInterviewEngineTest();
