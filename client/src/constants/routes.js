export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:id',
  
  CANDIDATE: {
    DASHBOARD: '/candidate/dashboard',
    PROFILE: '/candidate/profile',
    SAVED_JOBS: '/candidate/saved-jobs',
    APPLICATIONS: '/candidate/applications',
    RESUME_ANALYZER: '/candidate/resume-analyzer',
    AI_INTERVIEW: '/candidate/ai-interview',
    AI_CODING: '/candidate/ai-coding',
    VIDEO_INTERVIEW: '/candidate/video-interview',
    NOTIFICATIONS: '/candidate/notifications',
  },

  COMPANY: {
    DASHBOARD: '/company/dashboard',
    PROFILE: '/company/profile',
    POST_JOB: '/company/jobs/new',
    JOBS: '/company/jobs',
    APPLICATIONS: '/company/applications',
    INTERVIEWS: '/company/interviews',
    NOTIFICATIONS: '/company/notifications',
  },

  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    AUDIT: '/admin/audit',
    METRICS: '/admin/metrics',
  },

  SYSTEM: {
    UNAUTHORIZED: '/unauthorized',
    SERVER_ERROR: '/500',
    OFFLINE: '/offline',
    NOT_FOUND: '*',
  },
};
