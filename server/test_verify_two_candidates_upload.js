import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application } from './models/application.model.js';
import { uploadToCloudinary } from './services/upload.service.js';
import { submitApplication, getCompanyApplications } from './services/application.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const runVerification = async () => {
  console.log('\n=====================================================');
  console.log('STARTING TWO-CANDIDATE UPLOAD & RETRIEVAL VERIFICATION');
  console.log('=====================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);

  const timeSuffix = Date.now();

  // 1. Create Employer Company & Job
  const company = await Company.create({
    companyName: `Acme Corp ${timeSuffix}`,
    email: `recruiter_${timeSuffix}@acme.com`,
    password: 'Password123!',
    isEmailVerified: true,
  });

  const job = await Job.create({
    title: 'Senior AI System Architect',
    department: 'Engineering',
    company: company.companyName,
    companyId: company._id,
    description: 'Lead AI infrastructure engineering team.',
    requiredSkills: ['Node.js', 'Python', 'MongoDB'],
    workMode: 'Remote',
    employmentType: 'Full Time',
    experienceLevel: 'senior',
    status: 'open',
    createdBy: company._id,
  });

  // 2. Candidate A: Register & Upload Resume_A.pdf
  const pdfBufferA = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Title (Candidate A Resume Content - ${timeSuffix}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`);
  const uploadResultA = await uploadToCloudinary(pdfBufferA, 'skillbridge/resumes', 'raw');

  const candidateA = await Candidate.create({
    fullName: 'Candidate Alpha',
    email: `alpha_${timeSuffix}@candidate.com`,
    password: 'Password123!',
    isEmailVerified: true,
    profileCompleted: true,
    resumeUrl: uploadResultA.url,
    resumePublicId: uploadResultA.publicId,
  });

  // 3. Candidate B: Register & Upload Resume_B.pdf
  const pdfBufferB = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Title (Candidate B Resume Content - ${timeSuffix}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`);
  const uploadResultB = await uploadToCloudinary(pdfBufferB, 'skillbridge/resumes', 'raw');

  const candidateB = await Candidate.create({
    fullName: 'Candidate Beta',
    email: `beta_${timeSuffix}@candidate.com`,
    password: 'Password123!',
    isEmailVerified: true,
    profileCompleted: true,
    resumeUrl: uploadResultB.url,
    resumePublicId: uploadResultB.publicId,
  });

  // 4. Candidate A and Candidate B apply for Job
  const appAData = await submitApplication({
    candidateId: candidateA._id,
    jobId: job._id,
    coverLetter: 'Application from Candidate Alpha',
  });

  const appBData = await submitApplication({
    candidateId: candidateB._id,
    jobId: job._id,
    coverLetter: 'Application from Candidate Beta',
  });

  // 5. Query MongoDB documents directly
  const docCandA = await Candidate.findById(candidateA._id).lean();
  const docCandB = await Candidate.findById(candidateB._id).lean();

  const appIdA = appAData._id || appAData.application?._id;
  const appIdB = appBData._id || appBData.application?._id;

  const docAppA = await Application.findById(appIdA).lean();
  const docAppB = await Application.findById(appIdB).lean();

  // 6. Retrieve via Company Applications API
  const companyAppsResult = await getCompanyApplications(company._id, { jobId: job._id });
  const companyApps = companyAppsResult.applications;

  const getCandId = (app) => {
    if (!app) return '';
    if (app.candidate && app.candidate._id) return app.candidate._id.toString();
    if (app.candidateId) {
      return typeof app.candidateId === 'object' ? (app.candidateId._id ? app.candidateId._id.toString() : app.candidateId.toString()) : app.candidateId.toString();
    }
    return '';
  };

  const retrievedAppA = companyApps.find((app) => getCandId(app) === candidateA._id.toString());
  const retrievedAppB = companyApps.find((app) => getCandId(app) === candidateB._id.toString());

  console.log('\n--- MONGODB DOCUMENT INSPECTION FOR CANDIDATE A ---');
  console.log(`Candidate A ID:       ${docCandA._id}`);
  console.log(`Candidate A Name:     ${docCandA.fullName}`);
  console.log(`Candidate A resumeUrl:      ${docCandA.resumeUrl}`);
  console.log(`Candidate A resumePublicId: ${docCandA.resumePublicId}`);
  console.log(`Application A resumeUrl:    ${docAppA.resumeUrl}`);
  console.log(`Company App A resumeUrl:    ${retrievedAppA.resumeUrl}`);

  console.log('\n--- MONGODB DOCUMENT INSPECTION FOR CANDIDATE B ---');
  console.log(`Candidate B ID:       ${docCandB._id}`);
  console.log(`Candidate B Name:     ${docCandB.fullName}`);
  console.log(`Candidate B resumeUrl:      ${docCandB.resumeUrl}`);
  console.log(`Candidate B resumePublicId: ${docCandB.resumePublicId}`);
  console.log(`Application B resumeUrl:    ${docAppB.resumeUrl}`);
  console.log(`Company App B resumeUrl:    ${retrievedAppB.resumeUrl}`);

  // 7. Strict Assertion Checks
  console.log('\n--- VERIFICATION CHECKS ---');
  if (!docCandA.resumeUrl || docCandA.resumeUrl.includes('cloudinary.com/demo') || docCandA.resumeUrl.includes('sample.pdf')) {
    throw new Error('VERIFICATION FAILED: Candidate A resumeUrl is empty or sample!');
  }
  console.log('✅ Check 1 PASSED: Candidate A has valid unique upload resumeUrl.');

  if (!docCandB.resumeUrl || docCandB.resumeUrl.includes('cloudinary.com/demo') || docCandB.resumeUrl.includes('sample.pdf')) {
    throw new Error('VERIFICATION FAILED: Candidate B resumeUrl is empty or sample!');
  }
  console.log('✅ Check 2 PASSED: Candidate B has valid unique upload resumeUrl.');

  if (docCandA.resumeUrl === docCandB.resumeUrl) {
    throw new Error('VERIFICATION FAILED: Candidate A and Candidate B have identical resumeUrls!');
  }
  console.log('✅ Check 3 PASSED: Candidate A and Candidate B resumeUrls are DISTINCT and DIFFERENT.');

  if (retrievedAppA.resumeUrl !== docCandA.resumeUrl) {
    throw new Error('VERIFICATION FAILED: Company App A resumeUrl does not match Candidate A upload!');
  }
  console.log('✅ Check 4 PASSED: Company View for Candidate A opens Candidate A uploaded resumeUrl.');

  if (retrievedAppB.resumeUrl !== docCandB.resumeUrl) {
    throw new Error('VERIFICATION FAILED: Company App B resumeUrl does not match Candidate B upload!');
  }
  console.log('✅ Check 5 PASSED: Company View for Candidate B opens Candidate B uploaded resumeUrl.');

  // Cleanup test documents
  await Promise.all([
    Candidate.deleteMany({ _id: { $in: [candidateA._id, candidateB._id] } }),
    Company.deleteOne({ _id: company._id }),
    Job.deleteOne({ _id: job._id }),
    Application.deleteMany({ _id: { $in: [appIdA, appIdB] } }),
  ]);

  console.log('\n=====================================================');
  console.log('🎉 ALL TWO-CANDIDATE UPLOAD & RETRIEVAL CHECKS PASSED PERFECTLY!');
  console.log('=====================================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

runVerification().catch((err) => {
  console.error('❌ Verification Error:', err);
  process.exit(1);
});
