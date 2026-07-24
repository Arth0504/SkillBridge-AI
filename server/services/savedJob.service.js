import mongoose from 'mongoose';
import { SavedJob } from '../models/savedJob.model.js';
import { Job } from '../models/job.model.js';
import { AppError } from '../utils/AppError.js';

/**
 * Save Job for Candidate
 */
export const saveJobService = async (candidateIdStr, jobIdStr) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const jobId = new mongoose.Types.ObjectId(jobIdStr);

  // 1. Verify Job exists
  const job = await Job.findById(jobId).select('_id title companyId status');
  if (!job) {
    throw new AppError('Job posting not found.', 404);
  }

  // 2. Prevent duplicate saving
  const existingSaved = await SavedJob.findOne({ candidateId, jobId });
  if (existingSaved) {
    throw new AppError('You have already saved this job posting.', 409);
  }

  const savedJob = await SavedJob.create({
    candidateId,
    jobId,
  });

  return await SavedJob.findById(savedJob._id)
    .populate({
      path: 'jobId',
      select: 'title department company workMode employmentType salary status location requiredSkills createdAt',
      populate: {
        path: 'companyId',
        select: 'companyName logoUrl location industry',
      },
    });
};

/**
 * Remove Saved Job for Candidate
 */
export const removeSavedJobService = async (candidateIdStr, jobIdStr) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const jobId = new mongoose.Types.ObjectId(jobIdStr);

  const deleted = await SavedJob.findOneAndDelete({ candidateId, jobId });
  if (!deleted) {
    throw new AppError('Saved job record not found or already removed.', 404);
  }

  return { jobId: jobIdStr };
};

/**
 * List Candidate's Saved Jobs (Paginated)
 */
export const getSavedJobsService = async (candidateIdStr, query = {}) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [savedJobs, totalItems] = await Promise.all([
    SavedJob.find({ candidateId })
      .populate({
        path: 'jobId',
        select: 'title department company workMode employmentType salary status location requiredSkills createdAt',
        populate: {
          path: 'companyId',
          select: 'companyName logoUrl location industry',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SavedJob.countDocuments({ candidateId }),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    savedJobs,
    pagination: {
      totalItems,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
