import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Helper: Haversine distance in kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// Get all jobs with optional geo-distance and filters
router.get('/', (req, res) => {
  const { userLat, userLng, maxRadius, search, category, jobType } = req.query;

  let jobs = db.getAllJobs();

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q) ||
      (j.skills && j.skills.some(s => s.toLowerCase().includes(q)))
    );
  }

  // Category filter
  if (category && category !== 'All') {
    jobs = jobs.filter(j => j.category.toLowerCase() === category.toLowerCase());
  }

  // Job Type filter
  if (jobType && jobType !== 'All') {
    jobs = jobs.filter(j => j.jobType.toLowerCase() === jobType.toLowerCase());
  }

  // Calculate distance if coordinates provided
  if (userLat && userLng) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);
    jobs = jobs.map(j => {
      const distance = getDistanceKm(lat, lng, j.lat, j.lng);
      return { ...j, distanceKm: distance };
    });

    // Radius filter
    if (maxRadius) {
      const radiusKm = parseFloat(maxRadius);
      jobs = jobs.filter(j => j.distanceKm <= radiusKm);
    }

    // Sort by nearest first
    jobs.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  res.json({ jobs });
});

// Get jobs posted by current employer
router.get('/my', authenticateToken, (req, res) => {
  if (req.user.role !== 'emp') {
    return res.status(403).json({ error: 'Only employers can view their posted jobs' });
  }
  const myJobs = db.getAllJobs().filter(j => j.employerId === req.user.id);
  res.json({ jobs: myJobs });
});

// Get single job details
router.get('/:id', (req, res) => {
  const job = db.findJobById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job });
});

// Post a new job (Employer only)
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'emp') {
    return res.status(403).json({ error: 'Only employers can post jobs' });
  }

  const { title, company, description, category, jobType, salary, lat, lng, address, skills, urgent } = req.body;

  const trimmedTitle = title ? String(title).trim() : '';
  const trimmedSalary = salary ? String(salary).trim() : '';

  if (trimmedTitle.length < 3) {
    return res.status(400).json({ error: 'Job title must be at least 3 characters long' });
  }
  if (trimmedSalary.length < 2) {
    return res.status(400).json({ error: 'Valid salary range is required' });
  }

  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng) || nLat < 6 || nLat > 38 || nLng < 68 || nLng > 98) {
    return res.status(400).json({ error: 'Valid job coordinates within India (Lat 6–38, Lng 68–98) are required' });
  }

  const newJob = db.createJob({
    employerId: req.user.id,
    employerName: req.user.name,
    company: company && String(company).trim() ? String(company).trim() : req.user.name,
    title: trimmedTitle,
    description: description ? String(description).trim() : '',
    category: category || 'General',
    jobType: jobType || 'Full-time',
    salary: trimmedSalary,
    lat: nLat,
    lng: nLng,
    address: address && String(address).trim() ? String(address).trim() : 'Mumbai, India',
    skills: Array.isArray(skills) ? skills.filter(Boolean) : (skills ? String(skills).split(',').map(s => s.trim()).filter(Boolean) : []),
    urgent: Boolean(urgent)
  });

  if (req.io) {
    req.io.emit('job:created', newJob);
  }

  res.status(201).json({ job: newJob });
});

// Delete a job (Employer only)
router.delete('/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteJob(req.params.id, req.user.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Job not found or unauthorized' });
  }
  if (req.io) {
    req.io.emit('job:deleted', { id: req.params.id });
  }
  res.json({ success: true, message: 'Job deleted successfully' });
});

export default router;
