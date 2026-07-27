import api from './axios';

export const companyApi = {
  // Company Dashboard
  getDashboardSummary: async (params) => {
    const { data } = await api.get('/company/dashboard', { params });
    return data;
  },

  getDashboardAnalytics: async (params) => {
    const { data } = await api.get('/company/dashboard/analytics', { params });
    return data;
  },

  getRecentApplications: async (params) => {
    const { data } = await api.get('/company/dashboard/recent-applications', { params });
    return data;
  },

  getJobPerformance: async (params) => {
    const { data } = await api.get('/company/dashboard/job-performance', { params });
    return data;
  },

  getDashboardInterviews: async (params) => {
    const { data } = await api.get('/company/dashboard/interviews', { params });
    return data;
  },

  // Company Profile
  getProfile: async () => {
    const { data } = await api.get('/company/profile');
    return data;
  },

  getPublicProfile: async (id) => {
    const { data } = await api.get(`/company/profile/public/${id}`);
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/company/profile', profileData);
    return data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const { data } = await api.post('/company/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Company Jobs CRUD & Actions
  getCompanyJobs: async (params) => {
    const { data } = await api.get('/company/jobs', { params });
    return data;
  },

  getCompanyJobById: async (id) => {
    const { data } = await api.get(`/company/jobs/${id}`);
    return data;
  },

  createJob: async (jobData) => {
    const { data } = await api.post('/company/jobs', jobData);
    return data;
  },

  updateJob: async (id, jobData) => {
    const { data } = await api.put(`/company/jobs/${id}`, jobData);
    return data;
  },

  deleteJob: async (id) => {
    const { data } = await api.delete(`/company/jobs/${id}`);
    return data;
  },

  updateJobStatus: async (id, status) => {
    const { data } = await api.patch(`/company/jobs/${id}/status`, { status });
    return data;
  },

  getJobApplications: async (jobId, params) => {
    const { data } = await api.get(`/company/jobs/${jobId}/applications`, { params });
    return data;
  },

  // Company Applicant Management
  getApplications: async (params) => {
    const { data } = await api.get('/company/applications', { params });
    return data;
  },

  getApplicationById: async (id) => {
    const { data } = await api.get(`/company/applications/${id}`);
    return data;
  },

  updateApplicationStatus: async (id, status) => {
    const { data } = await api.patch(`/company/applications/${id}/status`, { status });
    return data;
  },

  updateApplicationRating: async (id, rating) => {
    const { data } = await api.patch(`/company/applications/${id}/rating`, { rating });
    return data;
  },

  updateApplicationFeedback: async (id, feedback) => {
    const { data } = await api.patch(`/company/applications/${id}/feedback`, { feedback });
    return data;
  },

  // Company Interview Management
  scheduleInterview: async (interviewData) => {
    const { data } = await api.post('/company/interviews', interviewData);
    return data;
  },

  getInterviews: async (params) => {
    const { data } = await api.get('/company/interviews', { params });
    return data;
  },

  getInterviewById: async (id) => {
    const { data } = await api.get(`/company/interviews/${id}`);
    return data;
  },

  updateInterview: async (id, interviewData) => {
    const { data } = await api.put(`/company/interviews/${id}`, interviewData);
    return data;
  },

  updateInterviewStatus: async (id, status) => {
    const { data } = await api.patch(`/company/interviews/${id}/status`, { status });
    return data;
  },

  addInterviewFeedback: async (id, feedbackData) => {
    const { data } = await api.patch(`/company/interviews/${id}/feedback`, feedbackData);
    return data;
  },

  // Company Notifications
  getNotifications: async (params) => {
    const { data } = await api.get('/company/notifications', { params });
    return data;
  },

  markNotificationAsRead: async (id) => {
    const { data } = await api.patch(`/company/notifications/${id}/read`);
    return data;
  },

  markAllNotificationsAsRead: async () => {
    const { data } = await api.patch('/company/notifications/read-all');
    return data;
  },

  deleteNotification: async (id) => {
    const { data } = await api.delete(`/company/notifications/${id}`);
    return data;
  },
};
