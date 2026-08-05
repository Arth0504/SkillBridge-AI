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

  resendCandidateVerification: async (email) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.CANDIDATE_RESEND_VERIFICATION, { email });
    return data;
  },

  verifyEmailCandidate: async (token) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.CANDIDATE_VERIFY_EMAIL, { token });
    return data;
  },

  resendCompanyVerification: async (email) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.COMPANY_RESEND_VERIFICATION, { email });
    return data;
  },

  forgotPasswordCandidate: async (email) => {
    const { data } = await api.post('/auth/candidate/forgot-password', { email });
    return data;
  },

  resetPasswordCandidate: async (token, password) => {
    const { data } = await api.post(`/auth/candidate/reset-password/${token}`, { password });
    return data;
  },

  forgotPasswordCompany: async (email) => {
    const { data } = await api.post('/auth/company/forgot-password', { email });
    return data;
  },

  resetPasswordCompany: async (token, password) => {
    const { data } = await api.post(`/auth/company/reset-password/${token}`, { password });
    return data;
  },
};

