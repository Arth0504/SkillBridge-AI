import mongoose from 'mongoose';
import { Interview, INTERVIEW_STATUS } from '../models/interview.model.js';
import { Application, APPLICATION_STATUS } from '../models/application.model.js';
import { AppError } from '../utils/AppError.js';
import { createNotificationService } from './notification.service.js';
import { NOTIFICATION_TYPES } from '../models/notification.model.js';

/**
 * 1. Schedule New Interview (Company Only)
 */
export const createInterviewService = async (companyIdStr, payload) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);
  const { applicationId } = payload;

  // Verify Application existence & Company ownership
  const application = await Application.findOne({
    _id: applicationId,
    companyId,
    isDeleted: false,
  }).populate('jobId', 'title department');

  if (!application) {
    throw new AppError('Application not found or access denied.', 404);
  }

  // Business Rule: Cannot schedule interview for rejected applications
  if (application.status === APPLICATION_STATUS.REJECTED) {
    throw new AppError('Cannot schedule an interview for a rejected application.', 400);
  }

  const scheduledDate = new Date(payload.scheduledDate);

  const interview = await Interview.create({
    applicationId: application._id,
    candidateId: application.candidateId,
    companyId,
    jobId: application.jobId._id,
    interviewType: payload.interviewType || 'Technical',
    round: payload.round || 1,
    title: payload.title.trim(),
    description: payload.description ? payload.description.trim() : '',
    scheduledDate,
    startTime: payload.startTime.trim(),
    endTime: payload.endTime.trim(),
    meetingLink: payload.meetingLink ? payload.meetingLink.trim() : '',
    meetingPlatform: payload.meetingPlatform || 'Google Meet',
    status: INTERVIEW_STATUS.SCHEDULED,
    interviewerName: payload.interviewerName ? payload.interviewerName.trim() : '',
    interviewerEmail: payload.interviewerEmail ? payload.interviewerEmail.trim() : '',
    notes: payload.notes ? payload.notes.trim() : '',
    attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
  });

  // Update Application status
  application.status = APPLICATION_STATUS.INTERVIEW_SCHEDULED;
  application.interviewScheduled = true;
  application.interviewDate = scheduledDate;
  application.lastUpdated = new Date();
  await application.save();

  // Trigger Automatic Candidate Notification (Interview Scheduled)
  createNotificationService({
    receiverId: application.candidateId,
    receiverRole: 'candidate',
    senderId: companyId,
    senderRole: 'company',
    title: 'Interview Scheduled',
    message: `An interview "${interview.title}" has been scheduled for position "${application.jobId.title}".`,
    type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
    priority: 'urgent',
    metadata: {
      interviewId: interview._id,
      applicationId: application._id,
      jobId: application.jobId._id,
      jobTitle: application.jobId.title,
      scheduledDate,
      startTime: interview.startTime,
      meetingLink: interview.meetingLink,
    },
  }).catch((err) => console.error('Auto-Notification Error (Interview Scheduled):', err.message));

  return await Interview.findById(interview._id)
    .populate('candidateId', 'fullName email phone headline resumeUrl')
    .populate('jobId', 'title department status')
    .populate('companyId', 'companyName logoUrl location');
};

/**
 * 2. Update Interview Details / Reschedule (Company Only)
 */
export const updateInterviewService = async (interviewId, companyIdStr, payload) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);

  const interview = await Interview.findOne({
    _id: interviewId,
    companyId,
    isDeleted: false,
  });

  if (!interview) {
    throw new AppError('Interview record not found or access denied.', 404);
  }

  let isRescheduled = false;

  if (payload.scheduledDate || payload.startTime) {
    const newDate = payload.scheduledDate ? new Date(payload.scheduledDate) : interview.scheduledDate;
    if (newDate.getTime() !== interview.scheduledDate.getTime() || (payload.startTime && payload.startTime !== interview.startTime)) {
      isRescheduled = true;
      interview.status = INTERVIEW_STATUS.RESCHEDULED;
    }
  }

  const allowedFields = [
    'title',
    'description',
    'interviewType',
    'round',
    'scheduledDate',
    'startTime',
    'endTime',
    'meetingLink',
    'meetingPlatform',
    'interviewerName',
    'interviewerEmail',
    'notes',
    'attachments',
  ];

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      if (field === 'scheduledDate') {
        interview.scheduledDate = new Date(payload.scheduledDate);
      } else {
        interview[field] = payload[field];
      }
    }
  });

  await interview.save();

  // If date updated, sync with Application record
  if (payload.scheduledDate) {
    await Application.findByIdAndUpdate(interview.applicationId, {
      interviewDate: interview.scheduledDate,
      lastUpdated: new Date(),
    });
  }

  // Trigger Automatic Candidate Notification (Interview Rescheduled)
  if (isRescheduled) {
    createNotificationService({
      receiverId: interview.candidateId,
      receiverRole: 'candidate',
      senderId: companyId,
      senderRole: 'company',
      title: 'Interview Rescheduled',
      message: `Your interview "${interview.title}" has been rescheduled to ${new Date(interview.scheduledDate).toLocaleDateString()} at ${interview.startTime}.`,
      type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
      priority: 'urgent',
      metadata: {
        interviewId: interview._id,
        scheduledDate: interview.scheduledDate,
        startTime: interview.startTime,
        meetingLink: interview.meetingLink,
      },
    }).catch((err) => console.error('Auto-Notification Error (Interview Rescheduled):', err.message));
  }

  return await Interview.findById(interview._id)
    .populate('candidateId', 'fullName email phone headline')
    .populate('jobId', 'title department')
    .populate('companyId', 'companyName logoUrl');
};

