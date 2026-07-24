import { AppError } from '../utils/AppError.js';

export const validateCandidateDashboardQuery = (req, _res, next) => {
  const { status, page, limit, startDate, endDate } = req.query;
  const errors = [];

  if (startDate && isNaN(Date.parse(startDate))) {
    errors.push('startDate must be a valid date string');
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    errors.push('endDate must be a valid date string');
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('startDate cannot be after endDate');
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
