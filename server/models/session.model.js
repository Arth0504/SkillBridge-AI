import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userModel: {
      type: String,
      enum: ['Candidate', 'Company'],
      required: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: '',
    },
    deviceInfo: {
      browser: { type: String, default: 'Unknown' },
      os: { type: String, default: 'Unknown' },
      device: { type: String, default: 'Desktop' },
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically purge expired sessions from MongoDB
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ userId: 1, isRevoked: 1 });

export const Session = mongoose.model('Session', sessionSchema);
