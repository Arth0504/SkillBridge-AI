import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Candidate } from '../models/candidate.model.js';
import { Application } from '../models/application.model.js';
import { cleanResumeUrl, cleanAvatarUrl } from '../utils/cleaners.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const cleanDatabase = async (uri, dbName) => {
  console.log(`\n=====================================================`);
  console.log(`Cleaning database: ${dbName} (${uri})`);
  console.log(`=====================================================`);

  const conn = await mongoose.createConnection(uri).asPromise();

  const CandidateModel = conn.model('Candidate', Candidate.schema);
  const ApplicationModel = conn.model('Application', Application.schema);

  // 1. Audit & Clean Candidate collection
  const candidates = await CandidateModel.find({});
  let cleanedCandidates = 0;

  for (const cand of candidates) {
    let modified = false;
    const origResume = cand.resumeUrl;
    const origAvatar = cand.avatarUrl;

    const cleanedResume = cleanResumeUrl(origResume);
    const cleanedAvatar = cleanAvatarUrl(origAvatar);

    if (origResume !== cleanedResume) {
      console.log(`Candidate [${cand.fullName} - ${cand._id}] resume cleaned: "${origResume}" -> "${cleanedResume}"`);
      cand.resumeUrl = cleanedResume;
      cand.resumePublicId = cleanedResume ? cand.resumePublicId : '';
      modified = true;
    }

    if (origAvatar !== cleanedAvatar) {
      console.log(`Candidate [${cand.fullName} - ${cand._id}] avatar cleaned: "${origAvatar}" -> "${cleanedAvatar}"`);
      cand.avatarUrl = cleanedAvatar;
      cand.avatarPublicId = cleanedAvatar ? cand.avatarPublicId : '';
      modified = true;
    }

    if (modified) {
      await cand.save();
      cleanedCandidates++;
    }
  }

  // 2. Audit & Clean Application collection
  const applications = await ApplicationModel.find({});
  let cleanedApps = 0;

  for (const app of applications) {
    let modified = false;
    const origResume = app.resumeUrl;
    const cleanedResume = cleanResumeUrl(origResume);

    if (origResume !== cleanedResume) {
      console.log(`Application [${app._id}] resume cleaned: "${origResume}" -> "${cleanedResume}"`);
      app.resumeUrl = cleanedResume;
      app.resumePublicId = cleanedResume ? app.resumePublicId : '';
      modified = true;
    }

    if (app.candidateSnapshot && app.candidateSnapshot.resumeUrl) {
      const origSnapResume = app.candidateSnapshot.resumeUrl;
      const cleanedSnapResume = cleanResumeUrl(origSnapResume);
      if (origSnapResume !== cleanedSnapResume) {
        console.log(`Application [${app._id}] snapshot resume cleaned: "${origSnapResume}" -> "${cleanedSnapResume}"`);
        app.candidateSnapshot.resumeUrl = cleanedSnapResume;
        modified = true;
      }
    }

    if (modified) {
      await app.save();
      cleanedApps++;
    }
  }

  console.log(`✅ ${dbName} Cleanup Complete! Cleaned ${cleanedCandidates} Candidates & ${cleanedApps} Applications.`);
  await conn.close();
};

const run = async () => {
  try {
    const mainUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';
    const testUri = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/skillbridge_test';

    await cleanDatabase(mainUri, 'skillbridge_ai');
    await cleanDatabase(testUri, 'skillbridge_test');

    console.log('\n🎉 ALL DATABASES CLEANED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration script failed:', err);
    process.exit(1);
  }
};

run();
