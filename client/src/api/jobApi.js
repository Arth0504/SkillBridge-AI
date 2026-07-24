import api from './axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const jobApi = {
  getJobs: async (params) => {
    const { data } = await api.get(API_ENDPOINTS.JOBS.BASE, { params });
    return data;
  },

  getJobById: async (id) => {
    const { data } = await api.get(API_ENDPOINTS.JOBS.BY_ID(id));
    return data;
  },

  createJob: async (jobData) => {
    const { data } = await api.post('/company/jobs', jobData);
    return data;
  },

  getCompanyJobs: async (params) => {
    const { data } = await api.get('/company/jobs', { params });
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

  applyToJob: async (jobId, applicationData) => {
    const { data } = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return data;
  },
};
