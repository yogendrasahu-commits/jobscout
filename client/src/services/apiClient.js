/**
 * Enterprise API Client for JobScout
 * Standardizes HTTP communication, headers, error parsing, and auth tokens.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  constructor(baseURL = BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Helper to fetch current auth token from storage
   */
  getToken() {
    try {
      return localStorage.getItem('jobradar_token') || '';
    } catch {
      return '';
    }
  }

  /**
   * Universal Request Method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.error || response.statusText || 'Request failed';
        const err = new Error(errorMsg);
        err.status = response.status;
        err.details = data?.error?.details || data;
        throw err;
      }

      return data;
    } catch (err) {
      if (!navigator.onLine) {
        const netErr = new Error('You are currently offline. Please check your internet connection.');
        netErr.status = 0;
        throw netErr;
      }
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
