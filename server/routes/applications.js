import express from 'express';
import { authenticateToken } from './auth.js';
import { applicationController } from '../controllers/applicationController.js';

const router = express.Router();

// Candidate / Seeker Routes
router.post('/', authenticateToken, applicationController.apply);
router.post('/apply', authenticateToken, applicationController.apply);
router.get('/my', authenticateToken, applicationController.getMyApplications);
router.post('/accept-offer', authenticateToken, applicationController.acceptOffer);
router.post('/:id/accept-offer', authenticateToken, applicationController.acceptOffer);
router.post('/decline-offer', authenticateToken, applicationController.declineOffer);
router.post('/:id/decline-offer', authenticateToken, applicationController.declineOffer);

// Employer ATS Routes
router.get('/employer', authenticateToken, applicationController.getEmployerApplications);
router.put('/:id/status', authenticateToken, applicationController.updateStatus);
router.patch('/:id/status', authenticateToken, applicationController.updateStatus);
router.post('/issue-offer', authenticateToken, applicationController.issueOffer);
router.post('/:id/offer', authenticateToken, applicationController.issueOffer);

export default router;
