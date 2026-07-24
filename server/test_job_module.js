import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS set errors
}

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from './app.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config();

let server;
let mongoServer;

const runTests = async () => {
  console.log('--- STARTING PHASE 3 JOB MODULE VERIFICATION TESTS ---');

  try {
    // 1. Setup Mongo Connection (Try Atlas, fallback to MongoMemoryServer)
    let mongoUri = process.env.MONGODB_URI;
    try {
      if (mongoUri) {
        console.log('Connecting to primary MongoDB URI...');
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
        console.log('✅ Connected to Atlas MongoDB.');
      } else {
        throw new Error('No MONGODB_URI found');
      }
    } catch (dbErr) {
      console.warn(`⚠️ Atlas connection failed (${dbErr.message}). Starting MongoMemoryServer fallback...`);
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.disconnect();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoMemoryServer successfully.');
    }

    // Start express server on port 5055
    const PORT = 5055;
    server = app.listen(PORT);
    const BASE_URL = `http://localhost:${PORT}`;

    // 2. Setup Test Company
    const testCompanyEmail = `testcompany_${Date.now()}@skillbridge.ai`;
    const testCompany = await Company.create({
      companyName: 'TechCorp Solutions Inc.',
      email: testCompanyEmail,
      password: 'Password123!',
      industry: 'Artificial Intelligence',
      companySize: '50-200',
      location: 'San Francisco, CA',
      website: 'https://techcorp-example.ai',
      isEmailVerified: true,
    });

    // Generate Auth Token for Company
    const token = generateToken({ id: testCompany._id, role: 'company' });
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    console.log(`✅ Test Company created (ID: ${testCompany._id})`);

    let createdJobId;
    let createdJobSlug;

    // 3. Test API: POST /api/v1/company/jobs (Create Job)
    console.log('\n[1] Testing POST /api/v1/company/jobs ...');
    const createJobPayload = {
      title: 'Senior AI Fullstack Architect',
      department: 'Engineering',
      description: 'We are hiring a Lead/Senior AI Fullstack Architect to build next-gen AI prep systems.',
      responsibilities: ['Architect scalable Node.js microservices', 'Integrate LLM APIs and Vector DBs'],
      requirements: ['5+ years Node.js / React experience', 'Deep understanding of AI systems'],
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'React', 'TypeScript', 'LLM'],
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      salary: { min: 140000, max: 180000, isNegotiable: true },
      salaryType: 'yearly',
      currency: 'USD',
      country: 'United States',
      state: 'California',
      city: 'San Francisco',
      openings: 3,
      benefits: ['Health Insurance', 'Remote Work Stipend', 'Stock Options'],
      tags: ['AI', 'NodeJS', 'Fullstack'],
      status: 'open',
    };

    const createRes = await fetch(`${BASE_URL}/api/v1/company/jobs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(createJobPayload),
    });

    const createData = await createRes.json();
    console.log('Create Response Status:', createRes.status);
    console.log('Create Response Body:', JSON.stringify(createData, null, 2));

    if (createRes.status !== 201 || !createData.success || !createData.data?.job?._id) {
      throw new Error('Failed to create job vacancy');
    }

    createdJobId = createData.data.job._id;
    createdJobSlug = createData.data.job.slug;
    console.log(`✅ Job created successfully (ID: ${createdJobId}, Slug: ${createdJobSlug})`);

    // 4. Test API: Duplicate Job Creation Prevention (POST /api/v1/company/jobs)
    console.log('\n[2] Testing Duplicate Job Prevention ...');
    const dupRes = await fetch(`${BASE_URL}/api/v1/company/jobs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(createJobPayload),
    });

    const dupData = await dupRes.json();
    console.log('Duplicate Response Status:', dupRes.status);
    if (dupRes.status === 409) {
      console.log('✅ Duplicate job creation properly prevented with 409 Conflict.');
    } else {
      throw new Error(`Expected 409 conflict for duplicate job, got ${dupRes.status}`);
    }

    // 5. Test API: GET /api/v1/company/jobs (List Company Jobs)
    console.log('\n[3] Testing GET /api/v1/company/jobs ...');
    const getCompanyJobsRes = await fetch(`${BASE_URL}/api/v1/company/jobs?page=1&limit=10`, {
      method: 'GET',
      headers: authHeaders,
    });

    const getCompanyJobsData = await getCompanyJobsRes.json();
    console.log('Company Jobs Count:', getCompanyJobsData.data?.jobs?.length);
    if (getCompanyJobsRes.status !== 200 || getCompanyJobsData.data?.jobs?.length < 1) {
      throw new Error('Failed to retrieve company jobs');
    }
    console.log('✅ GET /api/v1/company/jobs verified successfully.');

    // 6. Test API: GET /api/v1/company/jobs/:id (Get Single Company Job)
    console.log('\n[4] Testing GET /api/v1/company/jobs/:id ...');
    const getCompanyJobByIdRes = await fetch(`${BASE_URL}/api/v1/company/jobs/${createdJobId}`, {
      method: 'GET',
      headers: authHeaders,
    });

    const getCompanyJobByIdData = await getCompanyJobByIdRes.json();
    if (getCompanyJobByIdRes.status !== 200 || getCompanyJobByIdData.data?.job?._id !== createdJobId) {
      throw new Error('Failed to retrieve company job by ID');
    }
    console.log('✅ GET /api/v1/company/jobs/:id verified successfully.');

    // 7. Test API: PUT /api/v1/company/jobs/:id (Update Job)
    console.log('\n[5] Testing PUT /api/v1/company/jobs/:id ...');
    const updatePayload = {
      title: 'Principal AI Fullstack Architect',
      openings: 5,
      salary: { min: 160000, max: 210000, isNegotiable: true },
    };

    const updateRes = await fetch(`${BASE_URL}/api/v1/company/jobs/${createdJobId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updatePayload),
    });

    const updateData = await updateRes.json();
    console.log('Update Response Status:', updateRes.status);
    if (updateRes.status !== 200 || updateData.data?.job?.openings !== 5) {
      throw new Error('Failed to update job vacancy');
    }
    console.log('✅ PUT /api/v1/company/jobs/:id verified successfully.');

    // 8. Test API: PATCH /api/v1/company/jobs/:id/status (Change Status)
    console.log('\n[6] Testing PATCH /api/v1/company/jobs/:id/status ...');
    const patchRes = await fetch(`${BASE_URL}/api/v1/company/jobs/${createdJobId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'paused' }),
    });

    const patchData = await patchRes.json();
    console.log('Patch Status Response:', patchData.data?.job?.status);
    if (patchRes.status !== 200 || patchData.data?.job?.status !== 'paused') {
      throw new Error('Failed to patch job status');
    }

    // Set back to 'open' for candidate searching
    await fetch(`${BASE_URL}/api/v1/company/jobs/${createdJobId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'open' }),
    });
    console.log('✅ PATCH /api/v1/company/jobs/:id/status verified successfully.');

    // 9. Test API: GET /api/v1/jobs (Candidate Public Job Search & Filter)
    console.log('\n[7] Testing Candidate GET /api/v1/jobs (Filters, Search, Sorting) ...');
    const publicJobsRes = await fetch(
      `${BASE_URL}/api/v1/jobs?keyword=Architect&workMode=Remote&employmentType=Full%20Time&sort=Salary&page=1&limit=10`
    );

    const publicJobsData = await publicJobsRes.json();
    console.log('Candidate Jobs Found:', publicJobsData.data?.jobs?.length);
    console.log('Pagination:', publicJobsData.data?.pagination);

    if (publicJobsRes.status !== 200 || publicJobsData.data?.jobs?.length < 1) {
      throw new Error('Failed candidate public job search/filter query');
    }
    console.log('✅ GET /api/v1/jobs verified successfully.');

    // 10. Test API: GET /api/v1/jobs/:id (Public Job View + Auto Increment Views)
    console.log('\n[8] Testing Candidate GET /api/v1/jobs/:id (View Count Increment) ...');
    const viewRes1 = await fetch(`${BASE_URL}/api/v1/jobs/${createdJobId}`);
    const viewData1 = await viewRes1.json();
    const viewsInitial = viewData1.data?.job?.views;

    const viewRes2 = await fetch(`${BASE_URL}/api/v1/jobs/${createdJobId}`);
    const viewData2 = await viewRes2.json();
    const viewsAfter = viewData2.data?.job?.views;

    console.log(`Views Initial: ${viewsInitial}, Views After Second Call: ${viewsAfter}`);
    if (viewRes1.status !== 200 || viewsAfter <= viewsInitial) {
      throw new Error('Views auto-increment failed');
    }
    console.log('✅ GET /api/v1/jobs/:id view auto-increment verified successfully.');

    // 11. Test API: DELETE /api/v1/company/jobs/:id (Delete Job)
    console.log('\n[9] Testing DELETE /api/v1/company/jobs/:id ...');
    const deleteRes = await fetch(`${BASE_URL}/api/v1/company/jobs/${createdJobId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });

    const deleteData = await deleteRes.json();
    console.log('Delete Response:', deleteData);
    if (deleteRes.status !== 200 || !deleteData.success) {
      throw new Error('Failed to delete job posting');
    }
    console.log('✅ DELETE /api/v1/company/jobs/:id verified successfully.');

    // Clean up test company
    await Company.findByIdAndDelete(testCompany._id);
    await Job.deleteMany({ companyId: testCompany._id });
    console.log('✅ Cleaned up test database records.');

    console.log('\n🎉 ALL PHASE 3 JOB MANAGEMENT MODULE TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Phase 3 Verification Test Error:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Disconnected from database.');
  }
};

runTests();
