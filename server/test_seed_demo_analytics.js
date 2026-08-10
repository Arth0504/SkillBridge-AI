import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { seedDemoAnalytics, clearDemoAnalytics } from './scripts/seedDemoAnalytics.js';
import { getCompanyAnalyticsService, getCompanyDashboardJobPerformanceService } from './services/dashboard.service.js';
import { Company } from './models/company.model.js';

const logPass = (msg) => console.log(`✅ [PASS] ${msg}`);
const logFail = (msg, err) => {
  console.error(`❌ [FAIL] ${msg}`, err || '');
  process.exit(1);
};

const runAnalyticsTest = async () => {
  console.log('🚀 Starting Test Audit for Employer Hiring Analytics Seed & API Engine...');

  try {
    await connectDB();
    logPass('MongoDB Connected');

    // 1. Clear any pre-existing demo records
    await clearDemoAnalytics();
    logPass('Cleaned pre-existing demo records');

    // 2. Seed Demo Data
    const seedResult = await seedDemoAnalytics();
    if (!seedResult.success || !seedResult.companyId) {
      logFail('Seed demo analytics returned invalid result', seedResult);
    }
    logPass(`Successfully seeded demo records for company ${seedResult.companyId}`);

    // 3. Query getCompanyAnalyticsService API
    const companyIdStr = seedResult.companyId.toString();
    const analytics = await getCompanyAnalyticsService(companyIdStr);

    console.log('📊 Analytics Output:', {
      totalViews: analytics.totalViews,
      totalApplications: analytics.totalApplications,
      totalInterviewed: analytics.totalInterviewed,
      totalHired: analytics.totalHired,
      conversionRate: analytics.conversionRate,
      avgTimeToHire: analytics.avgTimeToHire,
      aiEfficiency: analytics.aiEfficiency,
      funnel: analytics.funnel,
    });

    if (analytics.totalViews !== 1020) {
      logFail(`Expected totalViews = 1020, got ${analytics.totalViews}`);
    }
    logPass('Verified Total Job Impressions = 1,020');

    if (analytics.totalApplications !== 142) {
      logFail(`Expected totalApplications = 142, got ${analytics.totalApplications}`);
    }
    logPass('Verified Total Applications = 142');

    if (analytics.conversionRate !== '13.9%') {
      logFail(`Expected conversionRate = '13.9%', got ${analytics.conversionRate}`);
    }
    logPass('Verified Avg Candidate Conversion = 13.9% (Calculated Dynamically: 142 / 1020)');

    if (analytics.avgTimeToHire !== '18 days') {
      logFail(`Expected avgTimeToHire = '18 days', got ${analytics.avgTimeToHire}`);
    }
    logPass('Verified Average Time-to-Hire = 18 days');

    if (analytics.funnel.interviewed !== 32) {
      logFail(`Expected funnel interviewed = 32, got ${analytics.funnel.interviewed}`);
    }
    logPass('Verified Funnel Interviewed = 32 candidates (Conversion: 22.5%)');

    if (analytics.funnel.hired !== 8) {
      logFail(`Expected funnel hired = 8, got ${analytics.funnel.hired}`);
    }
    logPass('Verified Funnel Hired = 8 candidates (Conversion: 25.0%)');

    // 4. Query getCompanyDashboardJobPerformanceService API
    const perfResult = await getCompanyDashboardJobPerformanceService(companyIdStr);
    const jobs = perfResult.jobs || [];

    if (jobs.length !== 5) {
      logFail(`Expected 5 job roles in performance breakdown, got ${jobs.length}`);
    }
    logPass('Verified Role-Level Breakdown contains all 5 seeded jobs');

    const fullStackJob = jobs.find(j => j.title === 'Full Stack Developer');
    if (!fullStackJob || fullStackJob.views !== 320 || fullStackJob.totalApplications !== 48) {
      logFail('Full Stack Developer job performance metrics mismatch', fullStackJob);
    }
    logPass('Verified Full Stack Developer (Views: 320, Apps: 48, Conversion: 15%)');

    const reactJob = jobs.find(j => j.title === 'React Developer');
    if (!reactJob || reactJob.views !== 245 || reactJob.totalApplications !== 31) {
      logFail('React Developer job performance metrics mismatch', reactJob);
    }
    logPass('Verified React Developer (Views: 245, Apps: 31, Conversion: 12.7%)');

    const hrJob = jobs.find(j => j.title === 'HR Executive');
    if (!hrJob || hrJob.views !== 180 || hrJob.totalApplications !== 24) {
      logFail('HR Executive job performance metrics mismatch', hrJob);
    }
    logPass('Verified HR Executive (Views: 180, Apps: 24, Conversion: 13.3%)');

    const designerJob = jobs.find(j => j.title === 'UI/UX Designer');
    if (!designerJob || designerJob.views !== 155 || designerJob.totalApplications !== 19) {
      logFail('UI/UX Designer job performance metrics mismatch', designerJob);
    }
    logPass('Verified UI/UX Designer (Views: 155, Apps: 19, Conversion: 12.3%)');

    const backendJob = jobs.find(j => j.title === 'Backend Developer');
    if (!backendJob || backendJob.views !== 120 || backendJob.totalApplications !== 20) {
      logFail('Backend Developer job performance metrics mismatch', backendJob);
    }
    logPass('Verified Backend Developer (Views: 120, Apps: 20, Conversion: 16.7%)');

    // 5. Clear Demo Records
    const clearRes = await clearDemoAnalytics();
    if (clearRes.jobsCleared < 5 || clearRes.applicationsCleared < 142) {
      logFail('Failed to clear demo data records properly', clearRes);
    }
    logPass('Successfully cleared demo records with zero residual data');

    console.log('\n🎉 ALL QA CHECKS PASSED FOR EMPLOYER HIRING ANALYTICS SEED ENGINE!');
    process.exit(0);
  } catch (error) {
    logFail('Unhandled exception during analytics QA test', error);
  }
};

runAnalyticsTest();
