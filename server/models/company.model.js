import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: [ROLES.COMPANY],
      default: ROLES.COMPANY,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // Company Profile Fields
    website: { type: String, default: '', trim: true },
    industry: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    companySize: {
      type: String,
      enum: ['', '1-10', '11-50', '51-200', '201-500', '500+'],
      default: '',
    },
    logoUrl: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        if (ret.logoUrl && (ret.logoUrl.includes('cloudinary.com/demo') || ret.logoUrl.includes('mock_'))) {
          ret.logoUrl = '';
        }
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        if (ret.logoUrl && (ret.logoUrl.includes('cloudinary.com/demo') || ret.logoUrl.includes('mock_'))) {
          ret.logoUrl = '';
        }
        return ret;
      },
    },
  }
);

// Pre-save hook to hash password before saving
companySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
companySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Account Lockout check method (5 failed attempts locks for 15 minutes)
companySchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment failed login attempts
companySchema.methods.incFailedLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + 15 * 60 * 1000) };
  }

  return await this.updateOne(updates);
};

// Reset failed login attempts on successful login
companySchema.methods.resetFailedLoginAttempts = async function () {
  return await this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

export const Company = mongoose.model('Company', companySchema);
