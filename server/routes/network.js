import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET network status and connections
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const connections = db.getConnections(userId);
    const allUsers = db.getAllUsers();
    
    // People to recommend (excluding current user and stripping password hashes)
    const recommendations = allUsers
      .filter(u => u.id !== userId)
      .map(({ password: _, ...safeUser }) => safeUser);
    
    res.json({
      connections,
      recommendations,
      stats: {
        connectionsCount: connections.length + 480, // Realistic LinkedIn 500+ scale
        profileViews: 142,
        postImpressions: 1240
      }
    });
  } catch (err) {
    console.error('Error fetching network:', err);
    res.status(500).json({ error: 'Failed to fetch network' });
  }
});

// POST toggle connection
router.post('/connect', (req, res) => {
  try {
    const { userId, targetId } = req.body;
    if (!userId || !targetId) {
      return res.status(400).json({ error: 'userId and targetId are required' });
    }
    if (userId === targetId) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }
    const result = db.toggleConnect(userId, targetId);
    res.json(result);
  } catch (err) {
    console.error('Error toggling connection:', err);
    res.status(500).json({ error: 'Failed to toggle connection' });
  }
});

// POST endorse skill
router.post('/endorse', (req, res) => {
  try {
    const { seekerId, skill, endorserId } = req.body;
    if (!seekerId || !skill) {
      return res.status(400).json({ error: 'seekerId and skill are required' });
    }
    const result = db.endorseSkill(seekerId, skill, endorserId || 'visitor');
    res.json(result);
  } catch (err) {
    console.error('Error endorsing skill:', err);
    res.status(500).json({ error: 'Failed to endorse skill' });
  }
});

export default router;
