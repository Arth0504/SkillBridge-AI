import api from './axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const authApi = {
  loginCandidate: async (credentials) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.CANDIDATE_LOGIN, credentials);
    return data;
  },

  registerCandidate: async (userData) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.CANDIDATE_REGISTER, userData);
    return data;
  },

  loginCompany: async (credentials) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.COMPANY_LOGIN, credentials);
    return data;
  },

  registerCompany: async (companyData) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.COMPANY_REGISTER, companyData);
    return data;
  },

  getMeCandidate: async () => {
    const { data } = await api.get(API_ENDPOINTS.AUTH.CANDIDATE_ME);
    return data;
  },

  getMeCompany: async () => {
    const { data } = await api.get(API_ENDPOINTS.AUTH.COMPANY_ME);
    return data;
  },

  logoutCandidate: async () => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.CANDIDATE_LOGOUT);
    return data;
  },

  logoutCompany: async () => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.COMPANY_LOGOUT);
    return data;
  },
};
