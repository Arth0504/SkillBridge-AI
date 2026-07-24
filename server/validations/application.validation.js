import { AppError } from '../utils/AppError.js';
import { APPLICATION_STATUS } from '../models/application.model.js';

export const validateApplicationSubmit = (req, _res, next) => {
  const { coverLetter, resumeUrl } = req.body;
  const errors = [];

  if (coverLetter !== undefined && typeof coverLetter !== 'string') {
    errors.push('Cover letter must be a string');
  } else if (coverLetter && coverLetter.length > 5000) {
    errors.push('Cover letter cannot exceed 5000 characters');
  }

  if (resumeUrl !== undefined && (typeof resumeUrl !== 'string' || !resumeUrl.trim())) {
    errors.push('Resume URL must be a non-empty string');
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join('. ')}`, 400));
  }

  next();
};

export const validateStatusUpdate = (req, _res, next) => {
  const { status, interviewDate, notes } = req.body;
  const errors = [];

  const allowedStatuses = Object.values(APPLICATION_STATUS);

  if (!status || !allowedStatuses.includes(status)) {
    errors.push(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
  }

  if (status === APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
    if (!interviewDate || isNaN(Date.parse(interviewDate))) {
      errors.push('Interview date is required and must be a valid date when scheduling an interview');
    }
  }

  if (notes !== undefined && typeof notes !== 'string') {
    errors.push('Notes must be a string');
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join('. ')}`, 400));
  }

  next();
};

export const validateRatingUpdate = (req, _res, next) => {
  const { rating } = req.body;

  if (rating === undefined || isNaN(Number(rating))) {
    return next(new AppError('Rating must be a valid number between 0 and 5', 400));
  }

  const numRating = Number(rating);
  if (numRating < 0 || numRating > 5) {
    return next(new AppError('Rating must be between 0 and 5', 400));
  }

  req.body.rating = numRating;
  next();
};

export const validateFeedbackUpdate = (req, _res, next) => {
  const { feedback } = req.body;

  if (!feedback || typeof feedback !== 'string' || !feedback.trim()) {
    return next(new AppError('Feedback text is required and cannot be empty', 400));
  }

  req.body.feedback = feedback.trim();
  next();
};
