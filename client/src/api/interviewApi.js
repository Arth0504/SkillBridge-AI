import api from './axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const interviewApi = {
  generateQuestions: async (role, techStack, experienceLevel) => {
    const { data } = await api.post(API_ENDPOINTS.INTERVIEW.QUESTIONS, { role, techStack, experienceLevel });
    return data;
  },

  evaluateAnswer: async (question, answer) => {
    const { data } = await api.post(API_ENDPOINTS.INTERVIEW.EVALUATE, { question, answer });
    return data;
  },
};
