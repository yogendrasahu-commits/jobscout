import { apiClient } from './apiClient.js';

export const jobService = {
  /**
   * Fetch all active jobs with optional filter query parameters
   */
  async getAllJobs(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.jobType && params.jobType !== 'All') query.set('jobType', params.jobType);
    if (params.userLat && params.userLng) {
      query.set('userLat', params.userLat);
      query.set('userLng', params.userLng);
    }
    if (params.maxRadius) query.set('maxRadius', params.maxRadius);

    const queryString = query.toString();
    const res = await apiClient.get(`/api/jobs${queryString ? `?${queryString}` : ''}`);
    return res.jobs || [];
  },

  /**
   * Fetch single job by ID
   */
  async getJobById(jobId) {
    const res = await apiClient.get(`/api/jobs/${jobId}`);
    return res.job;
  },

  /**
   * Post a new job opportunity (Employer only)
   */
  async createJob(jobData) {
    const res = await apiClient.post('/api/jobs', jobData);
    return res.job;
  },

  /**
   * Fetch jobs posted by current employer
   */
  async getMyJobs() {
    const res = await apiClient.get('/api/jobs/my');
    return res.jobs || [];
  },

  /**
   * Delete job posting
   */
  async deleteJob(jobId) {
    return apiClient.delete(`/api/jobs/${jobId}`);
  }
};
