import mongoose from 'mongoose';

export const INTERVIEW_TYPES = {
  HR: 'HR',
  TECHNICAL: 'Technical',
  CODING: 'Coding',
  MANAGERIAL: 'Managerial',
  FINAL: 'Final',
};

export const INTERVIEW_STATUS = {
  SCHEDULED: 'Scheduled',
  LIVE: 'Live',
  RESCHEDULED: 'Rescheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

export const MEETING_PLATFORMS = {
  SKILLBRIDGE_ROOM: 'SkillBridge AI Private Room',
};

export const INTERVIEW_RESULTS = {
  PENDING: '',
  PASSED: 'Passed',
  FAILED: 'Failed',
  ON_HOLD: 'On Hold',
  PASSED_TO_NEXT_ROUND: 'Passed to Next Round',
};

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application ID is required'],
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate ID is required'],
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },
    interviewType: {
      type: String,
      enum: Object.values(INTERVIEW_TYPES),
      default: INTERVIEW_TYPES.TECHNICAL,
      required: [true, 'Interview type is required'],
    },
    round: {
      type: Number,
      default: 1,
      min: [1, 'Round must be at least 1'],
    },
    title: {
      type: String,
      required: [true, 'Interview title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    meetingPlatform: {
      type: String,
      enum: Object.values(MEETING_PLATFORMS),
      default: MEETING_PLATFORMS.SKILLBRIDGE_ROOM,
    },
    status: {
      type: String,
      enum: Object.values(INTERVIEW_STATUS),
      default: INTERVIEW_STATUS.SCHEDULED,
      index: true,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    result: {
      type: String,
      enum: Object.values(INTERVIEW_RESULTS),
      default: INTERVIEW_RESULTS.PENDING,
    },
    interviewerName: {
      type: String,
      default: '',
      trim: true,
    },
    interviewerEmail: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
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

// Performance Indexes
interviewSchema.index({ companyId: 1, status: 1, scheduledDate: 1 });
interviewSchema.index({ candidateId: 1, status: 1, scheduledDate: 1 });
interviewSchema.index({ applicationId: 1, status: 1, isDeleted: 1 });

export const Interview = mongoose.model('Interview', interviewSchema);
