import { apiClient } from './apiClient.js';

export const applicationService = {
  /**
   * Submit job application
   */
  async apply(jobId, coverNote = '') {
    const res = await apiClient.post('/api/applications/apply', { jobId, coverNote });
    return res.application;
  },

  /**
   * Get candidate's applied jobs
   */
  async getMyApplications() {
    const res = await apiClient.get('/api/applications/my');
    return res.applications || [];
  },

  /**
   * Get employer's received applications
   */
  async getEmployerApplications() {
    const res = await apiClient.get('/api/applications/employer');
    return res.applications || [];
  },

  /**
   * Update candidate hiring status
   */
  async updateStatus(applicationId, status) {
    const res = await apiClient.put(`/api/applications/${applicationId}/status`, { status });
    return res.application;
  },

  /**
   * Issue formal job offer letter
   */
  async issueOffer(applicationId, offerData) {
    return apiClient.post(`/api/applications/${applicationId}/offer`, offerData);
  },

  /**
   * Candidate accepts offer letter
   */
  async acceptOffer(applicationId) {
    return apiClient.post(`/api/applications/${applicationId}/accept-offer`);
  },

  /**
   * Candidate declines offer letter
   */
  async declineOffer(applicationId) {
    return apiClient.post(`/api/applications/${applicationId}/decline-offer`);
  }
};
