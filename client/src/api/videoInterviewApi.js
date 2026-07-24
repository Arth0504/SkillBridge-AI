import api from './axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const videoInterviewApi = {
  startSession: async (jobId) => {
    const { data } = await api.post(API_ENDPOINTS.VIDEO_INTERVIEW.START, { jobId });
    return data;
  },

  submitResponse: async (sessionId, videoBlob) => {
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('video', videoBlob);
    const { data } = await api.post(API_ENDPOINTS.VIDEO_INTERVIEW.SUBMIT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
