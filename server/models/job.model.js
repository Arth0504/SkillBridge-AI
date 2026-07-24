import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema(
  {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    isNegotiable: { type: Boolean, default: false },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    country: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      index: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    requiredSkills: {
      type: [String],
      default: [],
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      required: [true, 'Experience level is required'],
      index: true,
    },
    employmentType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance'],
      required: [true, 'Employment type is required'],
      index: true,
    },
    workMode: {
      type: String,
      enum: ['Remote', 'On Site', 'Hybrid'],
      required: [true, 'Work mode is required'],
      index: true,
    },
    salary: {
      type: salarySchema,
      default: () => ({}),
    },
    salaryType: {
      type: String,
      enum: ['yearly', 'monthly', 'hourly', 'project'],
      default: 'yearly',
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    location: {
      type: locationSchema,
      default: () => ({}),
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Openings must be at least 1'],
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'paused', 'expired'],
      default: 'open',
      index: true,
    },
    benefits: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalApplications: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Creator company ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to generate slug if missing
jobSchema.pre('validate', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    const baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
  next();
});

// Text index for search
jobSchema.index(
  {
    title: 'text',
    description: 'text',
    requiredSkills: 'text',
    tags: 'text',
    company: 'text',
    department: 'text',
  },
  {
    name: 'JobSearchTextIndex',
    weights: {
      title: 10,
      requiredSkills: 8,
      tags: 5,
      company: 4,
      department: 3,
      description: 1,
    },
  }
);

// Performance Indexes
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ companyId: 1, status: 1 });
jobSchema.index({ workMode: 1, employmentType: 1, experienceLevel: 1 });
jobSchema.index({ views: -1 });

export const Job = mongoose.model('Job', jobSchema);
