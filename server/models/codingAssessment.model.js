import mongoose from 'mongoose';

const codingQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'Output Prediction', 'Debugging', 'Coding Challenge'],
      default: 'Coding Challenge',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    language: {
      type: String,
      default: 'JavaScript',
    },
    options: {
      type: [String],
      default: [],
    },
    initialCode: {
      type: String,
      default: '',
    },
    submittedAnswer: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    evaluation: {
      correctness: { type: Number, default: 0 },
      timeComplexity: { type: String, default: 'N/A' },
      spaceComplexity: { type: String, default: 'N/A' },
      codeQuality: { type: Number, default: 0 },
      bestPractices: { type: Number, default: 0 },
      readability: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      feedbackText: { type: String, default: '' },
      improvementSuggestions: { type: [String], default: [] },
    },
  },
  { _id: false }
);

const codingAssessmentSchema = new mongoose.Schema(
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
    language: {
      type: String,
      enum: ['JavaScript', 'Python', 'Java', 'C++', 'SQL'],
      default: 'JavaScript',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
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
      type: [codingQuestionSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    feedback: {
      overallScore: { type: Number, default: 0 },
      codeQualityScore: { type: Number, default: 0 },
      correctnessScore: { type: Number, default: 0 },
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      topImprovements: { type: [String], default: [] },
      summary: { type: String, default: '' },
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
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

codingAssessmentSchema.index({ candidateId: 1, isDeleted: 1, createdAt: -1 });

export const CodingAssessment = mongoose.model('CodingAssessment', codingAssessmentSchema);