/**
 * 3. Update Interview Status (Company Only)
 */
export const updateInterviewStatusService = async (interviewId, companyIdStr, status) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);

  const interview = await Interview.findOne({
    _id: interviewId,
    companyId,
    isDeleted: false,
  });

  if (!interview) {
    throw new AppError('Interview record not found or access denied.', 404);
  }

  interview.status = status;
  await interview.save();

  // Sync status with Application
  if (status === INTERVIEW_STATUS.COMPLETED) {
    await Application.findByIdAndUpdate(interview.applicationId, {
      status: APPLICATION_STATUS.INTERVIEW_COMPLETED,
      lastUpdated: new Date(),
    });
  }

  // Trigger Automatic Candidate Notifications
  let notifType = NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED;
  let notifTitle = `Interview ${status}`;
  let notifMsg = `Your interview "${interview.title}" status is now ${status}.`;

  if (status === INTERVIEW_STATUS.CANCELLED) {
    notifType = NOTIFICATION_TYPES.INTERVIEW_CANCELLED;
    notifTitle = 'Interview Cancelled';
    notifMsg = `Your scheduled interview "${interview.title}" has been cancelled.`;
  } else if (status === INTERVIEW_STATUS.COMPLETED) {
    notifTitle = 'Interview Completed';
    notifMsg = `Your interview "${interview.title}" has been marked as Completed.`;
  }

  createNotificationService({
    receiverId: interview.candidateId,
    receiverRole: 'candidate',
    senderId: companyId,
    senderRole: 'company',
    title: notifTitle,
    message: notifMsg,
    type: notifType,
    priority: 'high',
    metadata: { interviewId: interview._id, status },
  }).catch((err) => console.error('Auto-Notification Error (Status Update):', err.message));

  return interview;
};

/**
 * 4. Submit Interview Feedback & Rating (Company Only)
 */
export const addInterviewFeedbackService = async (interviewId, companyIdStr, { feedback, rating, result, notes }) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);

  const interview = await Interview.findOne({
    _id: interviewId,
    companyId,
    isDeleted: false,
  });

  if (!interview) {
    throw new AppError('Interview record not found or access denied.', 404);
  }

  if (feedback !== undefined) interview.feedback = feedback.trim();
  if (rating !== undefined) interview.rating = Number(rating);
  if (result !== undefined) interview.result = result;
  if (notes !== undefined) interview.notes = notes.trim();

  await interview.save();

  // If rating or feedback added, sync application rating/feedback
  if (feedback || rating) {
    await Application.findByIdAndUpdate(interview.applicationId, {
      rating: interview.rating,
      feedback: interview.feedback,
      lastUpdated: new Date(),
    });
  }

  return interview;
};

/**
 * 5. Get Company Interviews List
 */
export const getCompanyInterviewsService = async (companyIdStr, query = {}) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);
  const { status, interviewType, startDate, endDate } = query;
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { companyId, isDeleted: false };

  if (status) filter.status = status;
  if (interviewType) filter.interviewType = interviewType;

  if (startDate || endDate) {
    filter.scheduledDate = {};
    if (startDate) filter.scheduledDate.$gte = new Date(startDate);
    if (endDate) filter.scheduledDate.$lte = new Date(endDate);
  }

  const [interviews, totalItems] = await Promise.all([
    Interview.find(filter)
      .populate('candidateId', 'fullName email phone headline skills experienceYears resumeUrl')
      .populate('jobId', 'title department status')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Interview.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
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

/**
 * 6. Get Candidate Interviews List (Read-only)
 */
export const getCandidateInterviewsService = async (candidateIdStr, query = {}) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const { status, interviewType, startDate, endDate } = query;
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { candidateId, isDeleted: false };

  if (status) filter.status = status;
  if (interviewType) filter.interviewType = interviewType;

  if (startDate || endDate) {
    filter.scheduledDate = {};
    if (startDate) filter.scheduledDate.$gte = new Date(startDate);
    if (endDate) filter.scheduledDate.$lte = new Date(endDate);
  }

  const [interviews, totalItems] = await Promise.all([
    Interview.find(filter)
      .populate('companyId', 'companyName logoUrl location industry website')
      .populate('jobId', 'title department workMode employmentType')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Interview.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
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

/**
 * 7. Get Interview Details by ID
 */
export const getInterviewByIdService = async (interviewId, userIdStr, userRole) => {
  const filter = { _id: interviewId, isDeleted: false };
  if (userRole === 'company') {
    filter.companyId = new mongoose.Types.ObjectId(userIdStr);
  } else if (userRole === 'candidate') {
    filter.candidateId = new mongoose.Types.ObjectId(userIdStr);
  }

  const interview = await Interview.findOne(filter)
    .populate('candidateId', 'fullName email phone headline skills experienceYears resumeUrl')
    .populate('companyId', 'companyName logoUrl location industry website description')
    .populate('jobId', 'title department description workMode employmentType status')
    .populate('applicationId', 'status coverLetter appliedAt')
    .lean();

  if (!interview) {
    throw new AppError('Interview record not found or access denied.', 404);
  }

  return interview;
};
