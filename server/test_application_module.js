import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application, APPLICATION_STATUS } from './models/application.model.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config();

let server;

const runTests = async () => {
  console.log('--- STARTING PHASE 4 APPLICATION MANAGEMENT MODULE TESTS ---');

  try {
    // 1. Connect to Local MongoDB for instant reliable testing
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/skillbridge_test';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');

    // Start express server on port 5056
    const PORT = 5056;
    server = app.listen(PORT);
    const BASE_URL = `http://localhost:${PORT}`;

    // 2. Setup Test Data (Candidate & Company)
    const timeSuffix = Date.now();
    
    // Test Candidate
    const candidateEmail = `candidate_${timeSuffix}@skillbridge.ai`;
    const testCandidate = await Candidate.create({
      fullName: 'Alex Mercer',
      email: candidateEmail,
      password: 'Password123!',
      isEmailVerified: true,
      profileCompleted: true,
      headline: 'Senior Full Stack AI Developer',
      skills: ['Node.js', 'React', 'MongoDB', 'Python'],
      experienceYears: 5,
      resumeUrl: 'https://cloudinary.com/resumes/alex_mercer_resume.pdf',
      resumePublicId: 'resumes/alex_mercer_resume',
    });
    const candidateToken = generateToken({ id: testCandidate._id, role: 'candidate' });
    const candidateAuthHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`,
    };

    // Test Company
    const companyEmail = `company_${timeSuffix}@skillbridge.ai`;
    const testCompany = await Company.create({
      companyName: 'Apex Innovations',
      email: companyEmail,
      password: 'Password123!',
      industry: 'Software & AI',
      companySize: '51-200',
      location: 'New York, NY',
      isEmailVerified: true,
    });
    const companyToken = generateToken({ id: testCompany._id, role: 'company' });
    const companyAuthHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`,
    };

    // Test Open Job
    const testJob = await Job.create({
      title: 'Senior Fullstack Engineer',
      department: 'Engineering',
      company: testCompany.companyName,
      companyId: testCompany._id,
      description: 'Join Apex Innovations to build scalable web platforms.',
      requiredSkills: ['Node.js', 'React', 'MongoDB'],
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      status: 'open',
      createdBy: testCompany._id,
    });

    console.log(`✅ Test Environment Setup Complete.`);
    console.log(`Candidate ID: ${testCandidate._id}, Company ID: ${testCompany._id}, Job ID: ${testJob._id}`);

    let createdApplicationId;

    // 3. Test API: POST /api/v1/jobs/:jobId/apply (Submit Application)
    console.log('\n[1] Testing POST /api/v1/jobs/:jobId/apply ...');
    const applyPayload = {
      coverLetter: 'I am excited to apply for the Senior Fullstack Engineer position at Apex Innovations.',
    };

    const applyRes = await fetch(`${BASE_URL}/api/v1/jobs/${testJob._id}/apply`, {
      method: 'POST',
      headers: candidateAuthHeaders,
      body: JSON.stringify(applyPayload),
    });

    const applyData = await applyRes.json();
    console.log('Apply Response Status:', applyRes.status);
    console.log('Apply Response Body:', JSON.stringify(applyData, null, 2));

    if (applyRes.status !== 201 || !applyData.success || !applyData.data?.application?._id) {
      throw new Error('Failed to submit job application');
    }

    createdApplicationId = applyData.data.application._id;
    console.log(`✅ Job application submitted successfully (ID: ${createdApplicationId})`);

    // 4. Test API: Duplicate Application Prevention
    console.log('\n[2] Testing Duplicate Application Prevention ...');
    const dupApplyRes = await fetch(`${BASE_URL}/api/v1/jobs/${testJob._id}/apply`, {
      method: 'POST',
      headers: candidateAuthHeaders,
      body: JSON.stringify(applyPayload),
    });

    const dupApplyData = await dupApplyRes.json();
    console.log('Duplicate Apply Status:', dupApplyRes.status);
    if (dupApplyRes.status === 409) {
      console.log('✅ Duplicate application correctly prevented with 409 Conflict.');
    } else {
      throw new Error(`Expected 409 Conflict for duplicate application, got ${dupApplyRes.status}`);
    }

    // 5. Test API: GET /api/v1/candidate/applications (Candidate Applications List)
    console.log('\n[3] Testing GET /api/v1/candidate/applications ...');
    const getCandAppsRes = await fetch(`${BASE_URL}/api/v1/candidate/applications`, {
      method: 'GET',
      headers: candidateAuthHeaders,
    });

    const getCandAppsData = await getCandAppsRes.json();
    console.log('Candidate Applications Count:', getCandAppsData.data?.applications?.length);
    if (getCandAppsRes.status !== 200 || getCandAppsData.data?.applications?.length < 1) {
      throw new Error('Failed to retrieve candidate applications');
    }
    console.log('✅ Candidate applications retrieved successfully.');

    // 6. Test API: GET /api/v1/company/applications (Company Applications List)
    console.log('\n[4] Testing GET /api/v1/company/applications ...');
    const getCompAppsRes = await fetch(`${BASE_URL}/api/v1/company/applications`, {
      method: 'GET',
      headers: companyAuthHeaders,
    });

    const getCompAppsData = await getCompAppsRes.json();
    console.log('Company Applications Count:', getCompAppsData.data?.applications?.length);
    if (getCompAppsRes.status !== 200 || getCompAppsData.data?.applications?.length < 1) {
      throw new Error('Failed to retrieve company applications');
    }
    console.log('✅ Company applications retrieved successfully.');

    // 7. Test API: GET /api/v1/company/jobs/:jobId/applications (Company Job Specific Applications)
    console.log('\n[5] Testing GET /api/v1/company/jobs/:jobId/applications ...');
    const getJobAppsRes = await fetch(`${BASE_URL}/api/v1/company/jobs/${testJob._id}/applications`, {
      method: 'GET',
      headers: companyAuthHeaders,
    });

    const getJobAppsData = await getJobAppsRes.json();
    if (getJobAppsRes.status !== 200 || getJobAppsData.data?.applications?.length !== 1) {
      throw new Error('Failed to retrieve applications for specific job');
    }
    console.log('✅ Company job specific applications retrieved successfully.');

    // 8. Test API: PATCH /api/v1/company/applications/:id/status (Schedule Interview)
    console.log('\n[6] Testing PATCH /api/v1/company/applications/:id/status ...');
    const interviewDate = new Date(Date.now() + 86400000 * 3).toISOString(); // 3 days from now
    const patchStatusRes = await fetch(`${BASE_URL}/api/v1/company/applications/${createdApplicationId}/status`, {
      method: 'PATCH',
      headers: companyAuthHeaders,
      body: JSON.stringify({
        status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
        interviewDate,
        notes: 'Candidate passed initial resume screening.',
      }),
    });

    const patchStatusData = await patchStatusRes.json();
    console.log('Patch Status Response:', patchStatusData.data?.application?.status);
    if (patchStatusRes.status !== 200 || patchStatusData.data?.application?.status !== APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
      throw new Error('Failed to update application status to Interview Scheduled');
    }
    console.log('✅ Application status updated to Interview Scheduled successfully.');

    // 9. Test API: PATCH /api/v1/company/applications/:id/rating (Rate Candidate)
    console.log('\n[7] Testing PATCH /api/v1/company/applications/:id/rating ...');
    const ratingRes = await fetch(`${BASE_URL}/api/v1/company/applications/${createdApplicationId}/rating`, {
      method: 'PATCH',
      headers: companyAuthHeaders,
      body: JSON.stringify({ rating: 5 }),
    });

    const ratingData = await ratingRes.json();
    if (ratingRes.status !== 200 || ratingData.data?.application?.rating !== 5) {
      throw new Error('Failed to update candidate rating');
    }
    console.log('✅ Candidate rating updated to 5 successfully.');

    // 10. Test API: PATCH /api/v1/company/applications/:id/feedback (Add Feedback)
    console.log('\n[8] Testing PATCH /api/v1/company/applications/:id/feedback ...');
    const feedbackText = 'Outstanding candidate with strong technical background in Node.js and MongoDB.';
    const feedbackRes = await fetch(`${BASE_URL}/api/v1/company/applications/${createdApplicationId}/feedback`, {
      method: 'PATCH',
      headers: companyAuthHeaders,
      body: JSON.stringify({ feedback: feedbackText }),
    });

    const feedbackData = await feedbackRes.json();
    if (feedbackRes.status !== 200 || feedbackData.data?.application?.feedback !== feedbackText) {
      throw new Error('Failed to update candidate feedback');
    }
    console.log('✅ Candidate feedback added successfully.');

    // 11. Test Feedback Visibility Rule for Candidate
    console.log('\n[9] Testing Candidate Feedback Visibility Rule ...');
    
    // Case A: Status is 'Interview Scheduled' -> Feedback should be REDACTED ('') for candidate
    const candViewRes1 = await fetch(`${BASE_URL}/api/v1/candidate/applications/${createdApplicationId}`, {
      method: 'GET',
      headers: candidateAuthHeaders,
    });
    const candViewData1 = await candViewRes1.json();
    console.log('Candidate View Feedback (Status: Interview Scheduled):', `"${candViewData1.data?.application?.feedback}"`);
    if (candViewData1.data?.application?.feedback !== '') {
      throw new Error('Feedback was revealed to candidate before interview completion!');
    }
    console.log('✅ Unreleased feedback correctly hidden from candidate.');

    // Case B: Update status to 'Interview Completed' -> Feedback should be REVEALED
    await fetch(`${BASE_URL}/api/v1/company/applications/${createdApplicationId}/status`, {
      method: 'PATCH',
      headers: companyAuthHeaders,
      body: JSON.stringify({ status: APPLICATION_STATUS.INTERVIEW_COMPLETED }),
    });

    const candViewRes2 = await fetch(`${BASE_URL}/api/v1/candidate/applications/${createdApplicationId}`, {
      method: 'GET',
      headers: candidateAuthHeaders,
    });
    const candViewData2 = await candViewRes2.json();
    console.log('Candidate View Feedback (Status: Interview Completed):', `"${candViewData2.data?.application?.feedback}"`);
    if (candViewData2.data?.application?.feedback !== feedbackText) {
      throw new Error('Feedback was not revealed to candidate after interview completion!');
    }
    console.log('✅ Released feedback successfully visible to candidate after interview completion.');

    // 12. Test API: PATCH /api/v1/candidate/applications/:id/withdraw (Withdraw Application)
    console.log('\n[10] Testing PATCH /api/v1/candidate/applications/:id/withdraw ...');
    const withdrawRes = await fetch(`${BASE_URL}/api/v1/candidate/applications/${createdApplicationId}/withdraw`, {
      method: 'PATCH',
      headers: candidateAuthHeaders,
    });

    const withdrawData = await withdrawRes.json();
    console.log('Withdraw Status:', withdrawData.data?.application?.status);
    if (withdrawRes.status !== 200 || withdrawData.data?.application?.status !== APPLICATION_STATUS.WITHDRAWN) {
      throw new Error('Failed to withdraw application');
    }
    console.log('✅ Application withdrawn successfully.');

    // 13. Verify Statistics Counters in DB
    console.log('\n[11] Verifying Database Counters ...');
    const updatedJob = await Job.findById(testJob._id);
    const updatedCandidate = await Candidate.findById(testCandidate._id);

    console.log(`Job totalApplications: ${updatedJob.totalApplications}`);
    console.log(`Candidate totalApplications: ${updatedCandidate.totalApplications}`);

    if (updatedJob.totalApplications !== 1 || updatedCandidate.totalApplications !== 1) {
      throw new Error('Database application counters were not incremented properly');
    }
    console.log('✅ Database application counters verified successfully.');

    // 14. Clean up test documents
    await Application.deleteMany({ candidateId: testCandidate._id });
    await Job.findByIdAndDelete(testJob._id);
    await Candidate.findByIdAndDelete(testCandidate._id);
    await Company.findByIdAndDelete(testCompany._id);
    console.log('✅ Cleaned up test database records.');

    console.log('\n🎉 ALL PHASE 4 APPLICATION MANAGEMENT MODULE TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Phase 4 Verification Test Error:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

runTests();
