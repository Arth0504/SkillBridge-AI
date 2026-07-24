import mongoose from 'mongoose';
import { Job } from '../models/job.model.js';
import { Application, APPLICATION_STATUS } from '../models/application.model.js';
import { Interview, INTERVIEW_STATUS } from '../models/interview.model.js';

/**
 * Helper to build Date filter object
 */
const buildDateFilter = (startDate, endDate, dateField = 'appliedAt') => {
  const filter = {};
  if (startDate || endDate) {
    filter[dateField] = {};
    if (startDate) filter[dateField].$gte = new Date(startDate);
    if (endDate) filter[dateField].$lte = new Date(endDate);
  }
  return filter;
};

/**
 * 1. Get Company Dashboard Summary Statistics
 */
export const getCompanyDashboardSummaryService = async (companyIdStr, query = {}) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);
  const { startDate, endDate, jobId, department, status } = query;

  // Build Job filter
  const jobMatch = { companyId };
  if (department) {
    jobMatch.department = { $regex: new RegExp(department, 'i') };
  }
  if (jobId) {
    jobMatch._id = new mongoose.Types.ObjectId(jobId);
  }

  // Aggregate Job stats
  const jobStatsAggregation = await Job.aggregate([
    { $match: jobMatch },
    {
      $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        openJobs: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        closedJobs: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        pausedJobs: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } },
        draftJobs: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        expiredJobs: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
      },
    },
  ]);

  const jobStats = jobStatsAggregation[0] || {
    totalJobs: 0,
    openJobs: 0,
    closedJobs: 0,
    pausedJobs: 0,
    draftJobs: 0,
    expiredJobs: 0,
  };
  delete jobStats._id;

  // Build Application Match
  const appMatch = { companyId, isDeleted: { $ne: true } };
  const dateFilter = buildDateFilter(startDate, endDate, 'appliedAt');
  if (dateFilter.appliedAt) {
    appMatch.appliedAt = dateFilter.appliedAt;
  }
  if (jobId) {
    appMatch.jobId = new mongoose.Types.ObjectId(jobId);
  }
  if (status) {
    appMatch.status = status;
  }

  // Date boundaries for Today, Week, Month
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.valueOf() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Application Pipeline
  const appStatsPipeline = [
    { $match: appMatch },
  ];

  // If department filter is present, lookup job
  if (department) {
    appStatsPipeline.push(
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobInfo',
        },
      },
      { $unwind: '$jobInfo' },
      { $match: { 'jobInfo.department': { $regex: new RegExp(department, 'i') } } }
    );
  }

  appStatsPipeline.push({
    $group: {
      _id: null,
      totalApplications: { $sum: 1 },
      applicationsToday: {
        $sum: { $cond: [{ $gte: ['$appliedAt', startOfToday] }, 1, 0] },
      },
      applicationsThisWeek: {
        $sum: { $cond: [{ $gte: ['$appliedAt', startOfWeek] }, 1, 0] },
      },
      applicationsThisMonth: {
        $sum: { $cond: [{ $gte: ['$appliedAt', startOfMonth] }, 1, 0] },
      },
      shortlistedCandidates: {
        $sum: { $cond: [{ $eq: ['$status', APPLICATION_STATUS.SHORTLISTED] }, 1, 0] },
      },
      interviewScheduled: {
        $sum: {
          $cond: [
            {
              $or: [
                { $eq: ['$status', APPLICATION_STATUS.INTERVIEW_SCHEDULED] },
                { $eq: ['$interviewScheduled', true] },
              ],
            },
            1,
            0,
          ],
        },
      },
      selectedCandidates: {
        $sum: { $cond: [{ $eq: ['$status', APPLICATION_STATUS.SELECTED] }, 1, 0] },
      },
      rejectedCandidates: {
        $sum: { $cond: [{ $eq: ['$status', APPLICATION_STATUS.REJECTED] }, 1, 0] },
      },
      offerAccepted: {
        $sum: { $cond: [{ $eq: ['$status', 'Offer Accepted'] }, 1, 0] },
      },
      offerDeclined: {
        $sum: { $cond: [{ $eq: ['$status', 'Offer Declined'] }, 1, 0] },
      },
    },
  });

  const appStatsAggregation = await Application.aggregate(appStatsPipeline);
  const appStats = appStatsAggregation[0] || {
    totalApplications: 0,
    applicationsToday: 0,
    applicationsThisWeek: 0,
    applicationsThisMonth: 0,
    shortlistedCandidates: 0,
    interviewScheduled: 0,
    selectedCandidates: 0,
    rejectedCandidates: 0,
    offerAccepted: 0,
    offerDeclined: 0,
  };
  delete appStats._id;

  // Interview Overview Summary (Aggregated from Interview collection)
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const interviewMatch = { companyId, isDeleted: { $ne: true } };
  if (jobId) interviewMatch.jobId = new mongoose.Types.ObjectId(jobId);

  const interviewStatsAggregation = await Interview.aggregate([
    { $match: interviewMatch },
    {
      $group: {
        _id: null,
        upcomingInterviews: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ['$status', [INTERVIEW_STATUS.SCHEDULED, INTERVIEW_STATUS.RESCHEDULED]] },
                  { $gte: ['$scheduledDate', now] },
                ],
              },
              1,
              0,
            ],
          },
        },
        todaysInterviews: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$scheduledDate', startOfToday] },
                  { $lte: ['$scheduledDate', endOfToday] },
                ],
              },
              1,
              0,
            ],
          },
        },
        completedInterviews: {
          $sum: {
            $cond: [{ $eq: ['$status', INTERVIEW_STATUS.COMPLETED] }, 1, 0],
          },
        },
        cancelledInterviews: {
          $sum: {
            $cond: [{ $eq: ['$status', INTERVIEW_STATUS.CANCELLED] }, 1, 0],
          },
        },
      },
    },
  ]);

  const interviewStats = interviewStatsAggregation[0] || {
    upcomingInterviews: 0,
    todaysInterviews: 0,
    completedInterviews: 0,
    cancelledInterviews: 0,
  };
  delete interviewStats._id;

  return {
    jobs: jobStats,
    applications: appStats,
    interviews: interviewStats,
  };
};

