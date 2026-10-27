import express from 'express';
import { authenticateToken } from './auth.js';
import { jobController } from '../controllers/jobController.js';

const router = express.Router();

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Protected routes (Employers)
router.get('/my', authenticateToken, jobController.getMyJobs);
router.post('/', authenticateToken, jobController.createJob);
router.delete('/:id', authenticateToken, jobController.deleteJob);

export default router;
