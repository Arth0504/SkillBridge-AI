import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    company: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, default: '', trim: true },
    degree: { type: String, default: '', trim: true },
    fieldOfStudy: { type: String, default: '', trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    technologies: { type: [String], default: [] },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    issueDate: { type: Date },
    credentialUrl: { type: String, default: '' },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    // Auto-Generated HRMS Identifiers
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    companyEmailPlaceholder: {
      type: String,
      default: '',
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    employeeStatus: {
      type: String,
      enum: ['Onboarding', 'Active', 'Probation', 'Terminated', 'Leave'],
      default: 'Onboarding',
      index: true,
    },
    hrmsProfileStatus: {
      type: String,
      default: 'Imported from ATS',
    },

    // Permanent Candidate Audit Mapping
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewRoom',
      default: null,
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfferLetter',
      default: null,
    },

    // Auto-Imported Candidate ATS & Resume Builder Fields (Origin: ATS Resume)
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    professionalSummary: { type: String, default: '', trim: true },
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    languages: { type: [String], default: ['English'] },
    socialLinks: {
      portfolio: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    resumeUrl: { type: String, default: '' },
    atsImportedFields: {
      type: [String],
      default: [
        'fullName',
        'email',
        'phone',
        'address',
        'professionalSummary',
        'skills',
        'experience',
        'education',
        'projects',
        'certifications',
        'languages',
        'portfolio',
        'github',
        'linkedin',
        'resumeUrl',
      ],
    },

    // HR Editable Fields (Only these fields editable by HR)
    salary: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    department: { type: String, default: 'Engineering' },
    designation: { type: String, default: 'Software Engineer' },
    reportingManager: { type: String, default: 'Engineering Director' },
    shift: { type: String, default: 'General Shift (9 AM - 6 PM)' },
    officeLocation: { type: String, default: 'Headquarters' },
    employmentType: { type: String, default: 'Full-Time' },
    probationPeriod: { type: String, default: '90 Days' },
  },
  {
    timestamps: true,
  }
);

// Prevent Duplicate Employee Creation for Same Candidate under Same Company
employeeSchema.index({ companyId: 1, candidateId: 1 }, { unique: true });

export const Employee = mongoose.model('Employee', employeeSchema);
