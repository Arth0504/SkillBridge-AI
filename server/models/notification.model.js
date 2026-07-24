import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = {
  JOB_APPLIED: 'Job Applied',
  APPLICATION_STATUS_CHANGED: 'Application Status Changed',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEW_CANCELLED: 'Interview Cancelled',
  INTERVIEW_REMINDER: 'Interview Reminder',
  JOB_CLOSED: 'Job Closed',
  JOB_EXPIRED: 'Job Expired',
  NEW_JOB_RECOMMENDATION: 'New Job Recommendation',
  RESUME_APPROVED: 'Resume Approved',
  PROFILE_COMPLETED: 'Profile Completed',
  SYSTEM_NOTIFICATION: 'System Notification',
};

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Receiver ID is required'],
      index: true,
    },
    receiverRole: {
      type: String,
      enum: ['candidate', 'company'],
      required: [true, 'Receiver role is required'],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    senderRole: {
      type: String,
      enum: ['candidate', 'company', 'system'],
      default: 'system',
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: [true, 'Notification type is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(NOTIFICATION_PRIORITIES),
      default: NOTIFICATION_PRIORITIES.MEDIUM,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Compound Indexes
notificationSchema.index({ receiverId: 1, receiverRole: 1, isDeleted: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ receiverId: 1, type: 1, isDeleted: 1 });
notificationSchema.index({ receiverId: 1, priority: 1, isDeleted: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
