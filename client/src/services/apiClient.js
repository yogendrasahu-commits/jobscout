import { 
  saveOfflineData, 
  getOfflineData, 
  queueOfflineAction, 
  isAppOnline 
} from '../utils/offlineStorage.js';

/**
 * Enterprise API Client for JobScout
 * Standardizes HTTP communication, headers, error parsing, auth tokens,
 * and transparent Offline-First Stale-While-Revalidate caching.
 */

const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    const savedServer = localStorage.getItem('jobscout_server_url');
    if (savedServer) return savedServer.replace(/\/+$/, '');

    // Detect Capacitor native platform or file/capacitor scheme on Android/iOS
    const isNative = Boolean(
      (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80' || window.location.port === '443'))
    );

    if (isNative) {
      // Connect to local LAN Wi-Fi backend on port 5000
      return 'http://192.168.11.22:5000';
    }
  }
  return '';
};

class ApiClient {
  constructor(baseURL = '') {
    this.customBaseURL = baseURL;
  }

  getBaseURL() {
    return this.customBaseURL || resolveBaseUrl();
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
   * Universal Request Method with Transparent Offline-First Cache Fallback & Outbox
   */
  async request(endpoint, options = {}) {
    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    const cleanEndpoint = endpoint.split('?')[0];

    // 1. If completely offline and making a GET request, immediately serve cached data
    if (isGet && !isAppOnline()) {
      const cached = getOfflineData(endpoint) || getOfflineData(cleanEndpoint);
      if (cached) {
        console.log(`[ApiClient] 📡 Offline mode: serving cached data for ${endpoint}`);
        return cached;
      }
    }

    // 2. If offline and making a mutation (POST, PUT, DELETE), queue in Outbox
    if (!isGet && !isAppOnline()) {
      console.log(`[ApiClient] 📡 Offline mode: queueing mutation in outbox for ${endpoint}`);
      const queued = queueOfflineAction({
        endpoint,
        method: options.method,
        body: options.body
      });
      return {
        success: true,
        offlineQueued: true,
        actionId: queued?.id,
        message: 'Saved in offline outbox. Will sync automatically once online.'
      };
    }

    const url = `${this.getBaseURL()}${endpoint}`;
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

      // Automatically cache successful GET requests in local offline store
      if (isGet && data) {
        saveOfflineData(endpoint, data);
        if (cleanEndpoint !== endpoint) {
          saveOfflineData(cleanEndpoint, data);
        }
      }

      return data;
    } catch (err) {
      // If network failed (Wi-Fi dropped or server unreachable), fallback to offline cache for GET
      if (isGet) {
        const cached = getOfflineData(endpoint) || getOfflineData(cleanEndpoint);
        if (cached) {
          console.warn(`[ApiClient] Network fetch failed, falling back to offline cache for ${endpoint}:`, err.message);
          return cached;
        }
      }

      // If mutation failed because user went offline mid-flight, queue it
      if (!isGet && (!isAppOnline() || err.name === 'TypeError')) {
        const queued = queueOfflineAction({
          endpoint,
          method: options.method,
          body: options.body
        });
        return {
          success: true,
          offlineQueued: true,
          actionId: queued?.id,
          message: 'Network interrupted. Action queued for auto-sync.'
        };
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
