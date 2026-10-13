import express from 'express';
import { db } from '../db.js';

const router = express.Router();

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

// POST new post
router.post('/', (req, res) => {
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

    const newPost = db.createPost({
      authorId: authorId || 'guest',
      authorName: authorName || 'Anonymous User',
      authorRole: authorRole || 'seeker',
      authorTitle: authorTitle || (authorRole === 'emp' ? 'Hiring Manager' : 'Job Seeker'),
      authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName || 'user')}`,
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
    const { userId } = req.body;
    const post = db.likePost(req.params.id, userId || 'anon');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// POST comment on post
router.post('/:id/comment', (req, res) => {
  try {
    const { authorName, authorAvatar, text } = req.body;
    const trimmedText = text ? String(text).trim() : '';
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
    res.json({ post });
  } catch (err) {
    console.error('Error commenting on post:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
