import { db } from './db.js';

// In-memory mapping of userId -> Set of socketIds (supports multi-tab)
const userSockets = new Map();

export function setupSocket(io) {
  io.on('connection', (socket) => {
    let currentUserId = null;

    // Register user when they connect
    socket.on('user:join', (userId) => {
      if (!userId) return;
      const uid = String(userId);
      currentUserId = uid;
      socket.userId = uid;

      if (!userSockets.has(uid)) {
        userSockets.set(uid, new Set());
      }
      userSockets.get(uid).add(socket.id);

      // Mark user online
      db.updateUser(uid, { isOnline: true });
      io.emit('user:online_status', { userId: uid, isOnline: true });

      console.log(`User connected: ${uid} (Socket: ${socket.id})`);
    });

    // Uber-style Real-time Location Updates
    socket.on('location:update', (data) => {
      const { userId, lat, lng, address } = data;
      if (!userId || lat === undefined || lng === undefined) return;

      db.updateUser(userId, { lat, lng, ...(address ? { address } : {}) });

      // Broadcast location change to all other users
      socket.broadcast.emit('location:changed', {
        userId,
        lat,
        lng,
        address
      });
    });

    // Real-time Chat
    socket.on('chat:send', (data) => {
      const { senderId, receiverId, message, senderName } = data;
      if (!senderId || !receiverId || !message) return;

      const savedMsg = db.createMessage({
        senderId,
        receiverId,
        senderName: senderName || 'User',
        message
      });

      // Send to recipient if online
      const receiverSockets = userSockets.get(String(receiverId));
      if (receiverSockets) {
        receiverSockets.forEach(socketId => {
          io.to(socketId).emit('chat:receive', savedMsg);
        });
      }

      // Also confirm to sender's own other tabs
      const senderSockets = userSockets.get(String(senderId));
      if (senderSockets) {
        senderSockets.forEach(socketId => {
          io.to(socketId).emit('chat:sent', savedMsg);
        });
      }
    });

    // Typing indicator
    socket.on('chat:typing', ({ senderId, receiverId, isTyping }) => {
      const receiverSockets = userSockets.get(String(receiverId));
      if (receiverSockets) {
        receiverSockets.forEach(socketId => {
          io.to(socketId).emit('chat:typing', { senderId, isTyping });
        });
      }
    });

    // -------------------------------------------------------------
    // WebRTC Real-Time Audio & Video Calling Signaling
    // -------------------------------------------------------------

    // 1. Initiate Call
    socket.on('call:initiate', (payload) => {
      const { toUserId, fromUserId, fromName, fromAvatar, isVideo } = payload;
      const targetId = String(toUserId);
      const receiverSockets = userSockets.get(targetId);

      if (!receiverSockets || receiverSockets.size === 0) {
        // If target is a seeded demo profile, auto-answer via interactive demo attendant
        const targetUser = db.findUserById(targetId);
        if (targetUser && (targetId.startsWith('usr_emp_') || targetId.startsWith('usr_seeker_') || !targetUser.password)) {
          console.log(`[WebRTC] Demo attendant auto-answering call for: ${targetUser.name} (${targetId})`);
          setTimeout(() => {
            socket.emit('call:accepted', {
              receiverId: targetId,
              receiverName: targetUser.name,
              isDemoAttendant: true
            });
          }, 1200);
          return;
        }

        console.log(`[WebRTC] Call initiate failed: target user ${targetId} is offline. Active users:`, Array.from(userSockets.keys()));
        socket.emit('call:user_offline', { toUserId: targetId });
        return;
      }

      console.log(`[WebRTC] Ringing target user ${targetId} on ${receiverSockets.size} socket(s) from caller ${fromUserId} (${fromName})`);
      receiverSockets.forEach(socketId => {
        if (socketId !== socket.id) {
          io.to(socketId).emit('call:incoming', {
            callerId: String(fromUserId),
            callerName: fromName,
            callerAvatar: fromAvatar,
            isVideo: Boolean(isVideo)
          });
        }
      });
    });

    // 2. Accept Call
    socket.on('call:accept', (payload) => {
      const { callerId, receiverId, receiverName } = payload;
      const targetCallerId = String(callerId);
      const callerSockets = userSockets.get(targetCallerId);

      console.log(`[WebRTC] Call accepted by receiver ${receiverId} (${receiverName}) for caller ${targetCallerId}`);
      if (callerSockets) {
        callerSockets.forEach(socketId => {
          if (socketId !== socket.id) {
            io.to(socketId).emit('call:accepted', {
              receiverId: String(receiverId),
              receiverName
            });
          }
        });
      }
    });

    // 3. Reject Call
    socket.on('call:reject', (payload) => {
      const { callerId, reason } = payload;
      const targetCallerId = String(callerId);
      const callerSockets = userSockets.get(targetCallerId);

      console.log(`[WebRTC] Call declined by peer for caller ${targetCallerId}: ${reason}`);
      if (callerSockets) {
        callerSockets.forEach(socketId => {
          if (socketId !== socket.id) {
            io.to(socketId).emit('call:rejected', {
              reason: reason || 'Call declined'
            });
          }
        });
      }
    });

    // 4. WebRTC Signaling Data (Offer, Answer, ICE Candidates)
    socket.on('call:signal', (payload) => {
      const { toUserId, signal, fromUserId } = payload;
      const targetId = String(toUserId);
      const receiverSockets = userSockets.get(targetId);

      if (receiverSockets) {
        receiverSockets.forEach(socketId => {
          if (socketId !== socket.id) {
            io.to(socketId).emit('call:signal', {
              fromUserId: String(fromUserId),
              signal
            });
          }
        });
      }
    });

    // 5. End Call
    socket.on('call:end', (payload) => {
      const { toUserId } = payload;
      const targetId = String(toUserId);
      const receiverSockets = userSockets.get(targetId);

      console.log(`[WebRTC] Call ended for target user ${targetId}`);
      if (receiverSockets) {
        receiverSockets.forEach(socketId => {
          if (socketId !== socket.id) {
            io.to(socketId).emit('call:ended');
          }
        });
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      if (currentUserId && userSockets.has(currentUserId)) {
        const set = userSockets.get(currentUserId);
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(currentUserId);
          db.updateUser(currentUserId, { isOnline: false });
          io.emit('user:online_status', { userId: currentUserId, isOnline: false });
        }
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
