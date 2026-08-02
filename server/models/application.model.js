import mongoose from 'mongoose';
import { cleanResumeUrl } from '../utils/cleaners.js';

export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SCREENING: 'Screening',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEW_COMPLETED: 'Interview Completed',
  TECHNICAL_ROUND: 'Technical Round',
  HR_ROUND: 'HR Round',
  OFFER: 'Offer',
  HIRED: 'Hired',
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
    resumeUrl: { type: String, default: '', trim: true },
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
      default: '',
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
    // AI Evaluation & Scoring Pipeline Fields
    resumeScore: { type: Number, default: null },
    interviewScore: { type: Number, default: null },
    codingScore: { type: Number, default: null },
    communicationScore: { type: Number, default: null },
    matchScore: { type: Number, default: null, index: true },
    hiringRecommendation: {
      type: String,
      enum: ['', 'Highly Recommended', 'Recommended', 'Needs Improvement', 'Not Recommended'],
      default: '',
    },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    timeline: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        updatedBy: { type: String, default: '' },
      },
    ],
    interviewSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', default: null },
    codingSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingAssessment', default: null },

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
    toJSON: {
      transform: (_doc, ret) => {
        ret.resumeUrl = cleanResumeUrl(ret.resumeUrl);
        if (ret.candidateSnapshot) {
          ret.candidateSnapshot.resumeUrl = cleanResumeUrl(ret.candidateSnapshot.resumeUrl);
        }
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        ret.resumeUrl = cleanResumeUrl(ret.resumeUrl);
        if (ret.candidateSnapshot) {
          ret.candidateSnapshot.resumeUrl = cleanResumeUrl(ret.candidateSnapshot.resumeUrl);
        }
        return ret;
      },
    },
  }
);

// Compound Unique Index: Prevent multiple active applications for same job by same candidate
applicationSchema.index({ candidateId: 1, jobId: 1, isDeleted: 1 }, { unique: true });

// Performance Query Indexes
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ candidateId: 1, status: 1 });

export const Application = mongoose.model('Application', applicationSchema);
