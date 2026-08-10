import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Interview } from '../models/interview.model.js';
import { InterviewRoom } from '../models/interviewRoom.model.js';

export const clearDemoAnalytics = async () => {
  console.log('🧹 Clearing all demo analytics data (isDemo: true)...');

  const [jobsDel, appsDel, candDel, ivDel, roomDel, compDel] = await Promise.all([
    Job.deleteMany({ isDemo: true }),
    Application.deleteMany({ isDemo: true }),
    Candidate.deleteMany({ isDemo: true }),
    Interview.deleteMany({ isDemo: true }),
    InterviewRoom.deleteMany({ isDemo: true }),
    Company.deleteMany({ isDemo: true }),
  ]);

  console.log(`✅ Cleared Demo Data:
  - Jobs: ${jobsDel.deletedCount}
  - Applications: ${appsDel.deletedCount}
  - Candidates: ${candDel.deletedCount}
  - Interviews: ${ivDel.deletedCount}
  - Interview Rooms: ${roomDel.deletedCount}
  - Companies: ${compDel.deletedCount}`);
  
  return {
    jobsCleared: jobsDel.deletedCount,
    applicationsCleared: appsDel.deletedCount,
    candidatesCleared: candDel.deletedCount,
  };
};

export const seedDemoAnalytics = async (targetCompanyId = null) => {
  console.log('🚀 Seeding realistic Employer Hiring Analytics DEMO data...');

  // 1. Resolve Company
  let company = null;
  if (targetCompanyId && mongoose.Types.ObjectId.isValid(targetCompanyId)) {
    company = await Company.findById(targetCompanyId);
  }

  if (!company) {
    company = await Company.findOne({ isDemo: false });
  }

  if (!company) {
    company = await Company.findOne({ isDemo: true });
  }

  if (!company) {
    company = await Company.create({
      companyName: 'SkillBridge Enterprise Corp (Demo)',
      email: 'demo.analytics@skillbridge.ai',
      password: 'DemoPassword123!',
      role: 'company',
      isEmailVerified: true,
      isDemo: true,
      industry: 'Software & Technology',
      location: 'San Francisco, CA',
      website: 'https://skillbridge.ai',
    });
  }

  const companyId = company._id;
  console.log(`📌 Seeding analytics for Company: "${company.companyName}" (${companyId})`);

  // Clear existing demo records first to avoid duplicates
  await clearDemoAnalytics();

  // 2. Define the 5 Roles with exact metrics:
  // Role 1: Full Stack Developer (Engineering) -> Views: 320, Apps: 48
  // Role 2: React Developer (Engineering) -> Views: 245, Apps: 31
  // Role 3: HR Executive (Human Resources) -> Views: 180, Apps: 24
  // Role 4: UI/UX Designer (Design) -> Views: 155, Apps: 19
  // Role 5: Backend Developer (Engineering) -> Views: 120, Apps: 20
  // Total Views = 1,020 | Total Apps = 142
  const jobsData = [
    {
      title: 'Full Stack Developer',
      department: 'Engineering',
      views: 320,
      targetAppsCount: 48,
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'System Design'],
      openings: 3,
    },
    {
      title: 'React Developer',
      department: 'Engineering',
      views: 245,
      targetAppsCount: 31,
      experienceLevel: 'mid',
      employmentType: 'Full Time',
      workMode: 'Hybrid',
      requiredSkills: ['React', 'JavaScript', 'Redux', 'Tailwind CSS'],
      openings: 2,
    },
    {
      title: 'HR Executive',
      department: 'Human Resources',
      views: 180,
      targetAppsCount: 24,
      experienceLevel: 'mid',
      employmentType: 'Full Time',
      workMode: 'On Site',
      requiredSkills: ['Talent Acquisition', 'HR Operations', 'Employee Relations'],
      openings: 1,
    },
    {
      title: 'UI/UX Designer',
      department: 'Design',
      views: 155,
      targetAppsCount: 19,
      experienceLevel: 'mid',
      employmentType: 'Full Time',
      workMode: 'Remote',
      requiredSkills: ['Figma', 'UI Design', 'Wireframing', 'User Research'],
      openings: 2,
    },
    {
      title: 'Backend Developer',
      department: 'Engineering',
      views: 120,
      targetAppsCount: 20,
      experienceLevel: 'senior',
      employmentType: 'Full Time',
      workMode: 'Remote',
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
      openings: 2,
    },
  ];

  // 3. Create Jobs
  const createdJobs = [];
  for (const jData of jobsData) {
    const job = await Job.create({
      companyId,
      createdBy: companyId,
      company: company.companyName,
      title: jData.title,
      department: jData.department,
      description: `Comprehensive hiring vacancy for ${jData.title} role in ${jData.department}.`,
      experienceLevel: jData.experienceLevel,
      employmentType: jData.employmentType,
      workMode: jData.workMode,
      requiredSkills: jData.requiredSkills,
      openings: jData.openings,
      status: 'open',
      views: jData.views,
      totalApplications: jData.targetAppsCount,
      isDemo: true,
    });
    createdJobs.push({ job, targetAppsCount: jData.targetAppsCount });
  }

  console.log(`✅ Created 5 Demo Jobs (Total Views: 1,020)`);

  // 4. Create Candidates & Applications
  // Total Applications = 142
  // Distribution:
  // - 8 Hired (Placed)
  // - 24 Interviewed (Scheduled / Completed)
  // - 40 Shortlisted / Screening
  // - 50 Applied
  // - 20 Rejected
  // Total = 142
  let hiredRemaining = 8;
  let interviewedRemaining = 24;
  let shortlistedRemaining = 40;
  let appliedRemaining = 50;
  let rejectedRemaining = 20;

  const demoCandidates = [];
  const demoApplications = [];
  const demoInterviews = [];

  let candidateIdx = 1;

  for (const { job, targetAppsCount } of createdJobs) {
    for (let i = 0; i < targetAppsCount; i++) {
      let status = 'Applied';
      let isHired = false;
      let isInterviewed = false;

      if (hiredRemaining > 0) {
        status = 'Selected';
        isHired = true;
        isInterviewed = true;
        hiredRemaining--;
      } else if (interviewedRemaining > 0) {
        status = 'Interview Scheduled';
        isInterviewed = true;
        interviewedRemaining--;
      } else if (shortlistedRemaining > 0) {
        status = i % 2 === 0 ? 'Shortlisted' : 'Screening';
        shortlistedRemaining--;
      } else if (rejectedRemaining > 0 && i % 4 === 0) {
        status = 'Rejected';
        rejectedRemaining--;
      } else {
        status = 'Applied';
        if (appliedRemaining > 0) appliedRemaining--;
      }

      // Generate Candidate
      const cand = await Candidate.create({
        fullName: `Demo Candidate ${candidateIdx}`,
        email: `demo_candidate_${candidateIdx}_${Date.now()}@skillbridge.ai`,
        password: 'Password123!',
        role: 'candidate',
        headline: `${job.title} Specialist`,
        skills: job.requiredSkills.slice(0, 3),
        experienceYears: Math.floor(Math.random() * 6) + 2,
        resumeUrl: `https://skillbridge.ai/resumes/demo_candidate_${candidateIdx}.pdf`,
        isDemo: true,
      });

      demoCandidates.push(cand);

      const daysAgo = Math.floor(Math.random() * 25) + 3;
      const appliedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const matchScore = Math.floor(Math.random() * 25) + 72; // Average ~84%

      // Create Application
      const app = await Application.create({
        jobId: job._id,
        candidateId: cand._id,
        companyId,
        status,
        interviewScheduled: isInterviewed,
        interviewDate: isInterviewed ? new Date(appliedDate.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
        appliedAt: appliedDate,
        matchScore,
        resumeScore: matchScore,
        interviewScore: isInterviewed ? Math.floor(Math.random() * 15) + 82 : null,
        codingScore: Math.floor(Math.random() * 15) + 80,
        communicationScore: Math.floor(Math.random() * 15) + 85,
        hiringRecommendation: isHired ? 'Recommended' : isInterviewed ? 'Recommended' : 'Needs Improvement',
        candidateSnapshot: {
          fullName: cand.fullName,
          email: cand.email,
          headline: cand.headline,
          skills: cand.skills,
          experienceYears: cand.experienceYears,
          resumeUrl: cand.resumeUrl,
        },
        isDemo: true,
      });

      demoApplications.push(app);

      // If Interviewed or Hired, create Interview record
      if (isInterviewed) {
        const interview = await Interview.create({
          applicationId: app._id,
          candidateId: cand._id,
          companyId,
          jobId: job._id,
          interviewType: 'Technical',
          title: `Technical Evaluation - ${cand.fullName}`,
          scheduledDate: new Date(appliedDate.getTime() + 5 * 24 * 60 * 60 * 1000),
          startTime: '10:00',
          endTime: '11:00',
          status: isHired ? 'Completed' : 'Scheduled',
          meetingLink: `/interview/room/demo-room-${app._id}`,
          isDemo: true,
        });
        demoInterviews.push(interview);
      }

      candidateIdx++;
    }
  }

  console.log(`✅ Successfully seeded:
  - Jobs: ${createdJobs.length} (1,020 Views)
  - Applications: ${demoApplications.length} (142 Total)
  - Interviewed: 32 Candidates
  - Hired / Placed: 8 Candidates
  - Time-to-Hire: 18 days average
  - AI Screening Efficiency: 84% average score`);

  return {
    success: true,
    companyId,
    totalViews: 1020,
    totalApplications: demoApplications.length,
    interviewed: 32,
    hired: 8,
    jobs: createdJobs.map(j => j.job),
  };
};

// Direct CLI Execution handler
if (process.argv[1] && process.argv[1].includes('seedDemoAnalytics')) {
  const isClear = process.argv.includes('--clear');
  const companyArg = process.argv.find(a => a.startsWith('--companyId='));
  const targetCompanyId = companyArg ? companyArg.split('=')[1] : null;

  connectDB()
    .then(async () => {
      if (isClear) {
        await clearDemoAnalytics();
      } else {
        await seedDemoAnalytics(targetCompanyId);
      }
      console.log('🎉 Execution completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error executing seed script:', err);
      process.exit(1);
    });
}
