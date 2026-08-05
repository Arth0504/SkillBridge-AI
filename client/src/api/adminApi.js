import api from './axios';

export const adminApi = {
  // System Telemetry & Infrastructure Metrics
  getSystemMetrics: async () => {
    const { data } = await api.get('/admin/system/metrics');
    return data;
  },

  // Audit Analytics & Log Summary
  getAuditAnalytics: async (params) => {
    const { data } = await api.get('/admin/analytics/audit', { params });
    return data;
  },

  // Enterprise Audit Logs & Activity Center
  getAuditLogs: async (params) => {
    const { data } = await api.get('/audit-logs', { params });
    return data;
  },

  // User Management
  getUsers: async (params) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  updateUserStatus: async (userId, status) => {
    const { data } = await api.patch(`/admin/users/${userId}/status`, { status });
    return data;
  },

  deleteUser: async (userId) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  },

  // Company Moderation & Verification
  getCompanies: async (params) => {
    const { data } = await api.get('/admin/companies', { params });
    return data;
  },

  verifyCompany: async (companyId, payload) => {
    const { data } = await api.patch(`/admin/companies/${companyId}/verify`, payload);
    return data;
  },

  // Job Moderation
  getJobs: async (params) => {
    const { data } = await api.get('/admin/jobs', { params });
    return data;
  },

  moderateJob: async (jobId, payload) => {
    const { data } = await api.patch(`/admin/jobs/${jobId}/moderate`, payload);
    return data;
  },

  deleteJob: async (jobId) => {
    const { data } = await api.delete(`/admin/jobs/${jobId}`);
    return data;
  },

  // System Notifications
  getNotifications: async (params) => {
    const { data } = await api.get('/admin/notifications', { params });
    return data;
  },
};