/**
 * 2. Get Company Dashboard Analytics
 */
export const getCompanyDashboardAnalyticsService = async (companyIdStr, query = {}) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);
  const { startDate, endDate, jobId, department } = query;

  const appMatch = { companyId, isDeleted: { $ne: true } };
  const dateFilter = buildDateFilter(startDate, endDate, 'appliedAt');
  if (dateFilter.appliedAt) {
    appMatch.appliedAt = dateFilter.appliedAt;
  }
  if (jobId) {
    appMatch.jobId = new mongoose.Types.ObjectId(jobId);
  }

  // Base Aggregation for Application trends
  const baseAppPipeline = [{ $match: appMatch }];
  if (department) {
    baseAppPipeline.push(
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobInfo',
        },
      },
      { $unwind: '$jobInfo' },
      { $match: { 'jobInfo.department': { $regex: new RegExp(department, 'i') } } }
    );
  }

  // 1. Monthly Applications
  const monthlyAppPipeline = [
    ...baseAppPipeline,
    {
      $group: {
        _id: {
          year: { $year: '$appliedAt' },
          month: { $month: '$appliedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        count: 1,
      },
    },
  ];

  // 2. Monthly Hiring
  const monthlyHiringPipeline = [
    ...baseAppPipeline,
    {
      $match: {
        status: { $in: [APPLICATION_STATUS.SELECTED, 'Offer Accepted'] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$appliedAt' },
          month: { $month: '$appliedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        count: 1,
      },
    },
  ];

  // 3. Applications Per Job & Top Performing Jobs
  const appsPerJobPipeline = [
    ...baseAppPipeline,
    {
      $group: {
        _id: '$jobId',
        applicationsCount: { $sum: 1 },
        hiredCount: {
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
    {
      $lookup: {
        from: 'jobs',
        localField: '_id',
        foreignField: '_id',
        as: 'jobDetails',
      },
    },
    { $unwind: '$jobDetails' },
    {
      $project: {
        _id: 0,
        jobId: '$_id',
        title: '$jobDetails.title',
        department: '$jobDetails.department',
        status: '$jobDetails.status',
        views: '$jobDetails.views',
        applicationsCount: 1,
        hiredCount: 1,
        conversionRate: {
          $cond: [
            { $gt: ['$jobDetails.views', 0] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$applicationsCount', '$jobDetails.views'] },
                    100,
                  ],
                },
                2,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { applicationsCount: -1 } },
  ];

  // 4. Hiring Ratio calculation
  const totalAppsCount = await Application.countDocuments(appMatch);
  const totalHiredCount = await Application.countDocuments({
    ...appMatch,
    status: { $in: [APPLICATION_STATUS.SELECTED, 'Offer Accepted'] },
  });
  const hiringRatio =
    totalAppsCount > 0 ? Number(((totalHiredCount / totalAppsCount) * 100).toFixed(2)) : 0;

  // 5. Top Skills Requested across company jobs
  const topSkillsPipeline = [
    { $match: { companyId } },
    { $unwind: '$requiredSkills' },
    {
      $group: {
        _id: { $toLower: '$requiredSkills' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        skill: '$_id',
        count: 1,
      },
    },
  ];

  // 6. Application Trend (daily breakdown)
  const applicationTrendPipeline = [
    ...baseAppPipeline,
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
      },
    },
  ];

  // 7. Hiring Trend (daily breakdown for hires)
  const hiringTrendPipeline = [
    ...baseAppPipeline,
    {
      $match: {
        status: { $in: [APPLICATION_STATUS.SELECTED, 'Offer Accepted'] },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
      },
    },
  ];

  // Run aggregations concurrently
  const [
    monthlyApplications,
    monthlyHiring,
    applicationsPerJob,
    topSkillsRequested,
    applicationTrend,
    hiringTrend,
  ] = await Promise.all([
    Application.aggregate(monthlyAppPipeline),
    Application.aggregate(monthlyHiringPipeline),
    Application.aggregate(appsPerJobPipeline),
    Job.aggregate(topSkillsPipeline),
    Application.aggregate(applicationTrendPipeline),
    Application.aggregate(hiringTrendPipeline),
  ]);

  const topPerformingJobs = applicationsPerJob.slice(0, 5);

  return {
    monthlyApplications,
    monthlyHiring,
    applicationsPerJob,
    hiringRatio: {
      totalApplications: totalAppsCount,
      totalHired: totalHiredCount,
      hiringRatioPercentage: hiringRatio,
    },
    topPerformingJobs,
    topSkillsRequested,
    applicationTrend,
    hiringTrend,
  };
};

/**
 * 3. Get Company Dashboard Recent Activities
 */
export const getCompanyDashboardRecentApplicationsService = async (companyIdStr, query = {}) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);
  const { startDate, endDate, jobId, status, department } = query;
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const appMatch = { companyId, isDeleted: { $ne: true } };
  const dateFilter = buildDateFilter(startDate, endDate, 'appliedAt');
  if (dateFilter.appliedAt) appMatch.appliedAt = dateFilter.appliedAt;
  if (jobId) appMatch.jobId = new mongoose.Types.ObjectId(jobId);
  if (status) appMatch.status = status;

  const pipeline = [{ $match: appMatch }];

  if (department) {
    pipeline.push(
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobInfo',
        },
      },
      { $unwind: '$jobInfo' },
      { $match: { 'jobInfo.department': { $regex: new RegExp(department, 'i') } } }
    );
  }

  // Count total matching
  const totalCountPipeline = [...pipeline, { $count: 'total' }];
  const countRes = await Application.aggregate(totalCountPipeline);
  const totalItems = countRes[0] ? countRes[0].total : 0;

  // Recent applications list
  const recentAppPipeline = [
    ...pipeline,
    { $sort: { appliedAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        candidateId: 1,
        jobId: 1,
        jobTitle: '$job.title',
        department: '$job.department',
        candidateSnapshot: 1,
        status: 1,
        rating: 1,
        appliedAt: 1,
        lastUpdated: 1,
      },
    },
  ];

  const latestApplications = await Application.aggregate(recentAppPipeline);

  // Recently Posted Jobs
  const recentlyPostedJobs = await Job.find({ companyId })
    .select('_id title department status openings views totalApplications createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Recently Closed Jobs
  const recentlyClosedJobs = await Job.find({ companyId, status: 'closed' })
    .select('_id title department status views totalApplications updatedAt')
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  // Recent Candidate Status Changes
  const statusChangesPipeline = [
    { $match: { companyId, isDeleted: { $ne: true } } },
    { $sort: { updatedAt: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        candidateName: '$candidateSnapshot.fullName',
        candidateEmail: '$candidateSnapshot.email',
        jobTitle: '$job.title',
        status: 1,
        updatedAt: 1,
      },
    },
  ];

  const recentCandidateStatusChanges = await Application.aggregate(statusChangesPipeline);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    latestApplications,
    recentlyPostedJobs,
    recentlyClosedJobs,
    recentCandidateStatusChanges,
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
 * 4. Get Company Dashboard Job Performance
 */
export const getCompanyDashboardJobPerformanceService = async (companyIdStr, query = {}) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);
  const { department, jobId, status } = query;
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const jobMatch = { companyId };
  if (department) jobMatch.department = { $regex: new RegExp(department, 'i') };
  if (jobId) jobMatch._id = new mongoose.Types.ObjectId(jobId);
  if (status) jobMatch.status = status;

  const jobsPerformancePipeline = [
    { $match: jobMatch },
    {
      $project: {
        _id: 1,
        title: 1,
        department: 1,
        status: 1,
        views: 1,
        totalApplications: 1,
        createdAt: 1,
        conversionRate: {
          $cond: [
            { $gt: ['$views', 0] },
            {
              $round: [
                { $multiply: [{ $divide: ['$totalApplications', '$views'] }, 100] },
                2,
              ],
            },
            0,
          ],
        },
      },
    },
  ];

  const allJobsPerformance = await Job.aggregate(jobsPerformancePipeline);

  // Overall metrics calculation
  const totalJobsCount = allJobsPerformance.length;
  let mostPopularJob = null;
  let leastPopularJob = null;
  let totalAppsSum = 0;

  if (totalJobsCount > 0) {
    const sortedByApps = [...allJobsPerformance].sort(
      (a, b) => b.totalApplications - a.totalApplications
    );
    mostPopularJob = sortedByApps[0];
    leastPopularJob = sortedByApps[sortedByApps.length - 1];
    totalAppsSum = allJobsPerformance.reduce((acc, job) => acc + job.totalApplications, 0);
  }

  const averageApplicationsPerJob =
    totalJobsCount > 0 ? Number((totalAppsSum / totalJobsCount).toFixed(2)) : 0;

  // Paginated job list
  const paginatedJobs = allJobsPerformance
    .sort((a, b) => b.totalApplications - a.totalApplications)
    .slice(skip, skip + limit);

  const totalPages = Math.ceil(totalJobsCount / limit) || 1;

  return {
    overview: {
      totalJobs: totalJobsCount,
      mostPopularJob,
      leastPopularJob,
      averageApplicationsPerJob,
    },
    jobs: paginatedJobs,
    pagination: {
      totalItems: totalJobsCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * 5. Get Company Dashboard Interview Overview
 */
export const getCompanyDashboardInterviewsService = async (companyIdStr, query = {}) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);
  const { startDate, endDate, jobId, department, interviewStatus } = query;
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const now = new Date();

  // Overview Counts Pipeline
  const overviewPipeline = [
    { $match: { companyId, isDeleted: { $ne: true } } },
    {
      $group: {
        _id: null,
        upcoming: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', APPLICATION_STATUS.INTERVIEW_SCHEDULED] },
                  { $gte: ['$interviewDate', now] },
                ],
              },
              1,
              0,
            ],
          },
        },
        completed: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ['$status', APPLICATION_STATUS.INTERVIEW_COMPLETED] },
                  {
                    $and: [
                      { $eq: ['$status', APPLICATION_STATUS.SELECTED] },
                      { $eq: ['$interviewScheduled', true] },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
        pending: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', APPLICATION_STATUS.INTERVIEW_SCHEDULED] },
                  { $lt: ['$interviewDate', now] },
                ],
              },
              1,
              0,
            ],
          },
        },
        cancelled: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', APPLICATION_STATUS.WITHDRAWN] },
                  { $eq: ['$interviewScheduled', true] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ];

  const overviewResult = await Application.aggregate(overviewPipeline);
  const overview = overviewResult[0] || {
    upcoming: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  };
  delete overview._id;

  // Filtered interviews list match
  const matchFilter = {
    companyId,
    isDeleted: { $ne: true },
    interviewScheduled: true,
  };

  const dateFilter = buildDateFilter(startDate, endDate, 'interviewDate');
  if (dateFilter.interviewDate) matchFilter.interviewDate = dateFilter.interviewDate;
  if (jobId) matchFilter.jobId = new mongoose.Types.ObjectId(jobId);

  if (interviewStatus === 'upcoming') {
    matchFilter.status = APPLICATION_STATUS.INTERVIEW_SCHEDULED;
    matchFilter.interviewDate = { $gte: now };
  } else if (interviewStatus === 'completed') {
    matchFilter.$or = [
      { status: APPLICATION_STATUS.INTERVIEW_COMPLETED },
      { status: APPLICATION_STATUS.SELECTED },
    ];
  } else if (interviewStatus === 'pending') {
    matchFilter.status = APPLICATION_STATUS.INTERVIEW_SCHEDULED;
    matchFilter.interviewDate = { $lt: now };
  } else if (interviewStatus === 'cancelled') {
    matchFilter.status = APPLICATION_STATUS.WITHDRAWN;
  }

  const listPipeline = [{ $match: matchFilter }];

  if (department) {
    listPipeline.push(
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobInfo',
        },
      },
      { $unwind: '$jobInfo' },
      { $match: { 'jobInfo.department': { $regex: new RegExp(department, 'i') } } }
    );
  }

  const countPipeline = [...listPipeline, { $count: 'total' }];
  const countRes = await Application.aggregate(countPipeline);
  const totalItems = countRes[0] ? countRes[0].total : 0;

  listPipeline.push(
    { $sort: { interviewDate: 1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        candidateId: 1,
        jobId: 1,
        jobTitle: '$job.title',
        department: '$job.department',
        candidateSnapshot: 1,
        status: 1,
        interviewDate: 1,
        notes: 1,
        feedback: 1,
      },
    }
  );

  const interviews = await Application.aggregate(listPipeline);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    overview,
    interviews,
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
