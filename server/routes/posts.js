import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { parseCookies } from '../middleware/security.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jobradar_secret_jwt_key_2026';

// Optional Authentication Middleware
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = parseCookies(req.headers.cookie)?.jobscout_token;
  const token = bearerToken || cookieToken;
  if (!token) return next();
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) req.user = user;
    next();
  });
};

// GET all posts
router.get('/', (req, res) => {
  try {
    const posts = db.getPosts();
    res.json({ posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Helper to normalize and validate image URLs (extracts direct mediaurl if user pasted a Bing/Google Images search link)
function sanitizeImageUrl(rawUrl) {
  if (!rawUrl || !String(rawUrl).trim()) return null;
  const trimmed = String(rawUrl).trim();
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    const extracted = parsed.searchParams.get('mediaurl') || parsed.searchParams.get('imgurl');
    if (extracted) {
      return decodeURIComponent(extracted);
    }
    return trimmed;
  } catch {
    return null;
  }
}

// POST new post (authenticated author binding if token present)
router.post('/', optionalAuth, (req, res) => {
  try {
    const { authorId, authorName, authorRole, authorTitle, authorAvatar, content, image, tags } = req.body;
    const trimmedContent = content ? String(content).trim() : '';
    if (!trimmedContent) {
      return res.status(400).json({ error: 'Post content is required' });
    }
    if (trimmedContent.length > 3000) {
      return res.status(400).json({ error: 'Post content cannot exceed 3000 characters' });
    }
    if (image && String(image).trim() && !sanitizeImageUrl(image)) {
      return res.status(400).json({ error: 'Please enter a valid http/https image URL' });
    }

    const effAuthorId = req.user ? req.user.id : (authorId || 'guest');
    const effAuthorName = req.user ? req.user.name : (authorName || 'Anonymous User');
    const effAuthorRole = req.user ? req.user.role : (authorRole || 'seeker');
    const effAuthorTitle = req.user ? (req.user.title || req.user.companyName || (req.user.role === 'emp' ? 'Hiring Manager' : 'Job Seeker')) : (authorTitle || (authorRole === 'emp' ? 'Hiring Manager' : 'Job Seeker'));
    const effAuthorAvatar = req.user?.avatar || authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(effAuthorName)}`;

    const newPost = db.createPost({
      authorId: effAuthorId,
      authorName: effAuthorName,
      authorRole: effAuthorRole,
      authorTitle: effAuthorTitle,
      authorAvatar: effAuthorAvatar,
      content: trimmedContent,
      image: sanitizeImageUrl(image),
      tags: Array.isArray(tags) ? tags : []
    });
    res.status(201).json({ post: newPost });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST toggle like on post
router.post('/:id/like', (req, res) => {
  try {
    let { userId } = req.body || {};
    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.decode(token);
        if (decoded && decoded.id) userId = decoded.id;
      } catch {
        // ignore decoding error
      }
    }
    const post = db.likePost(req.params.id, userId || 'anon');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post, likes: post.likes, likedBy: post.likedBy });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// POST comment on post
router.post('/:id/comment', (req, res) => {
  try {
    let { authorName, authorAvatar, text, content } = req.body || {};
    if (!authorName && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.decode(token);
        if (decoded && decoded.name) authorName = decoded.name;
      } catch {
        // ignore decoding error
      }
    }
    const trimmedText = (text || content) ? String(text || content).trim() : '';
    if (!trimmedText) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    if (trimmedText.length > 1000) {
      return res.status(400).json({ error: 'Comment cannot exceed 1000 characters' });
    }
    const post = db.commentPost(req.params.id, {
      authorName: authorName || 'Community Member',
      authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName || 'member')}`,
      text: trimmedText
    });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(201).json({ post, comments: post.comments });
  } catch (err) {
    console.error('Error commenting on post:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
