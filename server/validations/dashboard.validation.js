import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

/**
 * Validate query parameters for Dashboard filtering and pagination
 */
export const validateDashboardQuery = (req, _res, next) => {
  const { startDate, endDate, jobId, page, limit } = req.query;
  const errors = [];

  if (startDate && isNaN(Date.parse(startDate))) {
    errors.push('startDate must be a valid date string (e.g. YYYY-MM-DD)');
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    errors.push('endDate must be a valid date string (e.g. YYYY-MM-DD)');
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('startDate cannot be after endDate');
  }

  if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
    errors.push('jobId must be a valid MongoDB ObjectId');
  }

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
