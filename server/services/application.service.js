import { Application, APPLICATION_STATUS } from '../models/application.model.js';
import { Job } from '../models/job.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';
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

  const isEmailVerificationRequired = process.env.EMAIL_VERIFICATION_REQUIRED === 'true';
  if (isEmailVerificationRequired && !candidate.isEmailVerified) {
    throw new AppError('Your email address must be verified before applying to jobs.', 403);
  }

  const isProfileReady = candidate.profileCompleted || Boolean(candidate.resumeUrl) || Boolean(customResumeUrl) || (candidate.skills && candidate.skills.length > 0);
  if (!isProfileReady) {
    throw new AppError('Please complete your profile or upload a resume before applying to jobs.', 400);
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
    resumeUrl: resumeUrl,
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

  // Attach matching interview meeting details
  const { Interview } = await import('../models/interview.model.js');
  const appIds = rawApplications.map((a) => a._id);
  const interviews = await Interview.find({ applicationId: { $in: appIds }, isDeleted: false }).lean();
  const interviewMap = {};
  interviews.forEach((iv) => {
    interviewMap[iv.applicationId.toString()] = iv;
  });

  const applications = rawApplications.map((app) => {
    if (!visibleFeedbackStatuses.includes(app.status)) {
      app.feedback = ''; // Hide unreleased feedback
    }
    const matchingIv = interviewMap[app._id.toString()];
    if (matchingIv) {
      app.interviewDate = matchingIv.scheduledDate;
      app.meetingLink = matchingIv.meetingLink;
      app.roomId = matchingIv.meetingLink ? matchingIv.meetingLink.replace('/interview/room/', '') : '';
      app.interviewRoomId = app.roomId;
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
  const limit = Math.max(1, Math.min(1000, parseInt(queryParams.limit, 10) || 100));
  const skip = (page - 1) * limit;

  const filter = { companyId, isDeleted: { $ne: true } };

  if (queryParams.jobId) {
    filter.jobId = queryParams.jobId;
  }

  if (queryParams.status) {
    filter.status = queryParams.status;
  } else if (queryParams.excludeRejected === 'true' || queryParams.excludeRejected === true) {
    filter.status = { $ne: APPLICATION_STATUS.REJECTED };
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

  let sort = { appliedAt: -1, createdAt: -1 };
  if (queryParams.sort) {
    const sortVal = queryParams.sort.toString().toLowerCase();
    if (sortVal === 'oldest') sort = { appliedAt: 1, createdAt: 1 };
    else if (sortVal === 'rating') sort = { rating: -1, appliedAt: -1, createdAt: -1 };
  }

  const [applications, totalCount] = await Promise.all([
    Application.find(filter)
      .populate('jobId', 'title department status location city state country employmentType workMode createdAt')
      .populate('candidateId', 'fullName email phone headline avatarUrl skills experienceYears resumeUrl')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  const formattedApplications = applications.map((app) => {
    const finalResumeUrl =
      app.resumeUrl ||
      app.candidateId?.resumeUrl ||
      app.candidateSnapshot?.resumeUrl ||
      '';

    const cand = app.candidateId && typeof app.candidateId === 'object' ? app.candidateId : {};
    const candName = cand.fullName || app.candidateSnapshot?.fullName || 'Candidate Name';
    const candEmail = cand.email || app.candidateSnapshot?.email || '';
    const candPhone = cand.phone || app.candidateSnapshot?.phone || '';

    const jobObj = app.jobId && typeof app.jobId === 'object' ? app.jobId : {};
    const jobTitle = jobObj.title || 'Untitled Job Post';

    const locStr = [
      jobObj.location?.city || jobObj.city,
      jobObj.location?.state || jobObj.state,
      jobObj.location?.country || jobObj.country,
    ]
      .filter(Boolean)
      .join(', ') || jobObj.workMode || 'Remote';

    return {
      ...app,
      resumeUrl: finalResumeUrl,
      candidate: {
        _id: cand._id || app.candidateId,
        fullName: candName,
        email: candEmail,
        phone: candPhone,
        headline: cand.headline || app.candidateSnapshot?.headline || 'Software Engineer',
        avatarUrl: cand.avatarUrl || '',
        skills: cand.skills?.length ? cand.skills : (app.candidateSnapshot?.skills || []),
        experienceYears: cand.experienceYears ?? app.candidateSnapshot?.experienceYears ?? 0,
      },
      job: {
        _id: jobObj._id || app.jobId,
        title: jobTitle,
        department: jobObj.department || 'Engineering',
        status: jobObj.status || 'open',
        location: locStr,
        employmentType: jobObj.employmentType || 'Full Time',
        workMode: jobObj.workMode || 'Remote',
        createdAt: jobObj.createdAt || app.createdAt,
      },
    };
  });

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    applications: formattedApplications,
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

  const appObj = application.toObject ? application.toObject() : application;
  appObj.resumeUrl =
    appObj.resumeUrl ||
    appObj.candidateId?.resumeUrl ||
    appObj.candidateSnapshot?.resumeUrl ||
    '';

  return appObj;
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

  // Push timeline audit entry
  application.timeline = application.timeline || [];
  application.timeline.push({
    status,
    date: new Date(),
    note: notes || `Application moved to ${status} stage`,
    updatedBy: 'Company Recruiter',
  });

  await application.save();

  // Populate candidate and job for email dispatches
  const [candDoc, jobDoc, compDoc] = await Promise.all([
    Candidate.findById(application.candidateId),
    Job.findById(application.jobId),
    Company.findById(companyId),
  ]);

  const candidateEmail = candDoc?.email;
  const candidateName = candDoc?.fullName || 'Candidate';
  const jobTitle = jobDoc?.title || 'Position';
  const companyName = compDoc?.companyName || 'Employer';

  // Emit Real-Time Socket Event to Candidate and Company
  try {
    const { getIO, emitNotificationToUser } = await import('../sockets/notification.socket.js');
    const io = getIO();
    if (io) {
      const payload = {
        applicationId: application._id,
        candidateId: application.candidateId,
        companyId: application.companyId,
        jobId: application.jobId,
        status,
        updatedAt: new Date().toISOString(),
      };
      io.emit('application:stage_updated', payload);
      emitNotificationToUser(application.candidateId, 'candidate', 'application:stage_updated', payload);
      emitNotificationToUser(application.companyId, 'company', 'application:stage_updated', payload);
    }
  } catch (err) {
    console.warn('Socket stage emit error:', err.message);
  }

  // Email Automation & Candidate Notification dispatch
  const { emailAutomationService } = await import('./emailAutomation.service.js');

  if (status === APPLICATION_STATUS.SELECTED || status === APPLICATION_STATUS.HIRED) {
    if (candidateEmail) {
      emailAutomationService.sendOfferEmail(candidateEmail, candidateName, jobTitle, companyName)
        .catch((err) => console.error('Auto-Email Error (Selected/Offer):', err.message));
    }
    createNotificationService({
      receiverId: application.candidateId,
      receiverRole: 'candidate',
      senderId: companyId,
      senderRole: 'company',
      title: 'Congratulations! You are Selected 🎉',
      message: `You have been selected for the position of "${jobTitle}" at ${companyName}!`,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
      priority: 'urgent',
      metadata: { applicationId: application._id, jobId: application.jobId, status },
    }).catch((err) => console.error('Auto-Notification Error (Selected):', err.message));

  } else if (status === APPLICATION_STATUS.REJECTED) {
    if (candidateEmail) {
      emailAutomationService.sendRejectionEmail(candidateEmail, candidateName, jobTitle, companyName)
        .catch((err) => console.error('Auto-Email Error (Rejected):', err.message));
    }
    createNotificationService({
      receiverId: application.candidateId,
      receiverRole: 'candidate',
      senderId: companyId,
      senderRole: 'company',
      title: 'Application Status Update',
      message: `Your application for "${jobTitle}" has been updated to Rejected.`,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
      priority: 'medium',
      metadata: { applicationId: application._id, jobId: application.jobId, status },
    }).catch((err) => console.error('Auto-Notification Error (Rejected):', err.message));

  } else if (status === APPLICATION_STATUS.SHORTLISTED) {
    if (candidateEmail) {
      emailAutomationService.sendShortlistedEmail(candidateEmail, candidateName, jobTitle, companyName)
        .catch((err) => console.error('Auto-Email Error (Shortlisted):', err.message));
    }
    createNotificationService({
      receiverId: application.candidateId,
      receiverRole: 'candidate',
      senderId: companyId,
      senderRole: 'company',
      title: 'Application Shortlisted',
      message: `Your application for "${jobTitle}" has been shortlisted!`,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
      priority: 'high',
      metadata: { applicationId: application._id, jobId: application.jobId, status },
    }).catch((err) => console.error('Auto-Notification Error (Shortlisted):', err.message));

  } else {
    createNotificationService({
      receiverId: application.candidateId,
      receiverRole: 'candidate',
      senderId: companyId,
      senderRole: 'company',
      title: `Application Status: ${status}`,
      message: `Your application status for "${jobTitle}" has been updated to ${status}.`,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
      priority: 'medium',
      metadata: { applicationId: application._id, jobId: application.jobId, status },
    }).catch((err) => console.error('Auto-Notification Error (Status Update):', err.message));
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
