import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

export const validateJobIdParam = (req, _res, next) => {
  const jobId = req.params.jobId || req.body.jobId;
  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    return next(new AppError('Invalid or missing jobId format', 400));
  }
  next();
};

export const validateSavedJobQuery = (req, _res, next) => {
  const { page, limit } = req.query;
  const errors = [];

  if (page !== undefined && (isNaN(Number(page)) || Number(page) < 1)) {
    errors.push('page must be a positive integer starting from 1');
  }

  if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push('limit must be a positive integer between 1 and 100');
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join('. ')}`, 400));
  }

  next();
};
