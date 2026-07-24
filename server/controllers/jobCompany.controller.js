import { Job } from '../models/job.model.js';
import { Company } from '../models/company.model.js';
import { Application } from '../models/application.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { createNotificationService } from '../services/notification.service.js';
import { NOTIFICATION_TYPES } from '../models/notification.model.js';

/**
 * Create New Job Posting (Company Only)
 * @route POST /api/v1/company/jobs
 */
export const createJob = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.user._id);

  if (!company) {
    return next(new AppError('Company profile not found.', 404));
  }

  const {
    title,
    department,
    description,
    responsibilities,
    requirements,
    requiredSkills,
    experienceLevel,
    employmentType,
    workMode,
    salary,
    salaryType,
    currency,
    location,
    country,
    state,
    city,
    openings,
    applicationDeadline,
    benefits,
    tags,
    status,
  } = req.body;

  // Prevent duplicate open or draft job under the same company
  const duplicateJob = await Job.findOne({
    companyId: req.user._id,
    title: { $regex: `^${title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    status: { $in: ['open', 'draft'] },
  });

  if (duplicateJob) {
    return next(
      new AppError(
        'An open or draft job vacancy with this exact title already exists for your company.',
        409
      )
    );
  }

  const job = await Job.create({
    title: title.trim(),
    department: department ? department.trim() : '',
    company: company.companyName,
    companyId: req.user._id,
    description: description.trim(),
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
    requirements: Array.isArray(requirements) ? requirements : [],
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    experienceLevel,
    employmentType,
    workMode,
    salary: salary || {},
    salaryType: salaryType || 'yearly',
    currency: currency || 'USD',
    location: location || {},
    country: country || (location && location.country) || company.location || '',
    state: state || (location && location.state) || '',
    city: city || (location && location.city) || '',
    openings: openings || 1,
    applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
    status: status || 'open',
    benefits: Array.isArray(benefits) ? benefits : [],
    tags: Array.isArray(tags) ? tags : [],
    createdBy: req.user._id,
  });

  return sendResponse(res, 201, true, 'Job posting created successfully', { job });
});

/**
 * Get All Jobs Created by Authenticated Company
 * @route GET /api/v1/company/jobs
 */
export const getCompanyJobs = asyncHandler(async (req, res, _next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { companyId: req.user._id };
  if (req.query.status) {
    filter.status = req.query.status.toLowerCase().trim();
  }

  const [jobs, totalCount] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return sendResponse(res, 200, true, 'Company jobs retrieved successfully', {
    jobs,
    pagination: {
      currentPage: page,
      limit,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * Get Single Company Job by ID
 * @route GET /api/v1/company/jobs/:id
 */
export const getCompanyJobById = asyncHandler(async (req, res, next) => {
  const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id });

  if (!job) {
    return next(new AppError('Job vacancy not found or unauthorized.', 404));
  }

  return sendResponse(res, 200, true, 'Job details retrieved successfully', { job });
});

/**
 * Update Job Details (Company Owner Only)
 * @route PUT /api/v1/company/jobs/:id
 */
export const updateJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id });

  if (!job) {
    return next(new AppError('Job vacancy not found or unauthorized.', 404));
  }

  const allowedFields = [
    'title',
    'department',
    'description',
    'responsibilities',
    'requirements',
    'requiredSkills',
    'experienceLevel',
    'employmentType',
    'workMode',
    'salary',
    'salaryType',
    'currency',
    'location',
    'country',
    'state',
    'city',
    'openings',
    'applicationDeadline',
    'status',
    'benefits',
    'tags',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  await job.save();

  return sendResponse(res, 200, true, 'Job posting updated successfully', { job });
});

/**
 * Delete Job Posting (Company Owner Only)
 * @route DELETE /api/v1/company/jobs/:id
 */
export const deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, companyId: req.user._id });

  if (!job) {
    return next(new AppError('Job vacancy not found or unauthorized.', 404));
  }

  return sendResponse(res, 200, true, 'Job posting deleted successfully', null);
});

/**
 * Update Job Status (draft | open | closed | paused | expired)
 * @route PATCH /api/v1/company/jobs/:id/status
 */
export const updateJobStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id });

  if (!job) {
    return next(new AppError('Job vacancy not found or unauthorized.', 404));
  }

  job.status = status;
  await job.save();

  // If Job is closed, notify all active applicants
  if (status === 'closed') {
    Application.find({ jobId: job._id, isDeleted: false })
      .select('candidateId')
      .then((applications) => {
        applications.forEach((app) => {
          createNotificationService({
            receiverId: app.candidateId,
            receiverRole: 'candidate',
            senderId: req.user._id,
            senderRole: 'company',
            title: 'Job Position Closed',
            message: `The job position "${job.title}" has been closed by the employer.`,
            type: NOTIFICATION_TYPES.JOB_CLOSED,
            priority: 'medium',
            metadata: { jobId: job._id, jobTitle: job.title },
          }).catch((err) => console.error('Auto-Notification Error (Job Closed):', err.message));
        });
      })
      .catch((err) => console.error('Failed to fetch applications for Job Closed notification:', err.message));
  }

  return sendResponse(res, 200, true, `Job status updated to ${status}`, { job });
});
