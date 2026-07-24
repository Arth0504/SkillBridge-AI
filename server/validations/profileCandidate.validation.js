import { AppError } from '../utils/AppError.js';

export const validateCandidateProfileUpdate = (req, _res, next) => {
  const { fullName, phone, experienceYears, skills } = req.body;

  if (fullName !== undefined && (!fullName || typeof fullName !== 'string' || !fullName.trim())) {
    return next(new AppError('Full name cannot be empty', 400));
  }

  if (phone !== undefined && typeof phone !== 'string') {
    return next(new AppError('Phone must be a valid string', 400));
  }

  if (experienceYears !== undefined && (isNaN(Number(experienceYears)) || Number(experienceYears) < 0)) {
    return next(new AppError('Experience years must be a valid non-negative number', 400));
  }

  if (skills !== undefined && !Array.isArray(skills)) {
    return next(new AppError('Skills must be an array of strings', 400));
  }

  next();
};
