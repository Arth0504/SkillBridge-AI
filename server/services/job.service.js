import { Job } from '../models/job.model.js';

/**
 * Build dynamic Mongoose query object for job filtering & searching
 * @param {Object} queryParams Request query parameters
 * @returns {Object} Mongoose filter object
 */
export const buildJobQuery = (queryParams) => {
  const {
    keyword,
    skills,
    location,
    experience,
    employmentType,
    workMode,
    salaryMin,
    salaryMax,
    status,
  } = queryParams;

  // By default, candidates only view 'open' jobs unless specific status requested
  const query = {
    status: status ? status.toLowerCase().trim() : 'open',
  };

  // Keyword search across title, description, skills, tags, company, department
  if (keyword && keyword.trim()) {
    const k = keyword.trim();
    query.$or = [
      { title: { $regex: k, $options: 'i' } },
      { description: { $regex: k, $options: 'i' } },
      { company: { $regex: k, $options: 'i' } },
      { department: { $regex: k, $options: 'i' } },
      { requiredSkills: { $in: [new RegExp(k, 'i')] } },
      { tags: { $in: [new RegExp(k, 'i')] } },
    ];
  }

  // Skills filter
  if (skills) {
    const skillList = skills.split(',').map((s) => new RegExp(s.trim(), 'i'));
    query.requiredSkills = { $in: skillList };
  }

  // Location filter (country, state, or city)
  if (location && location.trim()) {
    const locRegex = new RegExp(location.trim(), 'i');
    const locationConditions = [
      { country: locRegex },
      { state: locRegex },
      { city: locRegex },
      { 'location.country': locRegex },
      { 'location.state': locRegex },
      { 'location.city': locRegex },
    ];

    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: locationConditions }];
      delete query.$or;
    } else {
      query.$or = locationConditions;
    }
  }

  // Experience level filter
  if (experience) {
    const levels = experience.split(',').map((l) => l.trim().toLowerCase());
    query.experienceLevel = { $in: levels };
  }

  // Employment Type filter
  if (employmentType) {
    const types = employmentType.split(',').map((t) => {
      const lower = t.trim().toLowerCase().replace('-', ' ');
      if (lower === 'full time') return 'Full Time';
      if (lower === 'part time') return 'Part Time';
      if (lower === 'internship') return 'Internship';
      if (lower === 'contract') return 'Contract';
      if (lower === 'freelance') return 'Freelance';
      return t.trim();
    });
    query.employmentType = { $in: types };
  }

  // Work Mode filter
  if (workMode) {
    const modes = workMode.split(',').map((m) => {
      const lower = m.trim().toLowerCase().replace('-', ' ');
      if (lower === 'remote') return 'Remote';
      if (lower === 'on site' || lower === 'onsite') return 'On Site';
      if (lower === 'hybrid') return 'Hybrid';
      return m.trim();
    });
    query.workMode = { $in: modes };
  }

  // Salary Range filter
  if (salaryMin || salaryMax) {
    query['salary.max'] = {};
    if (salaryMin && !isNaN(Number(salaryMin))) {
      query['salary.max'].$gte = Number(salaryMin);
    }
    if (salaryMax && !isNaN(Number(salaryMax))) {
      query['salary.max'].$lte = Number(salaryMax);
    }
    if (Object.keys(query['salary.max']).length === 0) {
      delete query['salary.max'];
    }
  }

  return query;
};

/**
 * Execute paginated job query with sorting
 * @param {Object} filter Query filter object
 * @param {Object} options Pagination & sorting options { page, limit, sort }
 */
export const queryJobs = async (filter, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(options.limit, 10) || 10));
  const skip = (page - 1) * limit;

  let sort = { createdAt: -1 }; // Default: Newest

  if (options.sort) {
    const sortVal = options.sort.toString().toLowerCase().trim();
    if (sortVal === 'oldest') {
      sort = { createdAt: 1 };
    } else if (sortVal === 'salary' || sortVal === 'salary_high') {
      sort = { 'salary.max': -1 };
    } else if (sortVal === 'most viewed' || sortVal === 'most_viewed' || sortVal === 'views') {
      sort = { views: -1 };
    } else if (sortVal === 'newest') {
      sort = { createdAt: -1 };
    }
  }

  const [jobs, totalCount] = await Promise.all([
    Job.find(filter)
      .populate('companyId', 'companyName logoUrl location industry website companySize')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    jobs,
    pagination: {
      currentPage: page,
      limit,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Increment job view count by 1
 * @param {String} jobId
 */
export const incrementJobViews = async (jobId) => {
  return await Job.findByIdAndUpdate(
    jobId,
    { $inc: { views: 1 } },
    { new: true }
  );
};
