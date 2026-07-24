import api from './axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const notificationApi = {
  getNotifications: async () => {
    const { data } = await api.get(API_ENDPOINTS.NOTIFICATIONS.BASE);
    return data;
  },

  markAsRead: async (id) => {
    const { data } = await api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return data;
  },
};
