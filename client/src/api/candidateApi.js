import api from './axios';

export const candidateApi = {
  // Candidate Dashboard
  getDashboardSummary: async () => {
    const { data } = await api.get('/candidate/dashboard');
    return data;
  },

  getDashboardApplications: async (params) => {
    const { data } = await api.get('/candidate/dashboard/applications', { params });
    return data;
  },

  getUpcomingInterviews: async () => {
    const { data } = await api.get('/candidate/dashboard/interviews');
    return data;
  },

  getProfileCompletion: async () => {
    const { data } = await api.get('/candidate/dashboard/profile-completion');
    return data;
  },

  getTimeline: async (params) => {
    const { data } = await api.get('/candidate/dashboard/timeline', { params });
    return data;
  },

  getAnalytics: async () => {
    const { data } = await api.get('/candidate/dashboard/analytics');
    return data;
  },

  // Candidate Profile
  getProfile: async () => {
    const { data } = await api.get('/candidate/profile');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/candidate/profile', profileData);
    return data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const { data } = await api.post('/candidate/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post('/candidate/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Saved Jobs
  getSavedJobs: async (params) => {
    const { data } = await api.get('/candidate/saved-jobs', { params });
    return data;
  },

  saveJob: async (jobId) => {
    const { data } = await api.post(`/candidate/saved-jobs/${jobId}`);
    return data;
  },

  removeSavedJob: async (jobId) => {
    const { data } = await api.delete(`/candidate/saved-jobs/${jobId}`);
    return data;
  },

  // Candidate Applications
  getApplications: async (params) => {
    const { data } = await api.get('/candidate/applications', { params });
    return data;
  },

  getApplicationById: async (id) => {
    const { data } = await api.get(`/candidate/applications/${id}`);
    return data;
  },

  withdrawApplication: async (id, reason) => {
    const { data } = await api.patch(`/candidate/applications/${id}/withdraw`, { reason });
    return data;
  },

  // AI Resume Analyzer
  analyzeResume: async (formDataOrObject) => {
    let response;
    if (formDataOrObject instanceof FormData) {
      response = await api.post('/candidate/resume/analyze', formDataOrObject, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await api.post('/candidate/resume/analyze', formDataOrObject);
    }
    return response.data;
  },

  getResumeHistory: async () => {
    const { data } = await api.get('/candidate/resume/history');
    return data;
  },

  getResumeHistoryById: async (id) => {
    const { data } = await api.get(`/candidate/resume/history/${id}`);
    return data;
  },

  deleteResumeHistory: async (id) => {
    const { data } = await api.delete(`/candidate/resume/history/${id}`);
    return data;
  },

  // AI Mock Interview
  startMockInterview: async (payload) => {
    const { data } = await api.post('/candidate/ai-interview/start', payload);
    return data;
  },

  getMockInterviewHistory: async () => {
    const { data } = await api.get('/candidate/ai-interview/history');
    return data;
  },

  getMockInterviewById: async (sessionId) => {
    const { data } = await api.get(`/candidate/ai-interview/${sessionId}`);
    return data;
  },

  submitInterviewAnswer: async (sessionId, payload) => {
    const { data } = await api.post(`/candidate/ai-interview/${sessionId}/submit-answer`, payload);
    return data;
  },

  finishMockInterview: async (sessionId) => {
    const { data } = await api.post(`/candidate/ai-interview/${sessionId}/finish`);
    return data;
  },

  deleteMockInterviewSession: async (sessionId) => {
    const { data } = await api.delete(`/candidate/ai-interview/history/${sessionId}`);
    return data;
  },

  // AI Coding Assessment
  startCodingAssessment: async (payload) => {
    const { data } = await api.post('/candidate/ai-coding/start', payload);
    return data;
  },

  getCodingHistory: async () => {
    const { data } = await api.get('/candidate/ai-coding/history');
    return data;
  },

  getCodingAssessmentById: async (assessmentId) => {
    const { data } = await api.get(`/candidate/ai-coding/${assessmentId}`);
    return data;
  },

  submitCodingAnswer: async (assessmentId, payload) => {
    const { data } = await api.post(`/candidate/ai-coding/${assessmentId}/submit-answer`, payload);
    return data;
  },

  finishCodingAssessment: async (assessmentId) => {
    const { data } = await api.post(`/candidate/ai-coding/${assessmentId}/finish`);
    return data;
  },

  deleteCodingAssessment: async (assessmentId) => {
    const { data } = await api.delete(`/candidate/ai-coding/history/${assessmentId}`);
    return data;
  },

  // AI Video Interview
  startVideoInterview: async (payload) => {
    const { data } = await api.post('/candidate/video-interview/start', payload);
    return data;
  },

  getVideoInterviewHistory: async () => {
    const { data } = await api.get('/candidate/video-interview/history');
    return data;
  },

  getVideoInterviewById: async (id) => {
    const { data } = await api.get(`/candidate/video-interview/${id}`);
    return data;
  },

  startVideoSession: async (id) => {
    const { data } = await api.post(`/candidate/video-interview/${id}/start-session`);
    return data;
  },

  submitVideoResponse: async (id, payload) => {
    const { data } = await api.post(`/candidate/video-interview/${id}/submit-video`, payload);
    return data;
  },

  finishVideoInterview: async (id) => {
    const { data } = await api.post(`/candidate/video-interview/${id}/finish`);
    return data;
  },

  deleteVideoInterview: async (id) => {
    const { data } = await api.delete(`/candidate/video-interview/history/${id}`);
    return data;
  },

  // Candidate Notifications
  getNotifications: async (params) => {
    const { data } = await api.get('/candidate/notifications', { params });
    return data;
  },

  markNotificationAsRead: async (id) => {
    const { data } = await api.patch(`/candidate/notifications/${id}/read`);
    return data;
  },

  markAllNotificationsAsRead: async () => {
    const { data } = await api.patch('/candidate/notifications/read-all');
    return data;
  },

  deleteNotification: async (id) => {
    const { data } = await api.delete(`/candidate/notifications/${id}`);
    return data;
  },
};
