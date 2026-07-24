import { AppError } from '../utils/AppError.js';

export const validateCompanyRegister = (req, _res, next) => {
  const { companyName, email, password } = req.body;
  const errors = [];

  if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
    errors.push('Company name is required');
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push('A valid work email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join(', ')}`, 400));
  }

  next();
};

export const validateCompanyLogin = (req, _res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join(', ')}`, 400));
  }

  next();
};
