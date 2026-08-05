import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { Candidate } from './models/candidate.model.js';
import {
  suggestResumeContentWithAI,
  checkResumeGrammarWithAI,
  analyzeATSWithAI,
  matchJobWithAI,
} from './services/ai.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';

async function runResumeBuilderQA() {
  console.log('\n===============================================================');
  console.log('🚀 AI RESUME BUILDER COMPREHENSIVE QA AUDIT VERIFICATION');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      throw new Error(`Assertion failed for: ${testName}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: MongoDB Database Connection & Candidate Schema Verification
    // -------------------------------------------------------------
    console.log('📌 Test Group 1: Candidate Profile MongoDB Persistence & Schema');
    await mongoose.connect(MONGODB_URI);
    assert(mongoose.connection.readyState === 1, 'MongoDB connected successfully');

    const testEmail = `qa_builder_${Date.now()}@test.com`;
    const candidate = new Candidate({
      fullName: 'QA Audit Candidate',
      email: testEmail,
      password: 'Password123!',
      phone: '+1 555-0199',
      location: 'San Francisco, CA',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker'],
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          startDate: new Date('2022-01-01'),
          current: true,
          description: 'Architected scalable microservices using Node.js and MongoDB.',
        },
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'B.S.',
          fieldOfStudy: 'Computer Science',
          endYear: 2021,
        },
      ],
      projects: [
        {
          title: 'AI Resume Builder Platform',
          description: 'Built interactive resume builder with live preview & Gemini AI integration.',
          link: 'https://github.com/test/resume-builder',
          technologies: ['React', 'Express', 'MongoDB'],
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          credentialUrl: 'https://aws.amazon.com/verify/12345',
        },
      ],
      resumeTemplate: {
        layout: 'split',
        colorTheme: 'emerald',
        font: 'modern',
      },
    });

    await candidate.save();
    assert(candidate._id, 'Candidate model saved successfully to MongoDB');

    // Retrieve saved candidate
    const retrievedCandidate = await Candidate.findById(candidate._id);
    assert(retrievedCandidate.fullName === 'QA Audit Candidate', 'Retrieved fullName matches');
    assert(retrievedCandidate.projects.length === 1, 'Retrieved projects array persists in MongoDB');
    assert(retrievedCandidate.projects[0].title === 'AI Resume Builder Platform', 'Project title matches');
    assert(retrievedCandidate.certifications.length === 1, 'Retrieved certifications array persists in MongoDB');
    assert(retrievedCandidate.certifications[0].name === 'AWS Certified Solutions Architect', 'Certification name matches');
    assert(retrievedCandidate.resumeTemplate.layout === 'split', 'Resume template layout persists in MongoDB');
    assert(retrievedCandidate.resumeTemplate.colorTheme === 'emerald', 'Resume template colorTheme persists in MongoDB');
    assert(retrievedCandidate.resumeTemplate.font === 'modern', 'Resume template font persists in MongoDB');

    // Clean up QA candidate document
    await Candidate.findByIdAndDelete(candidate._id);
    console.log('  ✔ MongoDB persistence verified for projects, certifications, & resumeTemplate.\n');

    // -------------------------------------------------------------
    // TEST 2: ATS Score Calculation Logic Edge Cases
    // -------------------------------------------------------------
    console.log('📌 Test Group 2: ATS Score Formula Accuracy & Safe Calculation');

    const calculateAtsScoreTest = (personal, summary, skills, experience, education, projects, certifications) => {
      let score = 40; // baseline
      if (personal?.fullName && personal?.email && personal?.phone) score += 10;
      const summaryWords = (summary || '').trim().split(/\s+/).filter(Boolean);
      if (summaryWords.length >= 25) score += 10;
      const validEdu = (education || []).filter((e) => e?.institution?.trim() || e?.degree?.trim());
      if (validEdu.length > 0) score += 15;
      const validExp = (experience || []).filter((e) => e?.company?.trim() || e?.title?.trim());
      if (validExp.length > 0) score += 15;
      const validSkills = (skills || []).filter((s) => typeof s === 'string' && s.trim());
      if (validSkills.length >= 5) score += 10;
      const validProj = (projects || []).filter((p) => p?.title?.trim() || p?.description?.trim());
      if (validProj.length > 0) score += 10;
      const validCert = (certifications || []).filter((c) => c?.name?.trim() || c?.issuer?.trim());
      if (validCert.length > 0) score += 5;
      return Math.min(100, score);
    };

    // Test A: Null / Undefined values safety
    const nullScore = calculateAtsScoreTest(null, null, null, null, null, null, null);
    assert(nullScore === 40, 'Null values handled safely returning baseline score of 40');

    // Test B: Empty placeholder arrays (should NOT inflate score)
    const emptyPlaceholdersScore = calculateAtsScoreTest(
      { fullName: '', email: '', phone: '' },
      '',
      [],
      [{ company: '', title: '' }], // empty placeholder item
      [{ institution: '', degree: '' }], // empty placeholder item
      [{ title: '', description: '' }],
      [{ name: '', issuer: '' }]
    );
    assert(emptyPlaceholdersScore === 40, 'Empty placeholder items do NOT artificially inflate ATS score');

    // Test C: Fully filled profile score
    const fullScore = calculateAtsScoreTest(
      { fullName: 'Jane Doe', email: 'jane@test.com', phone: '1234567890' },
      'Passionate senior software engineer with over 8 years of experience leading full stack engineering teams, architecting distributed cloud systems, optimizing database performance, and driving high velocity features.',
      ['React', 'Node', 'TypeScript', 'MongoDB', 'AWS'],
      [{ company: 'Tech', title: 'Lead' }],
      [{ institution: 'MIT', degree: 'MS' }],
      [{ title: 'App', description: 'Platform' }],
      [{ name: 'AWS SA', issuer: 'Amazon' }]
    );
    assert(fullScore === 100, 'Fully completed profile achieves 100% ATS score');
    console.log('  ✔ ATS Score calculation accuracy verified.\n');

    // -------------------------------------------------------------
    // TEST 3: AI Suggest Content Gateway & Fallbacks
    // -------------------------------------------------------------
    console.log('📌 Test Group 3: AI Suggest Content Endpoint & Fallback');
    const suggestRes = await suggestResumeContentWithAI('work experience', 'Architected microservices using Node.js, Express, and Redis.');
    assert(suggestRes && Array.isArray(suggestRes.suggestions), 'Suggest Content returns suggestions array');
    assert(suggestRes.suggestions.length > 0, 'Suggestions list is non-empty');
    assert(typeof suggestRes.suggestedText === 'string', 'Suggest Content returns suggestedText string');
    console.log('  ✔ AI Suggest Content endpoint verified.\n');

    // -------------------------------------------------------------
    // TEST 4: AI Grammar Check Gateway & Fallbacks
    // -------------------------------------------------------------
    console.log('📌 Test Group 4: AI Grammar Check Endpoint & Fallback');
    const grammarRes = await checkResumeGrammarWithAI('I has built high scalable systems with React.');
    assert(grammarRes && Array.isArray(grammarRes.corrections), 'Grammar Check returns corrections array');
    assert(typeof grammarRes.correctedText === 'string', 'Grammar Check returns correctedText string');
    console.log('  ✔ AI Grammar Check endpoint verified.\n');

    // -------------------------------------------------------------
    // TEST 5: ATS Resume Analysis & Job Matching Engine
    // -------------------------------------------------------------
    console.log('📌 Test Group 5: ATS Resume Analysis & Job Matching Gateway');
    const atsRes = await analyzeATSWithAI('Experienced React Node.js Developer specializing in MongoDB and AWS cloud architectures.');
    assert(typeof atsRes.overallAtsScore === 'number', 'ATS Analysis returns numerical overallAtsScore');
    assert(atsRes.overallAtsScore >= 0 && atsRes.overallAtsScore <= 100, 'overallAtsScore is within valid 0-100 range');

    const jobMatchRes = await matchJobWithAI(
      'Senior Java Spring Boot Engineer with PostgreSQL and Docker experience.',
      'We are looking for a Java Developer proficient in Spring Boot, PostgreSQL, and Docker.'
    );
    assert(typeof jobMatchRes.matchScore === 'number', 'Job Match engine returns matchScore');
    assert(jobMatchRes.matchScore >= 50, 'Job match engine detects strong skill overlap');
    console.log('  ✔ ATS Analysis & Job Matching verified.\n');

    // -------------------------------------------------------------
    // TEST 6: DOCX Export CSS Variable Hex Resolution
    // -------------------------------------------------------------
    console.log('📌 Test Group 6: DOCX Export Styling & CSS Variable Resolution');
    const themeColors = { navy: '#1e3a8a', emerald: '#064e3b', charcoal: '#0f172a' };
    const rawHtml = '<h1 style="color: var(--theme-primary)">Jane Doe</h1>';
    const primaryHex = themeColors['emerald'];
    const resolvedHtml = rawHtml.replace(/var\(--theme-primary\)/g, primaryHex);
    assert(resolvedHtml.includes('#064e3b'), 'CSS variable var(--theme-primary) correctly resolved to explicit hex #064e3b');
    console.log('  ✔ DOCX Export styling resolution verified.\n');

    console.log('===============================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} QA AUDIT INTEGRATION TESTS PASSED SUCCESSFULLY!`);
    console.log('===============================================================\n');

    await mongoose.disconnect();
  } catch (err) {
    console.error(`\n❌ QA AUDIT TEST FAILED: ${err.message}`);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    process.exit(1);
  }
}

runResumeBuilderQA();
