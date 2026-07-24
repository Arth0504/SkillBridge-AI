import api from './axios';

export const applicationApi = {
  applyJob: async (jobId, applicationData) => {
    const { data } = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return data;
  },

  getMyApplications: async () => {
    const { data } = await api.get('/candidate/applications');
    return data;
  },

  updateStatus: async (applicationId, status) => {
    const { data } = await api.patch(`/company/applications/${applicationId}/status`, { status });
    return data;
  },
};
