import mongoose from 'mongoose';
import crypto from 'crypto';

const interviewRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },
    uuid: {
      type: String,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    interviewType: {
      type: String,
      enum: ['Technical', 'HR', 'Final', 'Screening', 'Coding'],
      default: 'Technical',
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledAt: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    duration: {
      type: Number,
      default: 45,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'expired', 'cancelled'],
      default: 'scheduled',
    },
    startTime: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    recruiterNotes: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    evaluationScores: {
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      overallScore: { type: Number, default: 0 },
      recommendation: {
        type: String,
        enum: ['Yes', 'Maybe', 'No', 'Pending', ''],
        default: '',
      },
    },
    chatMessages: [
      {
        senderId: String,
        senderName: String,
        role: String,
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    recording: {
      status: { type: String, enum: ['idle', 'recording', 'stopped', 'completed'], default: 'idle' },
      recordingUrl: { type: String, default: '' },
      startedAt: { type: Date },
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    sessionToken: {
      type: String,
      default: () => crypto.randomBytes(24).toString('hex'),
    },
    integrityLog: [
      {
        eventType: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: String, default: '' },
        userRole: { type: String, default: 'candidate' },
      },
    ],
    auditLog: [
      {
        eventType: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: String, default: '' },
        userRole: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for room active state
interviewRoomSchema.virtual('isActive').get(function () {
  return this.status === 'scheduled' || this.status === 'live';
});

// Pre-save hook to ensure uuid, timestamps, and notes properties mirror correctly
interviewRoomSchema.pre('save', function (next) {
  if (!this.uuid) {
    this.uuid = this.roomId;
  }
  if (!this.scheduledAt && this.scheduledDate) {
    this.scheduledAt = this.scheduledDate;
  }
  if (!this.duration) {
    this.duration = this.durationMinutes;
  }
  if (!this.notes && this.recruiterNotes) {
    this.notes = this.recruiterNotes;
  }
  if (!this.startTime && this.startedAt) {
    this.startTime = this.startedAt;
  }
  if (!this.startedAt && this.startTime) {
    this.startedAt = this.startTime;
  }
  if (!this.endTime && this.endedAt) {
    this.endTime = this.endedAt;
  }
  if (!this.endedAt && this.endTime) {
    this.endedAt = this.endTime;
  }
  next();
});

// Helper method to check if user has access to this room
interviewRoomSchema.methods.hasUserAccess = function (userId, userRole) {
  if (!userId) return false;
  if (userRole === 'admin') return true;
  const uid = userId.toString();
  const candId = this.candidateId?._id ? this.candidateId._id.toString() : this.candidateId?.toString();
  const compId = this.companyId?._id ? this.companyId._id.toString() : this.companyId?.toString();

  if (userRole === 'candidate' && candId === uid) return true;
  if (userRole === 'company' && compId === uid) return true;
  return false;
};

export const InterviewRoom = mongoose.model('InterviewRoom', interviewRoomSchema);

