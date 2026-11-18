/**
 * Enterprise Offline Storage & Background Sync Engine for JobScout
 * Enables 100% offline functionality across Web, PWA, and Capacitor Mobile App.
 */

const CACHE_PREFIX = 'jobscout_cache_';
const OUTBOX_KEY = 'jobscout_offline_outbox';

// High-fidelity Pre-Seeded Offline Demo Dataset (Available on 0-connection first launch)
export const SEED_OFFLINE_JOBS = [
  {
    id: 'job_off_1',
    title: 'Senior WebRTC & Full Stack Engineer',
    company: 'TechMatrix Systems Pvt Ltd',
    category: 'Engineering & Tech',
    type: 'Full-time',
    location: 'Bandra Kurla Complex (BKC), Mumbai',
    lat: 19.0660,
    lng: 72.8680,
    salary: '₹26,00,000 - ₹35,00,000 / yr',
    skills: ['React', 'WebRTC', 'Node.js', 'Socket.IO', 'Docker'],
    description: 'Lead next-generation peer-to-peer real-time video streaming architecture, collaborative code sandboxes, and low-latency microservices.',
    isOfflineCached: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job_off_2',
    title: 'Staff Cloud Architect (AWS & Kubernetes)',
    company: 'CloudSphere Global',
    category: 'Cloud Infrastructure',
    type: 'Full-time',
    location: 'Andheri East, Mumbai',
    lat: 19.1136,
    lng: 72.8697,
    salary: '₹30,00,000 - ₹45,00,000 / yr',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Go'],
    description: 'Scale multi-region high-concurrency microservices clusters with 99.99% uptime and zero-trust security postures.',
    isOfflineCached: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job_off_3',
    title: 'Senior React & Mobile PWA Developer',
    company: 'HyperLocal Mobility Inc',
    category: 'Engineering & Tech',
    type: 'Full-time',
    location: 'Lower Parel, Mumbai',
    lat: 18.9950,
    lng: 72.8310,
    salary: '₹20,00,000 - ₹28,00,000 / yr',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Capacitor', 'PWA'],
    description: 'Design Apple-grade luxury user interfaces, offline-first data caching architectures, and instant hyperlocal transit radar maps.',
    isOfflineCached: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job_off_4',
    title: 'Lead Product Designer (UI/UX)',
    company: 'FinPulse Technologies',
    category: 'Design & Creative Media',
    type: 'Remote',
    location: 'Nariman Point, Mumbai',
    lat: 18.9256,
    lng: 72.8242,
    salary: '₹18,00,000 - ₹26,00,000 / yr',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'Micro-Interactions', 'Prototyping'],
    description: 'Craft modern, tactile, and highly responsive user journeys across Web, iOS, and Android mobile applications.',
    isOfflineCached: true,
    createdAt: new Date().toISOString()
  }
];

export const SEED_OFFLINE_SEEKERS = [
  {
    id: 'seeker_off_1',
    name: 'Rahul Sharma',
    title: 'Senior Full Stack & WebRTC Specialist',
    skills: ['React', 'Node.js', 'WebRTC', 'Tailwind CSS', 'Docker'],
    address: 'BKC, Mumbai, Maharashtra',
    lat: 19.0665,
    lng: 72.8685,
    experience: '5+ Years',
    expectedSalary: '₹28,00,000 / yr',
    isOnline: true,
    isOfflineCached: true
  },
  {
    id: 'seeker_off_2',
    name: 'Priya Nair',
    title: 'Lead Cloud & DevOps Engineer',
    skills: ['Kubernetes', 'AWS', 'Docker', 'Python', 'CI/CD'],
    address: 'Powai, Mumbai',
    lat: 19.1176,
    lng: 72.9060,
    experience: '6 Years',
    expectedSalary: '₹32,00,000 / yr',
    isOnline: true,
    isOfflineCached: true
  }
];

export const SEED_OFFLINE_EMPLOYERS = [
  {
    id: 'emp_off_1',
    name: 'TechMatrix Systems Pvt Ltd',
    companyName: 'TechMatrix Systems',
    industry: 'Technology & IT',
    address: 'Bandra Kurla Complex (BKC), Mumbai',
    lat: 19.0660,
    lng: 72.8680,
    activeOpenings: 5,
    isOnline: true,
    isOfflineCached: true
  },
  {
    id: 'emp_off_2',
    name: 'CloudSphere Global',
    companyName: 'CloudSphere Global',
    industry: 'Cloud Infrastructure',
    address: 'Andheri East, Mumbai',
    lat: 19.1136,
    lng: 72.8697,
    activeOpenings: 3,
    isOnline: true,
    isOfflineCached: true
  }
];

