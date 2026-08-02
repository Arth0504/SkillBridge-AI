import api from './axios';

export const interviewRoomApi = {
  // Schedule a private interview room
  scheduleRoom: async (payload) => {
    const response = await api.post('/interviews/private/schedule', payload);
    return response.data;
  },

  // Get private room details (and participant authorization check)
  getRoomDetails: async (roomId) => {
    const response = await api.get(`/interviews/private/room/${roomId}`);
    return response.data;
  },

  // Save recruiter evaluation scores and notes
  saveNotesAndScores: async (roomId, payload) => {
    const response = await api.post(`/interviews/private/room/${roomId}/notes`, payload);
    return response.data;
  },

  // End interview room session
  endRoomSession: async (roomId) => {
    const response = await api.post(`/interviews/private/room/${roomId}/end`);
    return response.data;
  },
};
