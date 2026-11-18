import express from 'express';
import { authenticateToken } from './auth.js';
import { jobController } from '../controllers/jobController.js';

const router = express.Router();

// AI Recommendations & Fit Matching
router.get('/recommended', authenticateToken, jobController.getRecommendedJobs);
router.get('/:id/match', authenticateToken, jobController.getJobAIMatch);

// Protected routes (Employers - must precede /:id to prevent route shadowing)
router.get('/my', authenticateToken, jobController.getMyJobs);

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.post('/', authenticateToken, jobController.createJob);
router.put('/:id', authenticateToken, jobController.updateJob);
router.delete('/:id', authenticateToken, jobController.deleteJob);

export default router;
