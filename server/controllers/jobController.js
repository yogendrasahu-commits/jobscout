import { db } from '../db.js';
import { AppError } from '../utils/AppError.js';

// Haversine distance in kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

export const jobController = {
  // Get all jobs with filtering and geo-distance calculations
  getAllJobs: (req, res, next) => {
    try {
      const { userLat, userLng, maxRadius, search, category, jobType } = req.query;
      let jobs = db.getAllJobs();

      if (search) {
        const q = search.toLowerCase();
        jobs = jobs.filter(j =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          (j.skills && j.skills.some(s => s.toLowerCase().includes(q)))
        );
      }

      if (category && category !== 'All') {
        jobs = jobs.filter(j => j.category.toLowerCase() === category.toLowerCase());
      }

      if (jobType && jobType !== 'All') {
        jobs = jobs.filter(j => j.jobType.toLowerCase() === jobType.toLowerCase());
      }

      if (userLat && userLng) {
        const lat = parseFloat(userLat);
        const lng = parseFloat(userLng);
        jobs = jobs.map(j => ({
          ...j,
          distanceKm: getDistanceKm(lat, lng, j.lat, j.lng)
        }));

        if (maxRadius) {
          const radiusKm = parseFloat(maxRadius);
          jobs = jobs.filter(j => j.distanceKm <= radiusKm);
        }

        jobs.sort((a, b) => a.distanceKm - b.distanceKm);
      }

      res.json({ jobs });
    } catch (err) {
      next(err);
    }
  },

  // Get jobs posted by the authenticated employer
  getMyJobs: (req, res, next) => {
    try {
      if (req.user.role !== 'emp') {
        throw AppError.forbidden('Only employers can view their posted jobs');
      }
      const myJobs = db.getAllJobs().filter(j => j.employerId === req.user.id);
      res.json({ jobs: myJobs });
    } catch (err) {
      next(err);
    }
  },

  // Get single job details
  getJobById: (req, res, next) => {
    try {
      const job = db.findJobById(req.params.id);
      if (!job) throw AppError.notFound('Job not found');
      res.json({ job });
    } catch (err) {
      next(err);
    }
  },

  // Post a new job
  createJob: (req, res, next) => {
    try {
      if (req.user.role !== 'emp') {
        throw AppError.forbidden('Only employers can post jobs');
      }

      const { title, company, description, category, jobType, salary, lat, lng, address, skills, urgent } = req.body;

      const trimmedTitle = title ? String(title).trim() : '';
      const trimmedSalary = salary ? String(salary).trim() : '';

      if (trimmedTitle.length < 3) {
        throw AppError.badRequest('Job title must be at least 3 characters long');
      }
      if (trimmedSalary.length < 2) {
        throw AppError.badRequest('Valid salary range is required');
      }

      const nLat = Number(lat);
      const nLng = Number(lng);
      if (!Number.isFinite(nLat) || !Number.isFinite(nLng) || nLat < 6 || nLat > 38 || nLng < 68 || nLng > 98) {
        throw AppError.badRequest('Valid job coordinates within India (Lat 6–38, Lng 68–98) are required');
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
    } catch (err) {
      next(err);
    }
  },

  // Delete a job
  deleteJob: (req, res, next) => {
    try {
      const deleted = db.deleteJob(req.params.id, req.user.id);
      if (!deleted) {
        throw AppError.notFound('Job not found or unauthorized');
      }
      if (req.io) {
        req.io.emit('job:deleted', { id: req.params.id });
      }
      res.json({ success: true, message: 'Job deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};
