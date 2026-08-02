import mongoose from 'mongoose';
import { Interview, INTERVIEW_STATUS } from '../models/interview.model.js';
import { Application, APPLICATION_STATUS } from '../models/application.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Job } from '../models/job.model.js';
import { Company } from '../models/company.model.js';
import { AppError } from '../utils/AppError.js';
import { createNotificationService } from './notification.service.js';
import { NOTIFICATION_TYPES } from '../models/notification.model.js';

/**
 * 1. Schedule New Interview (Company Only)
 */
export const createInterviewService = async (companyIdStr, payload) => {
  if (!companyIdStr || !mongoose.Types.ObjectId.isValid(companyIdStr)) {
    throw new AppError('Invalid Company ID format.', 400);
  }
  const companyId = new mongoose.Types.ObjectId(companyIdStr);
  const { applicationId } = payload;

  if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new AppError('applicationId is required and must be a valid MongoDB ObjectId.', 400);
  }

  // 1. Verify Company exists and is active
  const company = await Company.findById(companyId);
  if (!company) {
    throw new AppError('Company account not found or access denied.', 404);
  }

  // 2. Verify Application exists and belongs to this Company
  const application = await Application.findOne({
    _id: applicationId,
    companyId,
    isDeleted: false,
  });

  if (!application) {
    throw new AppError('Application not found or access denied.', 404);
  }

  // Business Rule: Cannot schedule interview for rejected applications
  if (application.status === APPLICATION_STATUS.REJECTED) {
    throw new AppError('Cannot schedule an interview for a rejected application.', 400);
  }

  // 3. Verify Candidate exists
  const candidate = await Candidate.findById(application.candidateId);
  if (!candidate) {
    throw new AppError('Associated Candidate profile not found.', 404);
  }

  // 4. Verify Job posting exists
  const job = await Job.findById(application.jobId);
  if (!job) {
    throw new AppError('Associated Job posting not found.', 404);
  }

  const scheduledDate = payload.scheduledDate
    ? new Date(payload.scheduledDate)
    : new Date(Date.now() + 2 * 86400000);

  const rawType = payload.interviewType || payload.type || 'Technical';
  let interviewType = 'Technical';
  if (rawType.includes('HR') || rawType.toLowerCase().includes('behavioral')) {
    interviewType = 'HR';
  } else if (rawType.includes('Technical')) {
    interviewType = 'Technical';
  } else if (rawType.includes('Coding')) {
    interviewType = 'Coding';
  } else if (rawType.includes('Managerial')) {
    interviewType = 'Managerial';
  } else if (rawType.includes('Final')) {
    interviewType = 'Final';
  }

  // Create SkillBridge AI Private Video Room with secure UUID
  const cryptoModule = await import('crypto');
  const roomId = cryptoModule.randomUUID();

  const { InterviewRoom } = await import('../models/interviewRoom.model.js');
  await InterviewRoom.create({
    roomId,
    uuid: roomId,
    applicationId: application._id,
    candidateId: candidate._id,
    companyId: company._id,
    jobId: job._id,
    interviewType: interviewType === 'Coding' ? 'Technical' : interviewType,
    scheduledDate,
    scheduledAt: scheduledDate,
    durationMinutes: payload.durationMinutes || 45,
    duration: payload.durationMinutes || 45,
    status: 'scheduled',
    recruiterNotes: payload.notes ? payload.notes.trim() : '',
    notes: payload.notes ? payload.notes.trim() : '',
  });

  const internalRoomLink = `/interview/room/${roomId}`;

  const interview = await Interview.create({
    applicationId: application._id,
    candidateId: candidate._id,
    companyId: company._id,
    jobId: job._id,
    interviewType,
    round: payload.round || 1,
    title: (payload.title || `${interviewType} Evaluation - ${candidate.fullName}`).trim(),
    description: payload.description ? payload.description.trim() : '',
    scheduledDate,
    startTime: payload.startTime ? payload.startTime.trim() : '10:00',
    endTime: payload.endTime ? payload.endTime.trim() : '11:00',
    meetingLink: internalRoomLink,
    meetingPlatform: 'SkillBridge AI Private Room',
    status: INTERVIEW_STATUS.SCHEDULED,
    interviewerName: payload.interviewerName ? payload.interviewerName.trim() : '',
    interviewerEmail: payload.interviewerEmail ? payload.interviewerEmail.trim() : '',
    notes: payload.notes ? payload.notes.trim() : '',
    attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
  });

  // Update Application status & link to interview date
  application.status = APPLICATION_STATUS.INTERVIEW_SCHEDULED;
  application.interviewScheduled = true;
  application.interviewDate = scheduledDate;
  application.lastUpdated = new Date();
  await application.save();

  // 1. Trigger Candidate Email Invitation
  const { emailAutomationService } = await import('./emailAutomation.service.js');
  emailAutomationService.sendInterviewInvitationEmail(
    candidate.email,
    candidate.fullName,
    job.title,
    new Date(scheduledDate).toLocaleDateString(),
    interview.startTime,
    `http://localhost:5173${internalRoomLink}`
  ).catch((err) => console.error('Auto-Email Error (Interview Scheduled):', err.message));

  // 2. Trigger Real-Time Socket.IO event
  try {
    const { getIO } = await import('../sockets/notification.socket.js');
    const io = getIO();
    if (io) {
      io.emit('interview:scheduled', {
        interviewId: interview._id,
        applicationId: application._id,
        candidateId: candidate._id,
        companyId: company._id,
        jobId: job._id,
        roomId,
        roomUrl: internalRoomLink,
        scheduledDate,
        startTime: interview.startTime,
      });
    }
  } catch (err) {
    console.warn('Socket interview emit warning:', err.message);
  }

  // 3. Trigger Automatic Candidate Notification (Interview Scheduled)
  createNotificationService({
    receiverId: candidate._id,
    receiverRole: 'candidate',
    senderId: company._id,
    senderRole: 'company',
    title: 'Private Video Interview Scheduled',
    message: `An interview "${interview.title}" has been scheduled. Join live at ${internalRoomLink}`,
    type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
    priority: 'urgent',
    metadata: {
      interviewId: interview._id,
      applicationId: application._id,
      jobId: job._id,
      jobTitle: job.title,
      scheduledDate,
      startTime: interview.startTime,
      meetingLink: internalRoomLink,
      roomId,
    },
  }).catch((err) => console.error('Auto-Notification Error (Interview Scheduled):', err.message));

  const populatedInterview = await Interview.findById(interview._id)
    .populate('candidateId', 'fullName email phone headline resumeUrl')
    .populate('jobId', 'title department status')
    .populate('companyId', 'companyName logoUrl location');

  return {
    interview: populatedInterview,
    roomId,
  };
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

  if (interview.status === INTERVIEW_STATUS.COMPLETED) {
    throw new AppError('Completed interviews are locked and cannot be edited.', 400);
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

  // Emit Real-Time Socket Event
  try {
    const { getIO, emitNotificationToUser } = await import('../sockets/notification.socket.js');
    const io = getIO();
    if (io) {
      const payload = {
        interviewId: interview._id,
        applicationId: interview.applicationId,
        candidateId: interview.candidateId,
        companyId: interview.companyId,
        status,
        updatedAt: new Date().toISOString(),
      };
      io.emit('interview:status_updated', payload);
      emitNotificationToUser(interview.candidateId, 'candidate', 'interview:status_updated', payload);
      emitNotificationToUser(interview.companyId, 'company', 'interview:status_updated', payload);
    }
  } catch (err) {
    console.warn('Socket interview status emit error:', err.message);
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

/**
 * 8. Soft Delete Interview (Company Only)
 */
export const deleteInterviewService = async (interviewId, companyIdStr) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);

  const interview = await Interview.findOne({
    _id: interviewId,
    companyId,
    isDeleted: false,
  });

  if (!interview) {
    throw new AppError('Interview record not found or access denied.', 404);
  }

  interview.isDeleted = true;
  interview.deletedAt = new Date();
  await interview.save();

  // Cancel associated InterviewRoom
  try {
    const { InterviewRoom } = await import('../models/interviewRoom.model.js');
    if (interview.meetingLink) {
      const roomId = interview.meetingLink.replace('/interview/room/', '');
      await InterviewRoom.updateOne(
        { $or: [{ roomId }, { uuid: roomId }] },
        { $set: { status: 'cancelled' } }
      );
    }
  } catch (err) {
    console.warn('InterviewRoom cancel warning:', err.message);
  }

  // Real-Time Socket Event
  try {
    const { getIO, emitNotificationToUser } = await import('../sockets/notification.socket.js');
    const io = getIO();
    if (io) {
      const payload = {
        interviewId: interview._id,
        applicationId: interview.applicationId,
        candidateId: interview.candidateId,
        companyId: interview.companyId,
        deletedAt: interview.deletedAt,
      };
      io.emit('interview:deleted', payload);
      emitNotificationToUser(interview.candidateId, 'candidate', 'interview:deleted', payload);
      emitNotificationToUser(interview.companyId, 'company', 'interview:deleted', payload);
    }
  } catch (err) {
    console.warn('Socket interview delete emit error:', err.message);
  }

  return { success: true, message: 'Interview deleted successfully.', interviewId: interview._id };
};
