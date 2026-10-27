import { apiClient } from './apiClient.js';

export const networkService = {
  /**
   * Connect / toggle connection with another user
   */
  async toggleConnect(userId, targetId) {
    return apiClient.post('/api/network/connect', { userId, targetId });
  },

  /**
   * Get user connections list
   */
  async getConnections(userId) {
    const res = await apiClient.get(`/api/network/${userId}`);
    return res.connections || [];
  }
};
