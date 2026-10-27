import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();

// GET all anonymous discussions (with filters: channel, sort, search)
router.get('/', (req, res) => {
  try {
    const { channel, sort, search } = req.query;
    const discussions = db.getAnonDiscussions({ channel, sort, search });
    res.json({ discussions, total: discussions.length });
  } catch (err) {
    console.error('Error fetching anon discussions:', err);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// GET single anonymous discussion by ID
router.get('/:id', (req, res) => {
  try {
    const discussion = db.getAnonDiscussionById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    res.json({ discussion });
  } catch (err) {
    console.error('Error fetching single discussion:', err);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// POST new anonymous discussion
router.post('/', (req, res) => {
  try {
    const { title, content, channel, authorAlias, authorAvatarSeed, authorBadge, userId } = req.body;
    const trimmedTitle = title ? String(title).trim() : '';
    const trimmedContent = content ? String(content).trim() : '';

    if (trimmedTitle.length < 5) {
      return res.status(400).json({ error: 'Discussion title must be at least 5 characters long' });
    }
    if (trimmedTitle.length > 300) {
      return res.status(400).json({ error: 'Discussion title cannot exceed 300 characters' });
    }
    if (trimmedContent.length < 5) {
      return res.status(400).json({ error: 'Discussion content must be at least 5 characters long' });
    }
    if (trimmedContent.length > 5000) {
      return res.status(400).json({ error: 'Discussion content cannot exceed 5000 characters' });
    }

    const newDiscussion = db.createAnonDiscussion({
      title: trimmedTitle,
      content: trimmedContent,
      channel: channel || 'r/ChaiCharcha',
      authorAlias: authorAlias || 'Anonymous Fox',
      authorAvatarSeed: authorAvatarSeed || 'fox',
      authorBadge: authorBadge || 'Verified Community Member',
      userId: userId || null
    });

    // Real-time broadcast to all connected devices/windows
    if (req.io) {
      req.io.emit('anon:created', newDiscussion);
    }

    res.status(201).json({ discussion: newDiscussion });
  } catch (err) {
    console.error('Error creating anon discussion:', err);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

// POST vote on anonymous discussion (upvote +1, downvote -1)
router.post('/:id/vote', (req, res) => {
  try {
    let { userId, direction, type } = req.body || {};
    let voteDir = 1;
    if (type === 'down' || direction === -1 || direction === 'down') {
      voteDir = -1;
    } else if (type === 'up' || direction === 1 || direction === 'up') {
      voteDir = 1;
    } else if (direction !== undefined) {
      voteDir = Number(direction) || 1;
    }

    let voterId = userId;
    if (!voterId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.decode(token);
        if (decoded && decoded.id) voterId = decoded.id;
      } catch {
        // ignore decoding error
      }
    }

    const post = db.voteAnonDiscussion(req.params.id, voterId || 'anon_voter', voteDir);
    if (!post) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    if (req.io) {
      req.io.emit('anon:voted', {
        id: post.id,
        score: post.score,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        upvotedBy: post.upvotedBy,
        downvotedBy: post.downvotedBy
      });
    }

    res.json({
      post,
      score: post.score,
      upvotes: post.upvotes,
      downvotes: post.downvotes
    });
  } catch (err) {
    console.error('Error voting on discussion:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// POST add anonymous comment
router.post('/:id/comments', (req, res) => {
  try {
    const { content, authorAlias, authorAvatarSeed, authorBadge, userId } = req.body;
    const trimmedComment = content ? String(content).trim() : '';
    if (trimmedComment.length < 2) {
      return res.status(400).json({ error: 'Comment must be at least 2 characters long' });
    }
    if (trimmedComment.length > 2000) {
      return res.status(400).json({ error: 'Comment cannot exceed 2000 characters' });
    }

    const result = db.addAnonComment(req.params.id, {
      content: trimmedComment,
      authorAlias: authorAlias || 'Anonymous Contributor',
      authorAvatarSeed: authorAvatarSeed || 'ninja',
      authorBadge: authorBadge || 'Verified Contributor',
      userId: userId || null
    });

    if (!result) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    if (req.io) {
      req.io.emit('anon:comment', {
        postId: req.params.id,
        comment: result.comment,
        commentsCount: result.post.commentsCount
      });
    }

    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// POST react to comment with emoji
router.post('/:id/comments/:commentId/react', (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const result = db.reactAnonComment(req.params.id, req.params.commentId, emoji);
    if (!result) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (req.io) {
      req.io.emit('anon:reaction', {
        postId: req.params.id,
        commentId: req.params.commentId,
        reactions: result.comment.reactions
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Error reacting to comment:', err);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

export default router;
