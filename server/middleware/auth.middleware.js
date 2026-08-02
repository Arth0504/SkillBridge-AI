import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import { ROLES } from '../config/constants.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';

/**
 * Protect routes by verifying JWT Bearer token
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in to access this resource.', 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    let user;
    if (decoded.role === ROLES.CANDIDATE) {
      user = await Candidate.findById(decoded.id);
    } else if (decoded.role === ROLES.COMPANY) {
      user = await Company.findById(decoded.id);
    }

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = user;
    req.role = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired. Please refresh your token.', 401));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }
});

/**
 * Restrict routes to specific user roles
 * @param  {...string} allowedRoles Allowed roles array
 */
export const restrictTo = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!allowedRoles.includes(req.role)) {
      return next(new AppError('Forbidden: You do not have permission to perform this action.', 403));
    }
    next();
  };
};

export const authenticate = protect;

export default {
  protect,
  authenticate,
  restrictTo,
};

