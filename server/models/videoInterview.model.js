import mongoose from 'mongoose';

const videoQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['HR', 'Technical', 'Behavioral', 'Managerial', 'Custom'],
      default: 'HR',
    },
    timeLimitSeconds: {
      type: Number,
      default: 120,
    },
    expectedKeyPoints: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const videoResponseSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true, // Cloudinary Video URL
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    fileSizeBytes: {
      type: Number,
      default: 0,
    },
    resolution: {
      type: String,
      default: '1280x720',
    },
    transcriptText: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    evaluation: {
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      grammar: { type: Number, default: 0 },
      professionalism: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      technicalAccuracy: { type: Number, default: 0 },
      bodyLanguageScore: { type: Number, default: 85 }, // future visual plugin
      eyeContactScore: { type: Number, default: 85 },   // future visual plugin
      overallResponseScore: { type: Number, default: 0 },
      feedbackText: { type: String, default: '' },
      keyTakeaways: { type: [String], default: [] },
    },
  },
  { _id: false }
);

const integrityEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['FULLSCREEN_EXIT', 'TAB_SWITCH', 'WINDOW_BLUR', 'CAMERA_OFF', 'MIC_MUTED', 'COPY_PASTE', 'CONTEXT_MENU', 'KEYBOARD_BLOCK'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    questionIndex: { type: Number, default: 0 },
    penaltyApplied: { type: Number, default: 0 },
  },
  { _id: false }
);

const videoInterviewSchema = new mongoose.Schema(
  {
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
    interviewSessionId: {
      type: String,
      default: null,
    },
    sessionToken: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Interview title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Expired'],
      default: 'Scheduled',
      index: true,
    },
    questions: {
      type: [videoQuestionSchema],
      default: [],
    },
    videoResponses: {
      type: [videoResponseSchema],
      default: [],
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    communicationScore: {
      type: Number,
      default: 0,
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    professionalismScore: {
      type: Number,
      default: 0,
    },
    technicalScore: {
      type: Number,
      default: 0,
    },
    bodyLanguageScore: {
      type: Number,
      default: 85,
    },
    eyeContactScore: {
      type: Number,
      default: 85,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days expiration
    },
    feedback: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      topImprovements: { type: [String], default: [] },
      recruiterSummary: { type: String, default: '' },
      hiringRecommendation: { type: String, default: 'Pending' },
      readyForHire: { type: Boolean, default: false },
    },
    // Integrity & Proctoring
    integrityScore: { type: Number, default: 100, min: 0, max: 100 },
    integrityEvents: { type: [integrityEventSchema], default: [] },
    warningCount: { type: Number, default: 0 },
    warnings: [
      {
        reason: { type: String },
        timestamp: { type: Date, default: Date.now },
        questionIndex: { type: Number, default: 0 },
        _id: false,
      },
    ],
    autoTerminated: { type: Boolean, default: false },
    terminationReason: { type: String, default: '' },
    skippedCount: { type: Number, default: 0 },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

videoInterviewSchema.index({ candidateId: 1, isDeleted: 1, createdAt: -1 });
videoInterviewSchema.index({ companyId: 1, isDeleted: 1, createdAt: -1 });
videoInterviewSchema.index({ jobId: 1, isDeleted: 1 });

export const VideoInterview = mongoose.model('VideoInterview', videoInterviewSchema);
