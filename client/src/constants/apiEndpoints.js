export const API_ENDPOINTS = {
  AUTH: {
    CANDIDATE_LOGIN: '/auth/candidate/login',
    CANDIDATE_REGISTER: '/auth/candidate/register',
    CANDIDATE_LOGOUT: '/auth/candidate/logout',
    CANDIDATE_REFRESH: '/auth/candidate/refresh-token',
    CANDIDATE_ME: '/auth/candidate/me',
    CANDIDATE_VERIFY_EMAIL: '/auth/candidate/verify-email',
    CANDIDATE_RESEND_VERIFICATION: '/auth/candidate/resend-verification',

    COMPANY_LOGIN: '/auth/company/login',
    COMPANY_REGISTER: '/auth/company/register',
    COMPANY_LOGOUT: '/auth/company/logout',
    COMPANY_REFRESH: '/auth/company/refresh-token',
    COMPANY_ME: '/auth/company/me',
    COMPANY_VERIFY_EMAIL: '/auth/company/verify-email',
    COMPANY_RESEND_VERIFICATION: '/auth/company/resend-verification',
  },

  JOBS: {
    BASE: '/jobs',
    BY_ID: (id) => `/jobs/${id}`,
    SEARCH: '/jobs/search',
  },

  APPLICATIONS: {
    BASE: '/applications',
    MY_APPLICATIONS: '/applications/my',
    UPDATE_STATUS: (id) => `/applications/${id}/status`,
  },

  RESUME: {
    ANALYZE: '/resume/analyze',
    MATCH_JOB: '/resume/match',
  },

  INTERVIEW: {
    QUESTIONS: '/ai/interview/questions',
    EVALUATE: '/ai/interview/evaluate',
  },

  CODING: {
    CHALLENGE: '/ai/coding/challenge',
    SUBMIT: '/ai/coding/submit',
  },

  VIDEO_INTERVIEW: {
    START: '/ai/video/start',
    SUBMIT: '/ai/video/submit',
  },

  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
  },

  ADMIN: {
    AUDIT_LOGS: '/admin/audit-logs',
    METRICS: '/admin/metrics',
    USERS: '/admin/users',
  },
};
