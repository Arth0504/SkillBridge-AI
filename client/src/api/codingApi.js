import api from './axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const codingApi = {
  getChallenge: async (difficulty = 'medium', category = 'data-structures') => {
    const { data } = await api.post(API_ENDPOINTS.CODING.CHALLENGE, { difficulty, category });
    return data;
  },

  submitSolution: async (challengeId, code, language) => {
    const { data } = await api.post(API_ENDPOINTS.CODING.SUBMIT, { challengeId, code, language });
    return data;
  },
};
