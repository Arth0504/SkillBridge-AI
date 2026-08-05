import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    technicalAccuracy: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    grammar: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
    professionalism: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    feedbackText: { type: String, default: '' },
    followUpRequired: { type: Boolean, default: false },
    suggestedDifficultyAdjustment: { type: String, default: 'Maintain' },
    keywordsMatched: { type: [String], default: [] },
    keywordsMissed: { type: [String], default: [] },
    isShortAnswer: { type: Boolean, default: false },
    wasSkipped: { type: Boolean, default: false },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    topic: { type: String, default: '' },
    category: { type: String, default: 'Technical' },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Advanced', 'Scenario Based', 'System Design'],
      default: 'Medium',
    },
    expectedKeyPoints: { type: [String], default: [] },
    interviewerContext: { type: String, default: '' },
    answerText: { type: String, default: null },
    answeredAt: { type: Date, default: null },
    timeTakenSeconds: { type: Number, default: 0 },
    wasSkipped: { type: Boolean, default: false },
    skippedReason: { type: String, default: '' },
    evaluation: { type: evaluationSchema, default: () => ({}) },
  },
  { _id: false }
);

const integrityEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'FULLSCREEN_EXIT',
        'TAB_SWITCH',
        'WINDOW_BLUR',
        'CAMERA_OFF',
        'MIC_MUTED',
        'COPY_PASTE',
        'CONTEXT_MENU',
        'DEVTOOLS_OPEN',
      ],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    questionIndex: { type: Number, default: 0 },
    penaltyApplied: { type: Number, default: 0 },
    details: { type: String, default: '' },
  },
  { _id: false }
);

const warningSchema = new mongoose.Schema(
  {
    warningNumber: { type: Number, required: true },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    questionIndex: { type: Number, default: 0 },
  },
  { _id: false }
);

const conversationTurnSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['interviewer', 'candidate'], required: true },
    content: { type: String, required: true },
    questionIndex: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
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
    interviewType: { type: String, default: 'Mixed' },
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
      enum: ['Not Started', 'In Progress', 'Completed', 'Abandoned', 'Terminated'],
      default: 'In Progress',
      index: true,
    },
    terminationReason: { type: String, default: '' },
    totalQuestions: { type: Number, default: 5 },
    currentQuestionIndex: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    maxSkipsAllowed: { type: Number, default: 2 },
    questions: { type: [questionSchema], default: [] },

    // Conversation memory for context-aware follow-ups
    conversationHistory: { type: [conversationTurnSchema], default: [] },

    // Integrity tracking
    integrityScore: { type: Number, default: 100, min: 0, max: 100 },
    integrityEvents: { type: [integrityEventSchema], default: [] },
    warnings: { type: [warningSchema], default: [] },
    warningCount: { type: Number, default: 0 },
    maxWarningsAllowed: { type: Number, default: 3 },
    autoTerminated: { type: Boolean, default: false },

    // Scores
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    grammarScore: { type: Number, default: 0 },
    problemSolvingScore: { type: Number, default: 0 },

    timeTaken: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },

    feedback: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      topImprovements: { type: [String], default: [] },
      recruiterFeedback: { type: String, default: '' },
      hiringRecommendation: { type: String, default: 'Pending' },
      readyForInterview: { type: Boolean, default: false },
      integrityNote: { type: String, default: '' },
    },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ candidateId: 1, isDeleted: 1, createdAt: -1 });
interviewSessionSchema.index({ candidateId: 1, status: 1 });

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
