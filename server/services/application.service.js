import { Application, APPLICATION_STATUS } from '../models/application.model.js';
import { Job } from '../models/job.model.js';
import { Candidate } from '../models/candidate.model.js';
import { AppError } from '../utils/AppError.js';
import { createNotificationService } from './notification.service.js';
import { NOTIFICATION_TYPES } from '../models/notification.model.js';

/**
 * Submit job application (Candidate)
 */
export const submitApplication = async ({ candidateId, jobId, coverLetter = '', customResumeUrl }) => {
  // 1. Verify Candidate Eligibility
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    throw new AppError('Candidate profile not found', 404);
  }

  if (!candidate.isEmailVerified) {
    throw new AppError('Your email address must be verified before applying to jobs.', 403);
  }

  if (!candidate.profileCompleted) {
    throw new AppError('Please complete your profile before applying to jobs.', 400);
  }

  const resumeUrl = customResumeUrl || candidate.resumeUrl;
  if (!resumeUrl) {
    throw new AppError('A resume is required to apply for job postings.', 400);
  }

  // 2. Verify Job Availability
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job posting not found.', 404);
  }

  if (job.status !== 'open') {
    throw new AppError(`This job vacancy is not open for applications (Current Status: ${job.status}).`, 400);
  }

  if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
    throw new AppError('The application deadline for this job posting has passed.', 400);
  }

  // 3. Prevent Duplicate Applications
  const existingApplication = await Application.findOne({
    candidateId,
    jobId,
    isDeleted: false,
  });

  if (existingApplication) {
    throw new AppError('You have already submitted an application for this job posting.', 409);
  }

  // 4. Build Candidate Snapshot
  const candidateSnapshot = {
    fullName: candidate.fullName,
    email: candidate.email,
    phone: candidate.phone || '',
    headline: candidate.headline || '',
    skills: candidate.skills || [],
    experienceYears: candidate.experienceYears || 0,
  };

  // 5. Create Application
  const application = await Application.create({
    candidateId,
    jobId,
    companyId: job.companyId,
    resumeUrl,
    resumePublicId: candidate.resumePublicId || '',
    coverLetter: coverLetter.trim(),
    candidateSnapshot,
    status: APPLICATION_STATUS.APPLIED,
    appliedAt: new Date(),
    lastUpdated: new Date(),
  });

  // 6. Increment Statistics Counters
  await Promise.all([
    Job.findByIdAndUpdate(jobId, { $inc: { totalApplications: 1 } }),
    Candidate.findByIdAndUpdate(candidateId, { $inc: { totalApplications: 1 } }),
  ]);

  // 7. Automatic Notification for Company (Job Applied)
  createNotificationService({
    receiverId: job.companyId,
    receiverRole: 'company',
    senderId: candidateId,
    senderRole: 'candidate',
    title: 'New Job Application Received',
    message: `${candidate.fullName} has applied for the position of "${job.title}".`,
    type: NOTIFICATION_TYPES.JOB_APPLIED,
    priority: 'medium',
    metadata: {
      jobId: job._id,
      applicationId: application._id,
      candidateId,
      jobTitle: job.title,
      candidateName: candidate.fullName,
    },
  }).catch((err) => console.error('Auto-Notification Error (Job Applied):', err.message));

  return await Application.findById(application._id)
    .populate('jobId', 'title department company workMode employmentType salary location')
    .populate('companyId', 'companyName logoUrl location industry');
};

/**
 * Get Candidate's Applications with Filtering, Sorting & Pagination
 */
