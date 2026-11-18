import { apiClient } from './apiClient.js';

export const adminService = {
  // 1. Dashboard Metrics
  async getStats() {
    const data = await apiClient.get('/api/admin/stats');
    return data.stats;
  },

  // 2. Users Management
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await apiClient.get(`/api/admin/users${query ? `?${query}` : ''}`);
    return data.users;
  },

  async createUser(userData) {
    const data = await apiClient.post('/api/admin/users', userData);
    return data.user;
  },

  async getUserDetails(id) {
    return apiClient.get(`/api/admin/users/${id}`);
  },

  async updateUser(id, updates) {
    const data = await apiClient.put(`/api/admin/users/${id}`, updates);
    return data.user;
  },

  async deleteUser(id) {
    return apiClient.delete(`/api/admin/users/${id}`);
  },

  async toggleBlockUser(id) {
    return apiClient.put(`/api/admin/users/${id}/toggle-block`);
  },

  async toggleVerifyUser(id) {
    return apiClient.put(`/api/admin/users/${id}/toggle-verify`);
  },

  // 3. Jobs Management
  async getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await apiClient.get(`/api/admin/jobs${query ? `?${query}` : ''}`);
    return data.jobs;
  },

  async createJob(jobData) {
    const data = await apiClient.post('/api/admin/jobs', jobData);
    return data.job;
  },

  async updateJob(id, updates) {
    const data = await apiClient.put(`/api/admin/jobs/${id}`, updates);
    return data.job;
  },

  async deleteJob(id) {
    return apiClient.delete(`/api/admin/jobs/${id}`);
  },

  // 4. Locations & Map Radar
  async getLocations() {
    return apiClient.get('/api/admin/locations');
  },

  async updateLocation(type, id, coords) {
    return apiClient.put(`/api/admin/locations/${type}/${id}`, coords);
  },

  // 5. Platform Features & System Broadcast
  async getFeatures() {
    const data = await apiClient.get('/api/admin/features');
    return data.features;
  },

  async updateFeatures(features) {
    const data = await apiClient.put('/api/admin/features', features);
    return data.features;
  },

  async broadcastMessage(payload) {
    return apiClient.post('/api/admin/broadcast', payload);
  }
};

export default adminService;
