import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';
import { sendOfferLetterEmail, sendOfferAcceptedEmail } from '../email.js';

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

  const { status } = req.body; // 'reviewed', 'accepted', 'rejected', 'offered', 'hired'
  const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected', 'offered', 'hired'];
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

// Issue Formal Offer Letter and Hire Candidate (Employer only)
router.post('/:id/offer', authenticateToken, async (req, res) => {
  if (req.user.role !== 'emp') {
    return res.status(403).json({ error: 'Only employers can issue offer letters' });
  }

  const {
    candidateEmail,
    salary,
    joiningDate,
    location,
    terms,
    customNote,
    designation
  } = req.body;

  const app = db.getAllApplications().find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }
  if (app.employerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only issue offers for your own job candidates' });
  }

  const seeker = db.findUserById(app.seekerId);
  const targetEmail = (candidateEmail && String(candidateEmail).trim().toLowerCase()) || (seeker && seeker.email) || app.seekerEmail;

  if (!targetEmail || !targetEmail.includes('@')) {
    return res.status(400).json({
      error: 'Candidate email address is required to dispatch the official Offer Letter'
    });
  }

  // Ensure seeker's profile email is always updated to targetEmail
  if (seeker && seeker.email !== targetEmail) {
    db.updateUser(seeker.id, { email: targetEmail });
  }

  const refNo = `JS-OFFER-${Date.now().toString().slice(-6)}`;
  const offerDetails = {
    refNo,
    candidateName: app.seekerName,
    candidateEmail: targetEmail,
    candidatePhone: app.seekerPhone,
    designation: (designation && String(designation).trim()) || app.jobTitle,
    salary: (salary && String(salary).trim()) || '₹15,00,000 / yr',
    joiningDate: (joiningDate && String(joiningDate).trim()) || 'Immediate (Within 7 Days)',
    location: (location && String(location).trim()) || 'Bandra Kurla Complex (BKC), Mumbai',
    terms: (terms && String(terms).trim()) || 'Standard company employment policies, 3 months probation period, 30 days notice period.',
    customNote: (customNote && String(customNote).trim()) || '',
    issuedAt: new Date().toISOString(),
    employerName: req.user.name,
    companyName: req.user.companyName || req.user.name,
    status: 'offered'
  };

  // Update application record
  app.status = 'offered';
  app.seekerEmail = targetEmail;
  app.offerLetter = offerDetails;
  app.updatedAt = new Date().toISOString();
  db.save();

  // Send formal Offer Letter email
  const emailResult = await sendOfferLetterEmail({
    candidateEmail: targetEmail,
    candidateName: app.seekerName,
    employerName: req.user.name,
    companyName: req.user.companyName || req.user.name,
    jobTitle: offerDetails.designation,
    salary: offerDetails.salary,
    joiningDate: offerDetails.joiningDate,
    location: offerDetails.location,
    terms: offerDetails.terms,
    refNo
  });

  // Also send an automated congratulatory in-app chat message from Employer to Candidate
  const chatMsg = db.createMessage({
    senderId: req.user.id,
    receiverId: app.seekerId,
    content: `🎉 Congratulations ${app.seekerName}! We have issued your formal Job Offer Letter for "${offerDetails.designation}" at ${offerDetails.companyName} with compensation of ${offerDetails.salary}. An official copy has been dispatched to your email (${targetEmail}). You can also review, download, and accept the offer directly from your Applied Jobs dashboard!`
  });

  if (req.io) {
    req.io.emit('application:updated', app);
    req.io.emit('message:received', chatMsg);
  }

  res.json({
    application: app,
    emailResult,
    message: `Offer letter successfully dispatched to ${targetEmail}!`
  });
});

// Candidate accepts offer (Seeker only)
router.post('/:id/accept-offer', authenticateToken, (req, res) => {
  if (req.user.role !== 'seeker') {
    return res.status(403).json({ error: 'Only job seekers can accept an offer' });
  }

  const app = db.getAllApplications().find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  if (app.seekerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only accept your own job offer' });
  }
  if (app.status !== 'offered') {
    return res.status(400).json({ error: 'No pending offer letter found to accept' });
  }

  app.status = 'hired';
  if (app.offerLetter) {
    app.offerLetter.acceptedAt = new Date().toISOString();
  }
  app.updatedAt = new Date().toISOString();
  db.save();

  const chatMsg = db.createMessage({
    senderId: req.user.id,
    receiverId: app.employerId,
    content: `🤝 I am thrilled to formally accept your Job Offer Letter for "${app.offerLetter?.designation || app.jobTitle}"! Looking forward to joining ${app.offerLetter?.companyName || app.employerName} on ${app.offerLetter?.joiningDate || 'the agreed date'}.`
  });

  if (req.io) {
    req.io.emit('application:updated', app);
    req.io.emit('message:received', chatMsg);
  }

  // Also send an email notification to the Employer
  const employer = db.findUserById(app.employerId);
  if (employer && employer.email) {
    sendOfferAcceptedEmail({
      employerEmail: employer.email,
      employerName: employer.name,
      companyName: app.offerLetter?.companyName || employer.companyName || employer.name,
      candidateName: app.seekerName,
      candidateEmail: app.seekerEmail || req.user.email,
      jobTitle: app.offerLetter?.designation || app.jobTitle,
      salary: app.offerLetter?.salary || app.jobSalary,
      joiningDate: app.offerLetter?.joiningDate || 'Immediate',
      refNo: app.offerLetter?.refNo || `OFFER-${app.id?.slice(-6)}`
    }).catch(err => console.warn('[EmailService] Offer accepted email notification failed:', err));
  }

  res.json({
    application: app,
    message: 'Congratulations! You have accepted the offer and are now officially Hired!'
  });
});

// Candidate declines offer (Seeker only)
router.post('/:id/decline-offer', authenticateToken, (req, res) => {
  if (req.user.role !== 'seeker') {
    return res.status(403).json({ error: 'Only job seekers can decline an offer' });
  }

  const app = db.getAllApplications().find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  if (app.seekerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only decline your own job offer' });
  }

  app.status = 'rejected';
  if (app.offerLetter) {
    app.offerLetter.declinedAt = new Date().toISOString();
  }
  app.updatedAt = new Date().toISOString();
  db.save();

  const chatMsg = db.createMessage({
    senderId: req.user.id,
    receiverId: app.employerId,
    content: `Thank you for the offer for "${app.offerLetter?.designation || app.jobTitle}". After careful consideration, I regret to decline the offer at this time. Thank you for the opportunity.`
  });

  if (req.io) {
    req.io.emit('application:updated', app);
    req.io.emit('message:received', chatMsg);
  }

  res.json({ application: app, message: 'Offer declined' });
});

export default router;
