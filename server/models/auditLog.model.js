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
    role: {
      type: String,
      enum: ['candidate', 'company', 'admin', 'super-admin', 'system', 'unknown'],
      default: 'unknown',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetCollection: {
      type: String,
      default: '',
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
      index: true,
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
    country: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    city: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    requestId: {
      type: String,
      default: '',
      index: true,
    },
    beforeData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    afterData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS',
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Compound Indexes & 2-Year Automatic TTL Retention
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetCollection: 1, targetId: 1 });
auditLogSchema.index({ country: 1, city: 1 });
auditLogSchema.index({ createdAt: 1 }, { expires: '730d' }); // Automatically retain audit logs for 2 years (730 days)

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
