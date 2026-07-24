import api from './axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const resumeApi = {
  analyzeResume: async (formData) => {
    const { data } = await api.post(API_ENDPOINTS.RESUME.ANALYZE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  matchWithJob: async (resumeId, jobId) => {
    const { data } = await api.post(API_ENDPOINTS.RESUME.MATCH_JOB, { resumeId, jobId });
    return data;
  },
};
