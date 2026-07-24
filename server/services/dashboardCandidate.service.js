import mongoose from 'mongoose';
import { Candidate } from '../models/candidate.model.js';
import { Application, APPLICATION_STATUS } from '../models/application.model.js';
import { Interview, INTERVIEW_STATUS } from '../models/interview.model.js';
import { Notification } from '../models/notification.model.js';
import { SavedJob } from '../models/savedJob.model.js';

/**
 * 1. Profile Completion Percentage & Audit Helper
 */
export const calculateProfileCompletion = (candidate) => {
  const sections = [
    { name: 'Personal Details', isComplete: Boolean(candidate.fullName && candidate.email && candidate.phone) },
    { name: 'Skills', isComplete: Array.isArray(candidate.skills) && candidate.skills.length > 0 },
    { name: 'Education', isComplete: Array.isArray(candidate.education) && candidate.education.length > 0 },
    { name: 'Experience', isComplete: (candidate.experienceYears && candidate.experienceYears > 0) || (Array.isArray(candidate.experience) && candidate.experience.length > 0) },
    { name: 'Resume', isComplete: Boolean(candidate.resumeUrl) },
    { name: 'Avatar', isComplete: Boolean(candidate.avatarUrl) },
    { name: 'Headline', isComplete: Boolean(candidate.headline) },
    { name: 'Bio', isComplete: Boolean(candidate.bio) },
  ];

  const completed = sections.filter((s) => s.isComplete).length;
  const total = sections.length;
  const profileCompletion = Math.round((completed / total) * 100);
  const missing = sections.filter((s) => !s.isComplete).map((s) => s.name);

  return { profileCompletion, missing };
};

/**
 * 2. Get Candidate Dashboard Summary
 */
