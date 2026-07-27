import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
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
      default: 'Technical',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    expectedKeyPoints: {
      type: [String],
      default: [],
    },
    answerText: {
      type: String,
      default: null,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
    evaluation: {
      technicalAccuracy: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      grammar: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      professionalism: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      feedbackText: { type: String, default: '' },
      followUpRequired: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    resumeAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeAnalysis',
      default: null,
    },
    interviewType: {
      type: String,
      default: 'Mixed',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Architect', 'Executive'],
      default: 'Senior',
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Abandoned'],
      default: 'In Progress',
      index: true,
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    technicalScore: {
      type: Number,
      default: 0,
    },
    communicationScore: {
      type: Number,
      default: 0,
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    grammarScore: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // duration in seconds
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    feedback: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      topImprovements: { type: [String], default: [] },
      recruiterFeedback: { type: String, default: '' },
      hiringRecommendation: { type: String, default: 'Pending' },
      readyForInterview: { type: Boolean, default: false },
    },
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

interviewSessionSchema.index({ candidateId: 1, isDeleted: 1, createdAt: -1 });

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
