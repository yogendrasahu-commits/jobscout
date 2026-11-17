import express from 'express';
import { resumeUpload, videoUpload, imageUpload, mediaStorage } from '../services/mediaStorage.js';
import { authenticateToken } from './auth.js';
import { db } from '../db.js';

const router = express.Router();

/**
 * GET /api/upload/config
 * Returns current media storage engine status (Cloudinary / AWS S3 / Local Disk)
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    storage: mediaStorage.getStatus(),
    supportedEndpoints: [
      { type: 'resume', path: '/api/upload/resume', maxBytes: 10 * 1024 * 1024, allowed: ['pdf', 'doc', 'docx'] },
      { type: 'video', path: '/api/upload/video', maxBytes: 50 * 1024 * 1024, allowed: ['mp4', 'webm', 'mov'] },
      { type: 'image', path: '/api/upload/image', maxBytes: 5 * 1024 * 1024, allowed: ['jpg', 'png', 'webp', 'gif'] }
    ]
  });
});

/**
 * POST /api/upload/resume
 * Upload candidate PDF / DOCX resume
 */
router.post('/resume', authenticateToken, resumeUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded' });
    }

    const uploadResult = await mediaStorage.uploadResume(req.file, req.user, req);

    // Optionally auto-link resumeUrl to seeker's profile
    if (req.user?.id) {
      db.updateUser(req.user.id, { resumeUrl: uploadResult.url });
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: uploadResult
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to upload resume' });
  }
});

/**
 * POST /api/upload/video
 * Upload candidate 60s speed elevator pitch / video intro clip
 */
router.post('/video', authenticateToken, videoUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    const uploadResult = await mediaStorage.uploadVideo(req.file, req.user, req);

    // Auto-link video intro to candidate profile
    if (req.user?.id) {
      db.updateUser(req.user.id, { videoIntroUrl: uploadResult.url });
    }

    res.status(201).json({
      success: true,
      message: 'Video pitch uploaded and processed successfully',
      data: uploadResult
    });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to upload video' });
  }
});

/**
 * POST /api/upload/image
 * Upload profile avatar or company logo
 */
router.post('/image', authenticateToken, imageUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const uploadResult = await mediaStorage.uploadImage(req.file, req.user, req);

    if (req.user?.id) {
      db.updateUser(req.user.id, { avatar: uploadResult.url });
    }

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: uploadResult
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to upload image' });
  }
});

export default router;
