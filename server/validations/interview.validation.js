import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';
import {
  INTERVIEW_TYPES,
  INTERVIEW_STATUS,
  MEETING_PLATFORMS,
  INTERVIEW_RESULTS,
} from '../models/interview.model.js';

export const validateInterviewId = (req, _res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid interview ID format', 400));
  }
  next();
};

export const validateInterviewCreate = (req, _res, next) => {
  const {
    applicationId,
    title,
    interviewType,
    scheduledDate,
    startTime,
    endTime,
    meetingPlatform,
  } = req.body;

  const errors = [];

  if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
    errors.push('applicationId is required and must be a valid MongoDB ObjectId');
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('title is required and must be a non-empty string');
  }

  if (interviewType && !Object.values(INTERVIEW_TYPES).includes(interviewType)) {
    errors.push(`interviewType must be one of: ${Object.values(INTERVIEW_TYPES).join(', ')}`);
  }

  if (!scheduledDate || isNaN(Date.parse(scheduledDate))) {
    errors.push('scheduledDate is required and must be a valid date');
  }

  if (!startTime || typeof startTime !== 'string' || !startTime.trim()) {
    errors.push('startTime is required');
  }

  if (!endTime || typeof endTime !== 'string' || !endTime.trim()) {
    errors.push('endTime is required');
  }

  if (meetingPlatform && !Object.values(MEETING_PLATFORMS).includes(meetingPlatform)) {
    errors.push(`meetingPlatform must be one of: ${Object.values(MEETING_PLATFORMS).join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join('. ')}`, 400));
  }

  next();
};

export const validateInterviewUpdate = (req, _res, next) => {
  const { scheduledDate, meetingPlatform, rating, result } = req.body;
  const errors = [];

  if (scheduledDate && isNaN(Date.parse(scheduledDate))) {
    errors.push('scheduledDate must be a valid date');
  }

  if (meetingPlatform && !Object.values(MEETING_PLATFORMS).includes(meetingPlatform)) {
    errors.push(`meetingPlatform must be one of: ${Object.values(MEETING_PLATFORMS).join(', ')}`);
  }

  if (rating !== undefined && (isNaN(Number(rating)) || Number(rating) < 0 || Number(rating) > 5)) {
    errors.push('rating must be a number between 0 and 5');
  }

  if (result && !Object.values(INTERVIEW_RESULTS).includes(result)) {
    errors.push(`result must be one of: ${Object.values(INTERVIEW_RESULTS).filter(Boolean).join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join('. ')}`, 400));
  }

  next();
};

export const validateInterviewStatusUpdate = (req, _res, next) => {
  const { status } = req.body;

  if (!status || !Object.values(INTERVIEW_STATUS).includes(status)) {
    return next(
      new AppError(
        `status is required and must be one of: ${Object.values(INTERVIEW_STATUS).join(', ')}`,
        400
      )
    );
  }

  next();
};

export const validateInterviewFeedback = (req, _res, next) => {
  const { rating, result } = req.body;
  const errors = [];

  if (rating !== undefined && (isNaN(Number(rating)) || Number(rating) < 0 || Number(rating) > 5)) {
    errors.push('rating must be a number between 0 and 5');
  }

  if (result !== undefined && !Object.values(INTERVIEW_RESULTS).includes(result)) {
    errors.push(`result must be one of: ${Object.values(INTERVIEW_RESULTS).filter(Boolean).join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join('. ')}`, 400));
  }

  next();
};

export const validateInterviewQuery = (req, _res, next) => {
  const { status, interviewType, startDate, endDate, page, limit } = req.query;
  const errors = [];

  if (status && !Object.values(INTERVIEW_STATUS).includes(status)) {
    errors.push(`status must be one of: ${Object.values(INTERVIEW_STATUS).join(', ')}`);
  }

  if (interviewType && !Object.values(INTERVIEW_TYPES).includes(interviewType)) {
    errors.push(`interviewType must be one of: ${Object.values(INTERVIEW_TYPES).join(', ')}`);
  }

  if (startDate && isNaN(Date.parse(startDate))) {
    errors.push('startDate must be a valid date string');
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    errors.push('endDate must be a valid date string');
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
