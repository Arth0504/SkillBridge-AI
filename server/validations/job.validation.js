import { AppError } from '../utils/AppError.js';

export const ALLOWED_EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];
export const ALLOWED_EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance'];
export const ALLOWED_WORK_MODES = ['Remote', 'On Site', 'Hybrid'];
export const ALLOWED_STATUSES = ['draft', 'open', 'closed', 'paused', 'expired'];
export const ALLOWED_SALARY_TYPES = ['yearly', 'monthly', 'hourly', 'project'];

/**
 * Helper to normalize string enums (e.g. 'full-time' -> 'Full Time', 'remote' -> 'Remote')
 */
const normalizeEmploymentType = (val) => {
  if (!val || typeof val !== 'string') return val;
  const lower = val.toLowerCase().replace('-', ' ').trim();
  if (lower === 'full time') return 'Full Time';
  if (lower === 'part time') return 'Part Time';
  if (lower === 'internship') return 'Internship';
  if (lower === 'contract') return 'Contract';
  if (lower === 'freelance') return 'Freelance';
  return val;
};

const normalizeWorkMode = (val) => {
  if (!val || typeof val !== 'string') return val;
  const lower = val.toLowerCase().replace('-', ' ').trim();
  if (lower === 'remote') return 'Remote';
  if (lower === 'on site' || lower === 'onsite') return 'On Site';
  if (lower === 'hybrid') return 'Hybrid';
  return val;
};

/**
 * Validate job creation payload
 */
