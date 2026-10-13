import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Apply for a job (Seeker only)
router.post('/apply', authenticateToken, (req, res) => {
  if (req.user.role !== 'seeker') {
    return res.status(403).json({ error: 'Only job seekers can apply for jobs' });
  }

  const { jobId, coverNote } = req.body;
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  const job = db.findJobById(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Check if already applied
  const existing = db.getAllApplications().find(
    a => a.jobId === jobId && a.seekerId === req.user.id
  );
  if (existing) {
    return res.status(400).json({ error: 'You have already applied for this job' });
  }

  const seeker = db.findUserById(req.user.id);

  const application = db.createApplication({
    jobId,
    jobTitle: job.title,
    employerId: job.employerId,
    employerName: job.employerName,
    seekerId: req.user.id,
    seekerName: req.user.name,
    seekerEmail: req.user.email,
    seekerPhone: seeker ? seeker.phone : '',
    seekerAvatar: seeker ? seeker.avatar : '',
    coverNote: (coverNote && String(coverNote).trim().slice(0, 1000)) || 'I am interested in this role and available for immediate discussion.',
    status: 'pending'
  });

  if (req.io) {
    req.io.emit('application:created', application);
  }

  res.status(201).json({ application });
});

// Get Seeker's applications
router.get('/my', authenticateToken, (req, res) => {
  const apps = db.getApplicationsBySeekerId(req.user.id);
  res.json({ applications: apps });
});

// Get Employer's received applications
router.get('/employer', authenticateToken, (req, res) => {
  if (req.user.role !== 'emp') {
    return res.status(403).json({ error: 'Only employers can view job candidates' });
  }
  const apps = db.getApplicationsByEmployerId(req.user.id);
  res.json({ applications: apps });
});

// Update application status (Employer only)
router.put('/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'emp') {
    return res.status(403).json({ error: 'Only employers can update candidate status' });
  }

  const { status } = req.body; // 'reviewed', 'accepted', 'rejected'
  const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const existingApp = db.getAllApplications().find(a => a.id === req.params.id);
  if (!existingApp) {
    return res.status(404).json({ error: 'Application not found' });
  }
  if (existingApp.employerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only update applications for your own jobs' });
  }

  const updated = db.updateApplicationStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Application not found' });
  }

  if (req.io) {
    req.io.emit('application:updated', updated);
  }

  res.json({ application: updated });
});

export default router;
