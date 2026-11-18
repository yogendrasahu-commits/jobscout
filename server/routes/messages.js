import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// 1. Get user's conversation threads summary & available contacts
// (CRITICAL: Must be registered before /:otherUserId parameter route)
router.get('/threads/all', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const allMessages = (db.data.messages || []).filter(
    m => m.senderId === userId || m.receiverId === userId
  );

  const contactMap = new Map();

  allMessages.forEach(m => {
    const otherId = m.senderId === userId ? m.receiverId : m.senderId;
    const msgText = m.message || m.content || '';
    const msgTime = m.timestamp || m.createdAt || new Date().toISOString();

    if (!contactMap.has(otherId)) {
      const otherUser = db.findUserById(otherId);
      contactMap.set(otherId, {
        userId: otherId,
        user: otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          role: otherUser.role,
          avatar: otherUser.avatar,
          companyName: otherUser.companyName,
          title: otherUser.title,
          phone: otherUser.phone,
          isOnline: otherUser.isOnline !== false
        } : { id: otherId, name: 'User' },
        lastMessage: msgText,
        lastTimestamp: msgTime,
        unreadCount: (m.receiverId === userId && !m.read) ? 1 : 0
      });
    } else {
      const existing = contactMap.get(otherId);
      if (new Date(msgTime) > new Date(existing.lastTimestamp)) {
        existing.lastMessage = msgText;
        existing.lastTimestamp = msgTime;
      }
      if (m.receiverId === userId && !m.read) {
        existing.unreadCount += 1;
      }
    }
  });

  const threads = Array.from(contactMap.values()).sort(
    (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
  );

  // Send all other users as available contacts to easily start a new chat
  const allUsers = (db.data.users || []).filter(u => u.id !== userId);
  const contacts = allUsers.map(u => ({
    id: u.id,
    name: u.name,
    role: u.role,
    avatar: u.avatar,
    companyName: u.companyName,
    title: u.title,
    phone: u.phone,
    address: u.address,
    isOnline: u.isOnline !== false
  }));

  res.json({ threads, contacts });
});

// 2. Post a message (REST API endpoint with / and /send alias)
const handlePostMessage = (req, res) => {
  const { receiverId, message, content } = req.body;
  const rawMsg = message !== undefined ? message : content;
  const trimmedMsg = rawMsg ? String(rawMsg).trim() : '';
  if (!receiverId || !trimmedMsg) {
    return res.status(400).json({ error: 'Receiver ID and non-empty message are required' });
  }
  if (receiverId === req.user.id) {
    return res.status(400).json({ error: 'Cannot send message to yourself' });
  }
  if (trimmedMsg.length > 2000) {
    return res.status(400).json({ error: 'Message cannot exceed 2000 characters' });
  }

  const newMsg = db.createMessage({
    senderId: req.user.id,
    receiverId,
    senderName: req.user.name,
    message: trimmedMsg,
    content: trimmedMsg
  });

  if (req.io) {
    req.io.emit('message:received', newMsg);
  }

  res.status(201).json({ message: newMsg });
};

router.post('/', authenticateToken, handlePostMessage);
router.post('/send', authenticateToken, handlePostMessage);

// 3. Get conversation history with specific user
router.get('/:otherUserId', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const otherUserId = req.params.otherUserId;

  const rawMessages = db.getConversation(currentUserId, otherUserId);
  db.markMessagesRead(otherUserId, currentUserId);

  const messages = rawMessages.map(m => {
    const text = m.message || m.content || '';
    const time = m.timestamp || m.createdAt || new Date().toISOString();
    return {
      ...m,
      message: text,
      content: text,
      timestamp: time,
      createdAt: time
    };
  });

  res.json({ messages });
});

// 4. Mark conversation messages as read
const handleMarkRead = (req, res) => {
  const currentUserId = req.user.id;
  const otherUserId = req.params.otherUserId;
  db.markMessagesRead(otherUserId, currentUserId);
  res.json({ success: true, message: 'Messages marked as read' });
};
router.put('/:otherUserId/read', authenticateToken, handleMarkRead);
router.post('/:otherUserId/read', authenticateToken, handleMarkRead);

export default router;
