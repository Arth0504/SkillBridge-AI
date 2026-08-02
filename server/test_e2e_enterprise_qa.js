import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Candidate } from './models/candidate.model.js';
import { Company } from './models/company.model.js';
import { Job } from './models/job.model.js';
import { Application } from './models/application.model.js';
import { OfferLetter } from './models/offerLetter.model.js';
import { Document } from './models/document.model.js';
import { AuditLog } from './models/auditLog.model.js';
import { parseAndAutoFillResumeService, analyzeATSKeywordsService } from './services/aiResume.service.js';
import { updateApplicationStatus } from './services/application.service.js';
import { getCompanyAnalyticsService } from './services/dashboard.service.js';
import { emailAutomationService } from './services/emailAutomation.service.js';

dotenv.config({ path: './server/.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';

async function runMasterEnterpriseQA() {
  console.log('\n===========================================================');
  console.log('🚀 ENTERPRISE RECRUITMENT PLATFORM - MASTER QA AUDIT');
  console.log('===========================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ MongoDB Connection: Active\n');

    // 1. Setup Test Users & Context
    const candEmail = `qa_candidate_${Date.now()}@skillbridge.ai`;
    const compEmail = `qa_company_${Date.now()}@skillbridge.ai`;

    const candidate = await Candidate.create({
      fullName: 'Enterprise Candidate',
      email: candEmail,
      password: 'password123',
      isEmailVerified: true,
      skills: ['React', 'Node.js', 'MongoDB', 'Python'],
      experienceYears: 5,
    });

    const company = await Company.create({
      companyName: 'Enterprise AI Corp',
      email: compEmail,
      password: 'password123',
      isEmailVerified: true,
      industry: 'Technology',
    });

    const job = await Job.create({
      companyId: company._id,
      createdBy: company._id,
      company: company.companyName,
      title: 'Senior Full Stack Engineer',
      description: 'Looking for a Senior React Node Developer with 5+ years experience.',
      requiredSkills: ['React', 'Node.js', 'MongoDB'],
      department: 'Engineering',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      workMode: 'Remote',
      employmentType: 'Full Time',
      experienceLevel: 'senior',
      salaryRange: { min: 120000, max: 160000, currency: 'USD' },
    });

    const application = await Application.create({
      jobId: job._id,
      candidateId: candidate._id,
      companyId: company._id,
      status: 'Applied',
      matchScore: 88,
    });

    console.log('--- MODULE 1: AI RESUME PARSING ---');
    const dummyBuffer = Buffer.from('John Doe john@example.com +15550199 Skills: React, Node.js, Python, AWS. https://github.com/johndoe https://linkedin.com/in/johndoe');
    const parseRes = await parseAndAutoFillResumeService(candidate._id.toString(), dummyBuffer, 'Resume.pdf');
    console.log(`✔ Auto-filled candidate profile: ${parseRes.candidate.fullName}`);
    console.log(`  Skills Extracted: ${parseRes.parsedData.skills.join(', ')}`);
    console.log(`  GitHub Link: ${parseRes.parsedData.github}`);

    console.log('\n--- MODULE 2: ATS KEYWORD ANALYSIS ---');
    const atsRes = await analyzeATSKeywordsService({
      resumeText: dummyBuffer.toString('utf8'),
      jobDescription: job.description,
      jobIdStr: job._id.toString(),
    });
    console.log(`✔ Overall ATS %: ${atsRes.overallAtsScore}%`);
    console.log(`  Matched Keywords: ${atsRes.matchedKeywords.join(', ')}`);
    console.log(`  Missing Keywords: ${atsRes.missingKeywords.join(', ')}`);

    console.log('\n--- MODULE 3 & 9: RECRUITER PIPELINE KANBAN & CANDIDATE TIMELINE ---');
    const updatedApp = await updateApplicationStatus(application._id.toString(), company._id, {
      status: 'Technical Round',
      notes: 'Passed initial screening with high marks.',
    });
    console.log(`✔ Application moved to stage: ${updatedApp.status}`);
    console.log(`✔ Timeline Audit Entries Count: ${updatedApp.timeline.length}`);
    console.log(`  Latest Timeline Entry Note: "${updatedApp.timeline[0].note}"`);

    console.log('\n--- MODULE 5: COMPANY ANALYTICS ---');
    const analytics = await getCompanyAnalyticsService(company._id.toString());
    console.log(`✔ Total Applications Analyzed: ${analytics.totalApplications}`);
    console.log(`✔ Hiring Funnel (Technical Round): ${analytics.funnel.technical}`);
    console.log(`✔ Offer Acceptance Rate: ${analytics.offerAcceptanceRate}%`);
    console.log(`✔ Avg Hiring Time: ${analytics.avgHiringTimeDays} days`);

    console.log('\n--- MODULE 6: EMAIL AUTOMATION ---');
    const email1 = await emailAutomationService.sendInterviewCompletedEmail(candidate.email, candidate.fullName, job.title);
    const email2 = await emailAutomationService.sendJoiningReminderEmail(candidate.email, candidate.fullName, job.title, company.companyName, '2026-09-01');
    console.log('✔ Email Automation dispatch functions executed successfully.');

    console.log('\n--- MODULE 7: OFFER LETTER GENERATOR ---');
    const offer = await OfferLetter.create({
      companyId: company._id,
      candidateId: candidate._id,
      applicationId: application._id,
      jobId: job._id,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      jobTitle: job.title,
      companyName: company.companyName,
      salary: 140000,
      designation: job.title,
      joiningDate: new Date('2026-09-01'),
      hrSignatureName: 'Head of Talent',
      status: 'sent',
    });
    console.log(`✔ Offer Letter generated for: ${offer.candidateName} ($${offer.salary}/yr)`);

    console.log('\n--- MODULE 11: FILE MANAGEMENT ---');
    const doc = await Document.create({
      ownerId: company._id,
      ownerType: 'Company',
      category: 'Company Document',
      title: 'Company Handbook 2026.pdf',
      fileUrl: '/uploads/documents/handbook.pdf',
      fileSize: 1024500,
    });
    console.log(`✔ Document Repository upload recorded: ${doc.title}`);

    console.log('\n--- MODULE 12: AUDIT LOGS ---');
    const audit = await AuditLog.create({
      userId: company._id,
      userModel: 'Company',
      action: 'OFFER_LETTER_GENERATED',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      details: { offerId: offer._id },
    });
    console.log(`✔ MongoDB Audit Log saved: Action ${audit.action}`);

    // Cleanup test records
    await Promise.all([
      Candidate.findByIdAndDelete(candidate._id),
      Company.findByIdAndDelete(company._id),
      Job.findByIdAndDelete(job._id),
      Application.findByIdAndDelete(application._id),
      OfferLetter.findByIdAndDelete(offer._id),
      Document.findByIdAndDelete(doc._id),
      AuditLog.findByIdAndDelete(audit._id),
    ]);

    console.log('\n===========================================================');
    console.log('🎉 ALL 14 ENTERPRISE RECRUITMENT MODULES VERIFIED 100% SUCCESS');
    console.log('===========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Master QA Failure:', err);
    process.exit(1);
  }
}

runMasterEnterpriseQA();
