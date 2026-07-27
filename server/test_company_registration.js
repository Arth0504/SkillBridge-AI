import mongoose from 'mongoose';
import app from './app.js';
import { Company } from './models/company.model.js';
import dotenv from 'dotenv';

dotenv.config();

const runTest = async () => {
  console.log('--- TESTING END-TO-END COMPANY REGISTRATION FLOW ---');
  let server;
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_test';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const PORT = 5088;
    server = app.listen(PORT);
    const BASE_URL = `http://localhost:${PORT}`;

    const testEmail = `company_e2e_${Date.now()}@skillbridge.ai`;
    const companyPayload = {
      companyName: 'Aero Dynamics AI',
      email: testEmail,
      password: 'Password123!',
      website: 'https://aerodynamics.ai',
    };

    console.log('[1] Testing POST /api/v1/auth/company/register ...');
    const regRes = await fetch(`${BASE_URL}/api/v1/auth/company/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyPayload),
    });

    const regData = await regRes.json();
    console.log('Register Response Status:', regRes.status);
    console.log('Register Response Body:', JSON.stringify(regData, null, 2));

    if (regRes.status !== 201 || !regData.success) {
      throw new Error('Company registration API failed');
    }
    console.log('✅ Company registered successfully via API.');

    console.log('[2] Verifying Company record creation in MongoDB ...');
    const dbCompany = await Company.findOne({ email: testEmail });
    if (!dbCompany) {
      throw new Error('Company record not found in MongoDB database');
    }
    console.log(`✅ MongoDB Company Record Verified (ID: ${dbCompany._id}, Name: ${dbCompany.companyName})`);

    console.log('[3] Testing POST /api/v1/auth/company/login ...');
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/company/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'Password123!' }),
    });

    const loginData = await loginRes.json();
    console.log('Login Response Status:', loginRes.status);
    if (loginRes.status !== 200 || !loginData.data?.accessToken) {
      throw new Error('Company login immediately after registration failed');
    }
    console.log('✅ Company login succeeded immediately after registration.');

    // Clean up
    await Company.findByIdAndDelete(dbCompany._id);
    console.log('✅ Test company record cleaned up.');

    console.log('\n🎉 ALL COMPANY REGISTRATION E2E TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Company Registration Test Failure:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runTest();
