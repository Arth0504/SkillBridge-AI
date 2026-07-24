import { AppError } from '../utils/AppError.js';

export const validateCompanyProfileUpdate = (req, _res, next) => {
  const { companyName, website, companySize } = req.body;

  if (companyName !== undefined && (!companyName || typeof companyName !== 'string' || !companyName.trim())) {
    return next(new AppError('Company name cannot be empty', 400));
  }

  if (website !== undefined && typeof website !== 'string') {
    return next(new AppError('Website must be a valid string', 400));
  }

  if (
    companySize !== undefined &&
    !['', '1-10', '11-50', '51-200', '201-500', '500+'].includes(companySize)
  ) {
    return next(new AppError('Invalid company size option', 400));
  }

  next();
};
