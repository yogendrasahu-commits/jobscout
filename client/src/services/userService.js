import { apiClient } from './apiClient.js';

export const userService = {
  /**
   * Fetch all active job seekers
   */
  async getSeekers() {
    const res = await apiClient.get('/api/auth/seekers');
    if (Array.isArray(res)) return res;
    return res?.seekers || [];
  },

  /**
   * Fetch all active employers
   */
  async getEmployers() {
    const res = await apiClient.get('/api/auth/employers');
    if (Array.isArray(res)) return res;
    return res?.employers || [];
  },

  /**
   * Fetch current user profile
   */
  async getCurrentUser() {
    const res = await apiClient.get('/api/auth/me');
    return res.user;
  },

  /**
   * Update user profile information
   */
  async updateProfile(userId, profileData) {
    const res = await apiClient.put(`/api/auth/profile/${userId}`, profileData);
    return res.user;
  }
};
