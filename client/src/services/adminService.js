const getAuthHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jobradar_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
  // 1. Dashboard Metrics
  async getStats() {
    const res = await fetch('/api/admin/stats', {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin stats');
    return data.stats;
  },

  // 2. Users Management
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/admin/users${query ? `?${query}` : ''}`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data.users;
  },

  async createUser(userData) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data.user;
  },

  async getUserDetails(id) {
    const res = await fetch(`/api/admin/users/${id}`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user details');
    return data;
  },

  async updateUser(id, updates) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user');
    return data.user;
  },

  async deleteUser(id) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  async toggleBlockUser(id) {
    const res = await fetch(`/api/admin/users/${id}/toggle-block`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle block status');
    return data;
  },

  async toggleVerifyUser(id) {
    const res = await fetch(`/api/admin/users/${id}/toggle-verify`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle verification status');
    return data;
  },

  // 3. Jobs Management
  async getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/admin/jobs${query ? `?${query}` : ''}`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch jobs');
    return data.jobs;
  },

  async createJob(jobData) {
    const res = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(jobData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create job');
    return data.job;
  },

  async updateJob(id, updates) {
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update job');
    return data.job;
  },

  async deleteJob(id) {
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete job');
    return data;
  },

  // 4. Locations & Map Radar
  async getLocations() {
    const res = await fetch('/api/admin/locations', {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch locations');
    return data;
  },

  async updateLocation(type, id, coords) {
    const res = await fetch(`/api/admin/locations/${type}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(coords)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update pin location');
    return data;
  },

  // 5. Platform Features & System Broadcast
  async getFeatures() {
    const res = await fetch('/api/admin/features', {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch features');
    return data.features;
  },

  async updateFeatures(features) {
    const res = await fetch('/api/admin/features', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(features)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save features');
    return data.features;
  },

  async broadcastMessage(payload) {
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send broadcast');
    return data;
  }
};

export default adminService;
