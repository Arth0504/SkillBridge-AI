import mongoose from 'mongoose';
import { Job } from '../models/job.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  buildJobQuery,
  queryJobs,
  incrementJobViews,
} from '../services/job.service.js';

/**
 * Get All Public Open Jobs with Pagination, Sorting & Filtering
 * @route GET /api/v1/jobs
 */
export const getAllJobs = asyncHandler(async (req, res, _next) => {
  const filter = buildJobQuery(req.query);
  const result = await queryJobs(filter, req.query);

  return sendResponse(res, 200, true, 'Jobs retrieved successfully', {
    jobs: result.jobs,
    pagination: result.pagination,
  });
});

/**
 * Get Single Job Details by ID or Slug (Increments view count)
 * @route GET /api/v1/jobs/:id
 */
export const getJobById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let queryCondition = { slug: id };
  if (mongoose.Types.ObjectId.isValid(id)) {
    queryCondition = { $or: [{ _id: id }, { slug: id }] };
  }

  const job = await Job.findOne(queryCondition).populate(
    'companyId',
    'companyName email logoUrl location industry description companySize'
  );

  if (!job) {
    return next(new AppError('Job vacancy not found.', 404));
  }

  // Atomically increment job views count
  await incrementJobViews(job._id);
  job.views += 1;

  return sendResponse(res, 200, true, 'Job details retrieved successfully', { job });
});
