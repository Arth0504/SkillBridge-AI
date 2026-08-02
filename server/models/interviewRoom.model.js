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
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure uuid property mirrors roomId
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

