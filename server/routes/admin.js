import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

// Enforce requireAdmin on all /api/admin routes
router.use(requireAdmin);

// -------------------------------------------------------------
// 1. DASHBOARD OVERVIEW & METRICS
// -------------------------------------------------------------
router.get('/stats', (req, res) => {
  try {
    const stats = db.getPlatformStats();
    const mem = process.memoryUsage();
    const features = db.getPlatformFeatures();

    res.json({
      success: true,
      stats: {
        ...stats,
        systemHealth: {
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          memoryHeapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
          memoryRssMb: Math.round(mem.rss / 1024 / 1024),
          serverTime: new Date().toISOString()
        },
        features
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch platform metrics' });
  }
});

// -------------------------------------------------------------
// 2. USERS MANAGEMENT (View, Search, Filter, Update, Delete)
// -------------------------------------------------------------
router.get('/users', (req, res) => {
  try {
    const { search = '', role = 'all', status = 'all' } = req.query;
    let users = db.data.users || [];

    // Filter by role
    if (role && role !== 'all') {
      users = users.filter(u => u.role === role);
    }

    // Filter by status
    if (status === 'blocked') {
      users = users.filter(u => u.isBlocked === true);
    } else if (status === 'verified') {
      users = users.filter(u => u.isVerified === true);
    } else if (status === 'incomplete') {
      users = users.filter(u => u.isProfileComplete === false);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.companyName && u.companyName.toLowerCase().includes(q)) ||
        (u.title && u.title.toLowerCase().includes(q)) ||
        (u.address && u.address.toLowerCase().includes(q))
      );
    }

    // Safe users (strip password)
    const safeUsers = users.map(({ password, ...u }) => ({
      ...u,
      isVerified: Boolean(u.isVerified),
      isBlocked: Boolean(u.isBlocked),
      isProfileComplete: u.isProfileComplete !== false
    }));

    res.json({
      success: true,
      count: safeUsers.length,
      users: safeUsers
    });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
});

// Create new user directly via admin
router.post('/users', async (req, res) => {
  try {
    const { 
      name, email, phone, password, role = 'seeker', 
      title = '', companyName = '', address = 'Mumbai, India',
      lat = 19.0760, lng = 72.8777, skills = [] 
    } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and Password are required' });
    }

    if (email && db.findUserByEmail(email)) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const cleanP = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (cleanP && db.findUserByPhone(cleanP)) {
      return res.status(400).json({ error: 'A user with this mobile number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = db.createUser({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : (cleanP ? `${cleanP}@user.jobradar.io` : `user_${Date.now()}@jobscout.io`),
      phone: cleanP ? `+91 ${cleanP}` : '',
      password: passwordHash,
      role: ['emp', 'seeker', 'admin'].includes(role) ? role : 'seeker',
      title: title.trim(),
      companyName: companyName.trim(),
      skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()) : []),
      address: address.trim(),
      lat: Number(lat) || 19.0760,
      lng: Number(lng) || 72.8777,
      isProfileComplete: true,
      isVerified: true
    });

    const { password: _, ...safeUser } = newUser;
    if (req.io) req.io.emit('user:registered', safeUser);

    res.status(201).json({ success: true, user: safeUser, message: 'User created successfully' });
  } catch (err) {
    console.error('Admin create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get single user details
router.get('/users/:id', (req, res) => {
  const user = db.findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { password: _, ...safeUser } = user;
  const userJobs = (db.data.jobs || []).filter(j => j.employerId === user.id);
  const userApplications = (db.data.applications || []).filter(a => a.seekerId === user.id);

  res.json({
    success: true,
    user: safeUser,
    jobs: userJobs,
    applications: userApplications
  });
});

// Update any user
router.put('/users/:id', async (req, res) => {
  try {
    const user = db.findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { 
      name, email, phone, role, title, companyName, 
      skills, expectedSalary, bio, address, lat, lng,
      isVerified, isBlocked, isProfileComplete, password
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (email !== undefined) {
      const em = String(email).trim().toLowerCase();
      if (em && em !== user.email) {
        const existing = db.findUserByEmail(em);
        if (existing && existing.id !== user.id) {
          return res.status(400).json({ error: 'Email already used by another user' });
        }
      }
      updates.email = em;
    }
    if (phone !== undefined) {
      const pClean = String(phone).replace(/[^0-9]/g, '').slice(-10);
      if (pClean) updates.phone = `+91 ${pClean}`;
    }
    if (role !== undefined && ['seeker', 'emp', 'admin'].includes(role)) {
      updates.role = role;
    }
    if (title !== undefined) updates.title = String(title).trim();
    if (companyName !== undefined) updates.companyName = String(companyName).trim();
    if (skills !== undefined) {
      updates.skills = Array.isArray(skills) ? skills : String(skills).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (expectedSalary !== undefined) updates.expectedSalary = String(expectedSalary).trim();
    if (bio !== undefined) updates.bio = String(bio).trim();
    if (address !== undefined) updates.address = String(address).trim();
    if (lat !== undefined && Number.isFinite(Number(lat))) updates.lat = Number(lat);
    if (lng !== undefined && Number.isFinite(Number(lng))) updates.lng = Number(lng);
    if (isVerified !== undefined) updates.isVerified = Boolean(isVerified);
    if (isBlocked !== undefined) updates.isBlocked = Boolean(isBlocked);
    if (isProfileComplete !== undefined) updates.isProfileComplete = Boolean(isProfileComplete);

    if (password && String(password).length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updated = db.updateUser(user.id, updates);
    const { password: _, ...safeUser } = updated;

    if (req.io) req.io.emit('user:updated', safeUser);

    res.json({ success: true, user: safeUser, message: 'User updated successfully' });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const removed = db.deleteUser(targetId);
    if (!removed) return res.status(404).json({ error: 'User not found' });

    // Clean up associated jobs
    if (db.data.jobs) {
      db.data.jobs = db.data.jobs.filter(j => j.employerId !== targetId);
    }
    // Clean up applications
    if (db.data.applications) {
      db.data.applications = db.data.applications.filter(a => a.seekerId !== targetId && a.employerId !== targetId);
    }
    db.save();

    if (req.io) req.io.emit('user:deleted', { id: targetId });

    res.json({ success: true, message: `User "${removed.name}" deleted successfully` });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Toggle block user
router.put('/users/:id/toggle-block', (req, res) => {
  const user = db.findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot block yourself' });
  }

  const newStatus = !user.isBlocked;
  const updated = db.updateUser(user.id, { isBlocked: newStatus });
  const { password: _, ...safeUser } = updated;

  res.json({
    success: true,
    isBlocked: newStatus,
    user: safeUser,
    message: newStatus ? 'User blocked from platform access' : 'User unblocked'
  });
});

// Toggle verify user
router.put('/users/:id/toggle-verify', (req, res) => {
  const user = db.findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newStatus = !user.isVerified;
  const updated = db.updateUser(user.id, { isVerified: newStatus });
  const { password: _, ...safeUser } = updated;

  res.json({
    success: true,
    isVerified: newStatus,
    user: safeUser,
    message: newStatus ? 'User verified with badge' : 'User verification removed'
  });
});

// -------------------------------------------------------------
// 3. JOBS MANAGEMENT (View, Search, Add, Edit, Delete)
// -------------------------------------------------------------
router.get('/jobs', (req, res) => {
  try {
    const { search = '', status = 'all', category = 'all' } = req.query;
    let jobs = db.data.jobs || [];

    if (status && status !== 'all') {
      jobs = jobs.filter(j => j.status === status);
    }
    if (category && category !== 'all') {
      jobs = jobs.filter(j => (j.category || '').toLowerCase() === category.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      jobs = jobs.filter(j => 
        (j.title && j.title.toLowerCase().includes(q)) ||
        (j.company && j.company.toLowerCase().includes(q)) ||
        (j.employerName && j.employerName.toLowerCase().includes(q)) ||
        (j.address && j.address.toLowerCase().includes(q)) ||
        (Array.isArray(j.skills) && j.skills.some(s => s.toLowerCase().includes(q)))
      );
    }

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (err) {
    console.error('Admin get jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create job via admin
router.post('/jobs', (req, res) => {
  try {
    const {
      title, company, employerName, category = 'Technology',
      jobType = 'Full-time', salary = 'Competitive',
      lat = 19.0760, lng = 72.8777, address = 'Mumbai, India',
      description = '', skills = [], urgent = false, employerId
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Job title is required' });
    }

    const newJob = db.createJob({
      employerId: employerId || req.user.id,
      employerName: employerName || req.user.name || 'JobScout Enterprise',
      company: company || 'JobScout Enterprise',
      title: title.trim(),
      category,
      jobType,
      salary,
      lat: Number(lat) || 19.0760,
      lng: Number(lng) || 72.8777,
      address,
      description,
      skills: Array.isArray(skills) ? skills : String(skills).split(',').map(s => s.trim()).filter(Boolean),
      urgent: Boolean(urgent),
      status: 'open'
    });

    if (req.io) req.io.emit('job:created', newJob);

    res.status(201).json({ success: true, job: newJob, message: 'Job created successfully' });
  } catch (err) {
    console.error('Admin create job error:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job
router.put('/jobs/:id', (req, res) => {
  try {
    const job = db.findJobById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const { 
      title, company, category, jobType, salary, 
      lat, lng, address, description, skills, urgent, status 
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (company !== undefined) updates.company = String(company).trim();
    if (category !== undefined) updates.category = String(category).trim();
    if (jobType !== undefined) updates.jobType = String(jobType).trim();
    if (salary !== undefined) updates.salary = String(salary).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (address !== undefined) updates.address = String(address).trim();
    if (lat !== undefined && Number.isFinite(Number(lat))) updates.lat = Number(lat);
    if (lng !== undefined && Number.isFinite(Number(lng))) updates.lng = Number(lng);
    if (urgent !== undefined) updates.urgent = Boolean(urgent);
    if (status !== undefined && ['open', 'closed', 'paused'].includes(status)) updates.status = status;
    if (skills !== undefined) {
      updates.skills = Array.isArray(skills) ? skills : String(skills).split(',').map(s => s.trim()).filter(Boolean);
    }

    const updated = db.updateJob(job.id, updates);
    if (req.io) req.io.emit('job:updated', updated);

    res.json({ success: true, job: updated, message: 'Job updated successfully' });
  } catch (err) {
    console.error('Admin update job error:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/jobs/:id', (req, res) => {
  try {
    const success = db.adminDeleteJob(req.params.id);
    if (!success) return res.status(404).json({ error: 'Job not found' });

    if (req.io) req.io.emit('job:deleted', { id: req.params.id });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Admin delete job error:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// -------------------------------------------------------------
// 4. LOCATIONS MANAGEMENT & MAP RADAR PINS
// -------------------------------------------------------------
router.get('/locations', (req, res) => {
  try {
    const jobs = (db.data.jobs || []).map(j => ({
      id: j.id,
      title: j.title,
      company: j.company,
      lat: j.lat,
      lng: j.lng,
      address: j.address,
      type: 'job',
      status: j.status,
      urgent: j.urgent
    }));

    const users = (db.data.users || [])
      .filter(u => u.lat && u.lng && u.role !== 'admin')
      .map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        title: u.title || u.companyName,
        lat: u.lat,
        lng: u.lng,
        address: u.address,
        type: u.role === 'emp' ? 'employer' : 'seeker'
      }));

    res.json({
      success: true,
      jobsCount: jobs.length,
      usersCount: users.length,
      locations: [...jobs, ...users]
    });
  } catch (err) {
    console.error('Admin locations error:', err);
    res.status(500).json({ error: 'Failed to fetch location radar data' });
  }
});

// Update entity location
router.put('/locations/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    const { lat, lng, address } = req.body;

    const nLat = Number(lat);
    const nLng = Number(lng);
    if (!Number.isFinite(nLat) || !Number.isFinite(nLng) || nLat < 6 || nLat > 38 || nLng < 68 || nLng > 98) {
      return res.status(400).json({ error: 'Valid Indian coordinates required (Lat 6-38, Lng 68-98)' });
    }

    if (type === 'job') {
      const updated = db.updateJob(id, { lat: nLat, lng: nLng, ...(address ? { address: address.trim() } : {}) });
      if (!updated) return res.status(404).json({ error: 'Job not found' });
      if (req.io) req.io.emit('job:updated', updated);
      return res.json({ success: true, entity: updated, message: 'Job pin location updated' });
    } else if (type === 'user' || type === 'seeker' || type === 'employer') {
      const updated = db.updateUser(id, { lat: nLat, lng: nLng, ...(address ? { address: address.trim() } : {}) });
      if (!updated) return res.status(404).json({ error: 'User not found' });
      const { password: _, ...safeUser } = updated;
      if (req.io) req.io.emit('user:updated', safeUser);
      return res.json({ success: true, entity: safeUser, message: 'User radar pin updated' });
    }

    res.status(400).json({ error: 'Invalid entity type. Must be job or user' });
  } catch (err) {
    console.error('Admin update location error:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// -------------------------------------------------------------
// 5. PLATFORM CONFIGURATION & SYSTEM BROADCAST (Add Functionality)
// -------------------------------------------------------------
router.get('/features', (req, res) => {
  res.json({
    success: true,
    features: db.getPlatformFeatures()
  });
});

router.put('/features', (req, res) => {
  try {
    const updated = db.updatePlatformFeatures(req.body);
    if (req.io) req.io.emit('platform:features_updated', updated);
    res.json({ success: true, features: updated, message: 'Platform functionality settings saved' });
  } catch (err) {
    console.error('Admin update features error:', err);
    res.status(500).json({ error: 'Failed to update platform features' });
  }
});

// Realtime system-wide broadcast alert
router.post('/broadcast', (req, res) => {
  try {
    const { title = 'System Alert', message, type = 'info' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Broadcast message cannot be empty' });
    }

    const alertPayload = {
      id: `alert_${Date.now()}`,
      title,
      message,
      type, // 'info' | 'warning' | 'urgent' | 'success'
      sender: req.user.name || 'System Admin',
      timestamp: new Date().toISOString()
    };

    if (req.io) {
      req.io.emit('system:broadcast', alertPayload);
    }

    res.json({ success: true, alert: alertPayload, message: 'Real-time alert broadcasted to all active users' });
  } catch (err) {
    console.error('Admin broadcast error:', err);
    res.status(500).json({ error: 'Failed to broadcast message' });
  }
});

export default router;
