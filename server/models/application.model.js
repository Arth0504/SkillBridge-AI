import mongoose from 'mongoose';

export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEW_COMPLETED: 'Interview Completed',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

const candidateSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    headline: { type: String, default: '', trim: true },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0 },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate ID is required'],
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume URL is required'],
      trim: true,
    },
    resumePublicId: {
      type: String,
      default: '',
      trim: true,
    },
    coverLetter: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
      index: true,
    },
    candidateSnapshot: {
      type: candidateSnapshotSchema,
      default: () => ({}),
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    notes: {
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
    interviewScheduled: {
      type: Boolean,
      default: false,
    },
    interviewDate: {
      type: Date,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    isWithdrawn: {
      type: Boolean,
      default: false,
    },
    withdrawnAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Prevent multiple active applications for same job by same candidate
applicationSchema.index({ candidateId: 1, jobId: 1, isDeleted: 1 }, { unique: true });

// Performance Query Indexes
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ candidateId: 1, status: 1 });

export const Application = mongoose.model('Application', applicationSchema);
