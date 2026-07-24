import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../models/notification.model.js';

/**
 * Validate Notification ID URL parameter
 */
export const validateNotificationId = (req, _res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid notification ID format', 400));
  }
  next();
};

/**
 * Validate Notification query filters & pagination
 */
export const validateNotificationQuery = (req, _res, next) => {
  const { isRead, priority, type, startDate, endDate, page, limit } = req.query;
  const errors = [];

  if (isRead !== undefined && isRead !== 'true' && isRead !== 'false' && typeof isRead !== 'boolean') {
    errors.push('isRead filter must be a boolean (true or false)');
  }

  if (priority && !Object.values(NOTIFICATION_PRIORITIES).includes(priority)) {
    errors.push(`priority must be one of: ${Object.values(NOTIFICATION_PRIORITIES).join(', ')}`);
  }

  if (type && !Object.values(NOTIFICATION_TYPES).includes(type)) {
    errors.push(`type must be a valid notification type string`);
  }

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