export const getCandidateApplications = async (candidateId, queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(queryParams.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { candidateId, isDeleted: false };

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  const [rawApplications, totalCount] = await Promise.all([
    Application.find(filter)
      .populate('jobId', 'title department company workMode employmentType status location')
      .populate('companyId', 'companyName logoUrl location industry')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  // Enforce Feedback Visibility Rule:
  // Candidate can view feedback ONLY if status is 'Interview Completed', 'Selected', or 'Rejected'
  const visibleFeedbackStatuses = [
    APPLICATION_STATUS.INTERVIEW_COMPLETED,
    APPLICATION_STATUS.SELECTED,
    APPLICATION_STATUS.REJECTED,
  ];

  const applications = rawApplications.map((app) => {
    if (!visibleFeedbackStatuses.includes(app.status)) {
      app.feedback = ''; // Hide unreleased feedback
    }
    return app;
  });

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    applications,
    pagination: {
      currentPage: page,
      limit,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get Candidate Application Details by ID
 */
export const getCandidateApplicationById = async (applicationId, candidateId) => {
  const application = await Application.findOne({
    _id: applicationId,
    candidateId,
    isDeleted: false,
  })
    .populate('jobId', 'title department company description requiredSkills workMode employmentType status location applicationDeadline')
    .populate('companyId', 'companyName logoUrl location industry website description')
    .lean();

  if (!application) {
    throw new AppError('Application record not found.', 404);
  }

  const visibleFeedbackStatuses = [
    APPLICATION_STATUS.INTERVIEW_COMPLETED,
    APPLICATION_STATUS.SELECTED,
    APPLICATION_STATUS.REJECTED,
  ];

  if (!visibleFeedbackStatuses.includes(application.status)) {
    application.feedback = '';
  }

  return application;
};

/**
 * Withdraw Application (Candidate)
 */
export const withdrawApplication = async (applicationId, candidateId) => {
  const application = await Application.findOne({
    _id: applicationId,
    candidateId,
    isDeleted: false,
  });

  if (!application) {
    throw new AppError('Application record not found.', 404);
  }

  if (application.status === APPLICATION_STATUS.WITHDRAWN || application.isWithdrawn) {
    throw new AppError('Application has already been withdrawn.', 400);
  }

  application.isWithdrawn = true;
  application.status = APPLICATION_STATUS.WITHDRAWN;
  application.withdrawnAt = new Date();
  application.lastUpdated = new Date();

  await application.save();
  return application;
};

/**
 * Get Company Applications (All or specific Job) with Filtering, Search & Pagination
 */
export const getCompanyApplications = async (companyId, queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(queryParams.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { companyId, isDeleted: false };

  if (queryParams.jobId) {
    filter.jobId = queryParams.jobId;
  }

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.search) {
    const s = queryParams.search.trim();
    filter.$or = [
      { 'candidateSnapshot.fullName': { $regex: s, $options: 'i' } },
      { 'candidateSnapshot.email': { $regex: s, $options: 'i' } },
      { 'candidateSnapshot.headline': { $regex: s, $options: 'i' } },
      { 'candidateSnapshot.skills': { $in: [new RegExp(s, 'i')] } },
    ];
  }

  let sort = { appliedAt: -1 };
  if (queryParams.sort) {
    const sortVal = queryParams.sort.toString().toLowerCase();
    if (sortVal === 'oldest') sort = { appliedAt: 1 };
    else if (sortVal === 'rating') sort = { rating: -1, appliedAt: -1 };
  }

  const [applications, totalCount] = await Promise.all([
    Application.find(filter)
      .populate('jobId', 'title department status')
      .populate('candidateId', 'fullName email phone headline avatarUrl skills experienceYears resumeUrl')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    applications,
    pagination: {
      currentPage: page,
      limit,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get Single Application for Company
 */
export const getCompanyApplicationById = async (applicationId, companyId) => {
  const application = await Application.findOne({
    _id: applicationId,
    companyId,
    isDeleted: false,
  })
    .populate('jobId', 'title department description requiredSkills status')
    .populate('candidateId', 'fullName email phone headline bio skills experience education avatarUrl resumeUrl socialLinks');

  if (!application) {
    throw new AppError('Application record not found or unauthorized.', 404);
  }

  return application;
};

/**
 * Update Application Status (Company)
 */
export const updateApplicationStatus = async (applicationId, companyId, { status, notes, interviewDate }) => {
  const application = await Application.findOne({
    _id: applicationId,
    companyId,
    isDeleted: false,
  });

  if (!application) {
    throw new AppError('Application record not found or unauthorized.', 404);
  }

  application.status = status;
  application.lastUpdated = new Date();

  if (notes !== undefined) {
    application.notes = notes.trim();
  }

  if (status === APPLICATION_STATUS.INTERVIEW_SCHEDULED && interviewDate) {
    application.interviewScheduled = true;
    application.interviewDate = new Date(interviewDate);
  }

  await application.save();

  // Automatic Notification for Candidate on Status Change
  if (status === APPLICATION_STATUS.SHORTLISTED) {
    createNotificationService({
      receiverId: application.candidateId,
      receiverRole: 'candidate',
      senderId: companyId,
      senderRole: 'company',
      title: 'Application Shortlisted',
      message: `Your application has been shortlisted by the employer!`,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
      priority: 'high',
      metadata: { applicationId: application._id, jobId: application.jobId, status },
    }).catch((err) => console.error('Auto-Notification Error (Shortlisted):', err.message));
  } else if (status === APPLICATION_STATUS.REJECTED) {
    createNotificationService({
      receiverId: application.candidateId,
      receiverRole: 'candidate',
      senderId: companyId,
      senderRole: 'company',
      title: 'Application Status Update',
      message: `Your application status has been updated to Rejected.`,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
      priority: 'medium',
      metadata: { applicationId: application._id, jobId: application.jobId, status },
    }).catch((err) => console.error('Auto-Notification Error (Rejected):', err.message));
  } else if (status === APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
    createNotificationService({
      receiverId: application.candidateId,
      receiverRole: 'candidate',
      senderId: companyId,
      senderRole: 'company',
      title: 'Interview Scheduled',
      message: `An interview has been scheduled for your application.`,
      type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
      priority: 'urgent',
      metadata: {
        applicationId: application._id,
        jobId: application.jobId,
        interviewDate: application.interviewDate,
      },
    }).catch((err) => console.error('Auto-Notification Error (Interview Scheduled):', err.message));
  }

  return application;
};

/**
 * Rate Candidate Application (Company)
 */
export const updateApplicationRating = async (applicationId, companyId, rating) => {
  const application = await Application.findOne({
    _id: applicationId,
    companyId,
    isDeleted: false,
  });

  if (!application) {
    throw new AppError('Application record not found or unauthorized.', 404);
  }

  application.rating = rating;
  application.lastUpdated = new Date();

  await application.save();
  return application;
};

/**
 * Provide Feedback for Application (Company)
 */
export const updateApplicationFeedback = async (applicationId, companyId, feedback) => {
  const application = await Application.findOne({
    _id: applicationId,
    companyId,
    isDeleted: false,
  });

  if (!application) {
    throw new AppError('Application record not found or unauthorized.', 404);
  }

  application.feedback = feedback.trim();
  application.lastUpdated = new Date();

  await application.save();
  return application;
};
