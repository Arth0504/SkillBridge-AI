import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      index: true,
    },
    userModel: {
      type: String,
      enum: ['Candidate', 'Company', 'System', 'Unknown'],
      default: 'Unknown',
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'ACCOUNT_LOCKED',
        'PASSWORD_RESET_REQUEST',
        'PASSWORD_RESET_SUCCESS',
        'TOKEN_REFRESH',
        'SESSION_REVOKED',
        'SECURITY_BREACH_DETECTED',
        'UNAUTHORIZED_ACCESS_ATTEMPT',
      ],
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
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