export const getCandidateDashboardSummaryService = async (candidateIdStr) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);

  const candidate = await Candidate.findById(candidateId).lean();
  if (!candidate) return null;

  const [appStats, interviewStats, unreadNotifications, savedJobsCount] = await Promise.all([
    Application.aggregate([
      { $match: { candidateId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          activeApplications: {
            $sum: {
              $cond: [
                {
                  $not: [
                    { $in: ['$status', [APPLICATION_STATUS.REJECTED, APPLICATION_STATUS.WITHDRAWN]] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          shortlisted: {
            $sum: { $cond: [{ $eq: ['$status', APPLICATION_STATUS.SHORTLISTED] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', APPLICATION_STATUS.REJECTED] }, 1, 0] },
          },
          offersReceived: {
            $sum: {
              $cond: [
                { $in: ['$status', [APPLICATION_STATUS.SELECTED, 'Offer Accepted']] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Interview.aggregate([
      { $match: { candidateId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          interviewsScheduled: {
            $sum: {
              $cond: [
                { $in: ['$status', [INTERVIEW_STATUS.SCHEDULED, INTERVIEW_STATUS.RESCHEDULED]] },
                1,
                0,
              ],
            },
          },
          interviewsCompleted: {
            $sum: { $cond: [{ $eq: ['$status', INTERVIEW_STATUS.COMPLETED] }, 1, 0] },
          },
        },
      },
    ]),
    Notification.countDocuments({ receiverId: candidateId, receiverRole: 'candidate', isRead: false, isDeleted: { $ne: true } }),
    SavedJob.countDocuments({ candidateId }),
  ]);

  const appData = appStats[0] || {
    totalApplications: 0,
    activeApplications: 0,
    shortlisted: 0,
    rejected: 0,
    offersReceived: 0,
  };
  delete appData._id;

  const intData = interviewStats[0] || {
    interviewsScheduled: 0,
    interviewsCompleted: 0,
  };
  delete intData._id;

  const { profileCompletion } = calculateProfileCompletion(candidate);

  return {
    ...appData,
    ...intData,
    profileCompletionPercentage: profileCompletion,
    unreadNotifications,
    savedJobsCount,
  };
};

/**
 * 3. My Applications List Section
 */
export const getCandidateDashboardApplicationsService = async (candidateIdStr, query = {}) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const { status, sort } = query;
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { candidateId, isDeleted: { $ne: true } };
  if (status) filter.status = status;

  let sortOption = { appliedAt: -1 };
  if (sort === 'oldest') sortOption = { appliedAt: 1 };
  else if (sort === 'updated') sortOption = { lastUpdated: -1 };

  const [rawApplications, totalItems] = await Promise.all([
    Application.find(filter)
      .populate('jobId', 'title department company workMode employmentType status')
      .populate('companyId', 'companyName logoUrl location industry')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  const applications = rawApplications.map((app) => ({
    _id: app._id,
    jobId: app.jobId ? app.jobId._id : null,
    jobTitle: app.jobId ? app.jobId.title : 'Job Vacancy',
    department: app.jobId ? app.jobId.department : '',
    company: app.companyId ? app.companyId.companyName : app.candidateSnapshot?.company || '',
    companyLogo: app.companyId ? app.companyId.logoUrl : '',
    currentStatus: app.status,
    appliedDate: app.appliedAt,
    lastUpdated: app.lastUpdated || app.updatedAt,
    interviewStatus: app.interviewScheduled ? (app.status === 'Interview Completed' ? 'Completed' : 'Scheduled') : 'None',
    resumeUsed: app.resumeUrl,
  }));

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    applications,
    pagination: {
      totalItems,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * 4. Upcoming Interviews Section (Nearest Interview First)
 */
export const getCandidateDashboardUpcomingInterviewsService = async (candidateIdStr) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const now = new Date();

  const interviews = await Interview.find({
    candidateId,
    status: { $in: [INTERVIEW_STATUS.SCHEDULED, INTERVIEW_STATUS.RESCHEDULED] },
    scheduledDate: { $gte: now },
    isDeleted: { $ne: true },
  })
    .populate('companyId', 'companyName logoUrl location industry')
    .populate('jobId', 'title department')
    .sort({ scheduledDate: 1 }) // Nearest interview first
    .lean();

  return interviews.map((item) => ({
    _id: item._id,
    interviewType: item.interviewType,
    date: item.scheduledDate,
    time: item.startTime,
    endTime: item.endTime,
    platform: item.meetingPlatform,
    meetingLink: item.meetingLink,
    company: item.companyId ? item.companyId.companyName : '',
    companyLogo: item.companyId ? item.companyId.logoUrl : '',
    jobTitle: item.jobId ? item.jobId.title : '',
    round: item.round,
    status: item.status,
  }));
};

/**
 * 5. Profile Completion Audit Section
 */
export const getCandidateDashboardProfileCompletionService = async (candidateIdStr) => {
  const candidate = await Candidate.findById(candidateIdStr).lean();
  if (!candidate) throw new Error('Candidate not found');
  return calculateProfileCompletion(candidate);
};

/**
 * 6. Candidate Activity Timeline Section (Newest First)
 */
export const getCandidateDashboardTimelineService = async (candidateIdStr, query = {}) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const limit = parseInt(query.limit, 10) || 20;

  // Gather Application events
  const applications = await Application.find({ candidateId, isDeleted: { $ne: true } })
    .populate('jobId', 'title')
    .populate('companyId', 'companyName')
    .lean();

  // Gather Interview events
  const interviews = await Interview.find({ candidateId, isDeleted: { $ne: true } })
    .populate('jobId', 'title')
    .populate('companyId', 'companyName')
    .lean();

  const timelineEvents = [];

  // Application activities
  applications.forEach((app) => {
    const jobTitle = app.jobId ? app.jobId.title : 'Job';
    const company = app.companyId ? app.companyId.companyName : '';

    timelineEvents.push({
      type: 'Applied Job',
      title: `Applied for ${jobTitle}`,
      company,
      date: app.appliedAt,
      metadata: { applicationId: app._id, jobId: app.jobId ? app.jobId._id : null },
    });

    if (app.status === APPLICATION_STATUS.SELECTED || app.status === 'Offer Accepted') {
      timelineEvents.push({
        type: 'Offer Received',
        title: `Offer Received for ${jobTitle}`,
        company,
        date: app.lastUpdated || app.updatedAt,
        metadata: { applicationId: app._id },
      });
    }
  });

  // Interview activities
  interviews.forEach((inv) => {
    const jobTitle = inv.jobId ? inv.jobId.title : 'Job';
    const company = inv.companyId ? inv.companyId.companyName : '';

    if (inv.status === INTERVIEW_STATUS.SCHEDULED) {
      timelineEvents.push({
        type: 'Interview Scheduled',
        title: `${inv.interviewType} Interview Scheduled for ${jobTitle}`,
        company,
        date: inv.createdAt,
        metadata: { interviewId: inv._id, scheduledDate: inv.scheduledDate },
      });
    } else if (inv.status === INTERVIEW_STATUS.RESCHEDULED) {
      timelineEvents.push({
        type: 'Interview Rescheduled',
        title: `${inv.interviewType} Interview Rescheduled for ${jobTitle}`,
        company,
        date: inv.updatedAt,
        metadata: { interviewId: inv._id, scheduledDate: inv.scheduledDate },
      });
    } else if (inv.status === INTERVIEW_STATUS.COMPLETED) {
      timelineEvents.push({
        type: 'Interview Completed',
        title: `${inv.interviewType} Interview Completed for ${jobTitle}`,
        company,
        date: inv.updatedAt,
        metadata: { interviewId: inv._id },
      });
    }

    if (inv.feedback) {
      timelineEvents.push({
        type: 'Feedback Received',
        title: `Interviewer Feedback Received for ${jobTitle}`,
        feedback: inv.feedback,
        rating: inv.rating,
        date: inv.updatedAt,
        metadata: { interviewId: inv._id },
      });
    }
  });

  // Sort newest first
  timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

  return timelineEvents.slice(0, limit);
};

/**
 * 7. Candidate Dashboard Analytics Section
 */
export const getCandidateDashboardAnalyticsService = async (candidateIdStr) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const now = new Date();

  // Date boundaries for This Month & Last Month
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Run Concurrent Aggregations
  const [
    thisMonthApps,
    lastMonthApps,
    totalApps,
    totalInterviews,
    completedInterviews,
    offers,
    mostAppliedSkillData,
  ] = await Promise.all([
    Application.countDocuments({ candidateId, appliedAt: { $gte: startOfThisMonth }, isDeleted: { $ne: true } }),
    Application.countDocuments({ candidateId, appliedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, isDeleted: { $ne: true } }),
    Application.countDocuments({ candidateId, isDeleted: { $ne: true } }),
    Interview.countDocuments({ candidateId, isDeleted: { $ne: true } }),
    Interview.countDocuments({ candidateId, status: INTERVIEW_STATUS.COMPLETED, isDeleted: { $ne: true } }),
    Application.countDocuments({ candidateId, status: { $in: [APPLICATION_STATUS.SELECTED, 'Offer Accepted'] }, isDeleted: { $ne: true } }),
    Application.aggregate([
      { $match: { candidateId, isDeleted: { $ne: true } } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: '$job' },
      { $unwind: '$job.requiredSkills' },
      {
        $group: {
          _id: { $toLower: '$job.requiredSkills' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
  ]);

  const interviewSuccessRate =
    totalInterviews > 0 ? Number(((completedInterviews / totalInterviews) * 100).toFixed(2)) : 0;

  const offerConversionRate =
    totalApps > 0 ? Number(((offers / totalApps) * 100).toFixed(2)) : 0;

  const mostAppliedSkill = mostAppliedSkillData[0] ? mostAppliedSkillData[0]._id : 'None';

  // Build Monthly Activity Graph Data for past 6 months
  const monthlyActivityGraphData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

    const [monthAppsCount, monthInterviewsCount] = await Promise.all([
      Application.countDocuments({
        candidateId,
        appliedAt: { $gte: monthDate, $lte: monthEnd },
        isDeleted: { $ne: true },
      }),
      Interview.countDocuments({
        candidateId,
        scheduledDate: { $gte: monthDate, $lte: monthEnd },
        isDeleted: { $ne: true },
      }),
    ]);

    monthlyActivityGraphData.push({
      year: monthDate.getFullYear(),
      monthName: monthDate.toLocaleString('default', { month: 'short' }),
      monthIndex: monthDate.getMonth() + 1,
      applicationsCount: monthAppsCount,
      interviewsCount: monthInterviewsCount,
    });
  }

  return {
    applicationsThisMonth: thisMonthApps,
    applicationsLastMonth: lastMonthApps,
    interviewSuccessRate,
    offerConversionRate,
    mostAppliedSkill,
    monthlyActivityGraphData,
  };
};