export const SEED_OFFLINE_POSTS = [
  {
    id: 'post_off_1',
    authorId: 'usr_emp_1',
    authorName: 'TechMatrix Systems Pvt Ltd',
    authorRole: 'emp',
    authorTitle: 'Engineering & Technology • BKC Mumbai',
    content: 'We are actively expanding our Core Platform team at BKC Mumbai! Open roles for Senior Full Stack Engineers, WebRTC Leads, and Kubernetes DevOps Architects. Offline-first candidate profiles are actively being reviewed.',
    likes: 42,
    likedBy: [],
    comments: [],
    tags: ['#Hiring', '#WebRTC', '#Engineering', '#MumbaiTech'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'post_off_2',
    authorId: 'usr_seek_1',
    authorName: 'Rahul Sharma',
    authorRole: 'seeker',
    authorTitle: 'Senior Full Stack & WebRTC Specialist',
    content: 'Delighted to demonstrate our latest low-latency peer-to-peer real-time communication framework with offline resilience. Ready for immediate technical discussions!',
    likes: 29,
    likedBy: [],
    comments: [],
    tags: ['#WebRTC', '#OpenToWork', '#FullStack'],
    createdAt: new Date().toISOString()
  }
];

export const SEED_OFFLINE_ANON = [
  {
    id: 'anon_off_1',
    title: 'Offline Resilient Mobile Engineering in 2026: What top firms test for',
    content: 'Leading tech firms in BKC and Bengaluru now specifically test candidates on Service Worker lifecycle, IndexedDB cache synchronization, and graceful degradations when network drops to 2G or offline.',
    channel: 'SalaryTalk',
    authorAlias: 'Zen Owl #214',
    authorAvatarSeed: 'owl',
    authorBadge: 'Staff Engineer',
    score: 84,
    upvotes: 89,
    downvotes: 5,
    upvotedBy: [],
    downvotedBy: [],
    commentsCount: 4,
    comments: [],
    views: 612,
    createdAt: new Date().toISOString()
  }
];

/**
 * Check if browser/device is currently online
 */
export const isAppOnline = () => {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true;
};

/**
 * Save data to local offline storage with timestamp
 */
export const saveOfflineData = (key, data) => {
  try {
    if (typeof localStorage === 'undefined') return;
    const payload = {
      timestamp: Date.now(),
      data
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch (err) {
    console.warn(`[OfflineStorage] Failed to save cache for key "${key}":`, err);
  }
};

/**
 * Retrieve data from local offline storage with intelligent fallback
 */
export const getOfflineData = (key, fallback = null) => {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data !== undefined) {
        return parsed.data;
      }
    }
  } catch (err) {
    console.warn(`[OfflineStorage] Failed to read cache for key "${key}":`, err);
  }

  // Supply default seed data if initial cache is missing
  if (key === 'jobs' || key === '/api/jobs') return SEED_OFFLINE_JOBS;
  if (key === 'seekers' || key === '/api/auth/seekers' || key === '/api/users/seekers') return SEED_OFFLINE_SEEKERS;
  if (key === 'employers' || key === '/api/auth/employers' || key === '/api/users/employers') return SEED_OFFLINE_EMPLOYERS;
  if (key === 'posts' || key === '/api/posts') return SEED_OFFLINE_POSTS;
  if (key === 'anonDiscussions' || key === '/api/anon' || key === '/api/discussions') return SEED_OFFLINE_ANON;

  return fallback;
};

/**
 * Queue an offline mutation (POST, PUT, DELETE) in the Outbox
 */
export const queueOfflineAction = (action) => {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(OUTBOX_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    
    const newAction = {
      id: `outbox_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      status: 'pending',
      ...action
    };

    queue.push(newAction);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(queue));
    console.log(`[OfflineStorage] Action queued in outbox (${queue.length} pending):`, newAction.type || newAction.endpoint);
    return newAction;
  } catch (err) {
    console.error('[OfflineStorage] Error queueing offline action:', err);
    return null;
  }
};

/**
 * Get all pending actions in the Outbox
 */
export const getOfflineQueue = () => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Clear or filter out a synced action by ID
 */
export const removeOfflineAction = (actionId) => {
  try {
    if (typeof localStorage === 'undefined') return;
    const queue = getOfflineQueue().filter(item => item.id !== actionId);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[OfflineStorage] Failed to remove offline action:', err);
  }
};

/**
 * Flush and synchronize all pending Outbox actions with the backend API
 */
export const syncOfflineOutbox = async (apiClient) => {
  if (!isAppOnline()) return { synced: 0, pending: getOfflineQueue().length };

  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, pending: 0 };

  console.log(`[OfflineSync] Starting sync for ${queue.length} pending action(s)...`);
  let syncedCount = 0;

  for (const item of queue) {
    try {
      const { endpoint, method = 'POST', body } = item;
      await apiClient.request(endpoint, {
        method,
        body
      });
      removeOfflineAction(item.id);
      syncedCount++;
      console.log(`[OfflineSync] ✓ Synced action: ${item.type || endpoint}`);
    } catch (err) {
      console.warn(`[OfflineSync] Failed to sync action ${item.id}:`, err.message);
      // Stop or keep in queue if network error recurs
      if (!isAppOnline()) break;
    }
  }

  return { synced: syncedCount, pending: getOfflineQueue().length };
};