export const validateJobCreate = (req, _res, next) => {
  let {
    title,
    description,
    experienceLevel,
    employmentType,
    workMode,
    salary,
    salaryType,
    openings,
    applicationDeadline,
    requiredSkills,
    responsibilities,
    requirements,
    benefits,
    tags,
  } = req.body;

  const errors = [];

  // Title validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Job title is required and cannot be empty');
  } else if (title.trim().length > 150) {
    errors.push('Job title cannot exceed 150 characters');
  }

  // Description validation
  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Job description is required and cannot be empty');
  }

  // Experience level validation
  if (!experienceLevel || typeof experienceLevel !== 'string') {
    errors.push('Experience level is required');
  } else {
    req.body.experienceLevel = experienceLevel.toLowerCase().trim();
    if (!ALLOWED_EXPERIENCE_LEVELS.includes(req.body.experienceLevel)) {
      errors.push(
        `Invalid experience level. Allowed values: ${ALLOWED_EXPERIENCE_LEVELS.join(', ')}`
      );
    }
  }

  // Employment type validation
  if (!employmentType || typeof employmentType !== 'string') {
    errors.push('Employment type is required');
  } else {
    req.body.employmentType = normalizeEmploymentType(employmentType);
    if (!ALLOWED_EMPLOYMENT_TYPES.includes(req.body.employmentType)) {
      errors.push(
        `Invalid employment type. Allowed values: ${ALLOWED_EMPLOYMENT_TYPES.join(', ')}`
      );
    }
  }

  // Work mode validation
  if (!workMode || typeof workMode !== 'string') {
    errors.push('Work mode is required');
  } else {
    req.body.workMode = normalizeWorkMode(workMode);
    if (!ALLOWED_WORK_MODES.includes(req.body.workMode)) {
      errors.push(`Invalid work mode. Allowed values: ${ALLOWED_WORK_MODES.join(', ')}`);
    }
  }

  // Salary validation
  if (salary) {
    if (salary.min !== undefined && (isNaN(Number(salary.min)) || Number(salary.min) < 0)) {
      errors.push('Salary min must be a valid non-negative number');
    }
    if (salary.max !== undefined && (isNaN(Number(salary.max)) || Number(salary.max) < 0)) {
      errors.push('Salary max must be a valid non-negative number');
    }
    if (
      salary.min !== undefined &&
      salary.max !== undefined &&
      Number(salary.max) < Number(salary.min)
    ) {
      errors.push('Salary max cannot be less than salary min');
    }
  }

  // Salary type validation
  if (salaryType) {
    req.body.salaryType = salaryType.toLowerCase().trim();
    if (!ALLOWED_SALARY_TYPES.includes(req.body.salaryType)) {
      errors.push(`Invalid salary type. Allowed values: ${ALLOWED_SALARY_TYPES.join(', ')}`);
    }
  }

  // Openings validation
  if (openings !== undefined && (isNaN(Number(openings)) || Number(openings) < 1)) {
    errors.push('Openings must be a positive integer at least 1');
  }

  // Application Deadline validation
  if (applicationDeadline && isNaN(Date.parse(applicationDeadline))) {
    errors.push('Application deadline must be a valid date');
  }

  // Array fields validation
  const checkArrayOfStrings = (arr, fieldName) => {
    if (arr !== undefined && !Array.isArray(arr)) {
      errors.push(`${fieldName} must be an array of strings`);
    }
  };

  checkArrayOfStrings(requiredSkills, 'requiredSkills');
  checkArrayOfStrings(responsibilities, 'responsibilities');
  checkArrayOfStrings(requirements, 'requirements');
  checkArrayOfStrings(benefits, 'benefits');
  checkArrayOfStrings(tags, 'tags');

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join('. ')}`, 400));
  }

  next();
};

/**
 * Validate job update payload
 */
export const validateJobUpdate = (req, _res, next) => {
  const {
    experienceLevel,
    employmentType,
    workMode,
    status,
    salary,
    salaryType,
    openings,
    applicationDeadline,
  } = req.body;

  const errors = [];

  if (experienceLevel) {
    req.body.experienceLevel = experienceLevel.toLowerCase().trim();
    if (!ALLOWED_EXPERIENCE_LEVELS.includes(req.body.experienceLevel)) {
      errors.push(
        `Invalid experience level. Allowed values: ${ALLOWED_EXPERIENCE_LEVELS.join(', ')}`
      );
    }
  }

  if (employmentType) {
    req.body.employmentType = normalizeEmploymentType(employmentType);
    if (!ALLOWED_EMPLOYMENT_TYPES.includes(req.body.employmentType)) {
      errors.push(
        `Invalid employment type. Allowed values: ${ALLOWED_EMPLOYMENT_TYPES.join(', ')}`
      );
    }
  }

  if (workMode) {
    req.body.workMode = normalizeWorkMode(workMode);
    if (!ALLOWED_WORK_MODES.includes(req.body.workMode)) {
      errors.push(`Invalid work mode. Allowed values: ${ALLOWED_WORK_MODES.join(', ')}`);
    }
  }

  if (status) {
    req.body.status = status.toLowerCase().trim();
    if (!ALLOWED_STATUSES.includes(req.body.status)) {
      errors.push(`Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`);
    }
  }

  if (salaryType) {
    req.body.salaryType = salaryType.toLowerCase().trim();
    if (!ALLOWED_SALARY_TYPES.includes(req.body.salaryType)) {
      errors.push(`Invalid salary type. Allowed values: ${ALLOWED_SALARY_TYPES.join(', ')}`);
    }
  }

  if (salary) {
    if (salary.min !== undefined && (isNaN(Number(salary.min)) || Number(salary.min) < 0)) {
      errors.push('Salary min must be a valid non-negative number');
    }
    if (salary.max !== undefined && (isNaN(Number(salary.max)) || Number(salary.max) < 0)) {
      errors.push('Salary max must be a valid non-negative number');
    }
  }

  if (openings !== undefined && (isNaN(Number(openings)) || Number(openings) < 1)) {
    errors.push('Openings must be a positive integer at least 1');
  }

  if (applicationDeadline && isNaN(Date.parse(applicationDeadline))) {
    errors.push('Application deadline must be a valid date');
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation Error: ${errors.join('. ')}`, 400));
  }

  next();
};

/**
 * Validate job status change payload
 */
export const validateJobStatusUpdate = (req, _res, next) => {
  const { status } = req.body;

  if (!status || typeof status !== 'string') {
    return next(new AppError('Status is required', 400));
  }

  const normalizedStatus = status.toLowerCase().trim();
  if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
    return next(
      new AppError(
        `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
        400
      )
    );
  }

  req.body.status = normalizedStatus;
  next();
};
