import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// Free Google public STUN servers for WebRTC NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

// Web Audio synthesizer for phone ringtone
class RingtonePlayer {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
  }

  playRing() {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioCtx = new AudioCtx();

      const playTone = () => {
        if (!this.audioCtx || this.audioCtx.state === 'closed') return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 1.2);
      };

      playTone();
      this.intervalId = setInterval(playTone, 2500);
    } catch (e) {
      console.warn('Audio ringtone error:', e);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try { this.audioCtx.close(); } catch(e) {}
      this.audioCtx = null;
    }
  }
}

const ringtone = new RingtonePlayer();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [otherUserLocations, setOtherUserLocations] = useState({});

  // Chat state
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [activeChatUser, setActiveChatUserState] = useState(null);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const setActiveChatUser = (target) => {
    setActiveChatUserState(target);
    if (target) {
      setIsChatDrawerOpen(true);
    }
  };

  const openChatList = () => {
    setActiveChatUserState(null);
    setIsChatDrawerOpen(true);
  };

  const openChatWithUser = (targetUser) => {
    setActiveChatUserState(targetUser);
    setIsChatDrawerOpen(true);
  };

  const closeChatDrawer = () => {
    setIsChatDrawerOpen(false);
  };

  // Calling state
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null); // { otherUser, isVideo, status, isMuted, isCamOff }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const userRef = useRef(user);
  const candidateQueueRef = useRef([]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 1. Initialize Socket
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || window.location.origin;
    const s = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
      if (userRef.current?.id) {
        s.emit('user:join', userRef.current.id);
      }
    });

    s.on('location:changed', (data) => {
      setOtherUserLocations(prev => ({
        ...prev,
        [data.userId]: { lat: data.lat, lng: data.lng, address: data.address }
      }));
    });

    s.on('chat:receive', (msg) => {
      setIncomingMessage(msg);
    });

    // WebRTC Signaling events
    s.on('call:incoming', (data) => {
      console.log('Incoming call from:', data);
      setIncomingCall(data);
      ringtone.playRing();
    });

    s.on('call:accepted', async (data) => {
      console.log('Call accepted by remote user');
      ringtone.stop();
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);

      // Create WebRTC Offer
      try {
        if (pcRef.current) {
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
          s.emit('call:signal', {
            toUserId: data.receiverId,
            fromUserId: userRef.current?.id,
            signal: { type: 'offer', sdp: offer }
          });
        }
      } catch (err) {
        console.error('Failed to create offer:', err);
      }
    });

    s.on('call:rejected', (data) => {
      ringtone.stop();
      alert(`Call was declined: ${data.reason || 'User busy'}`);
      cleanupCall();
    });

    s.on('call:user_offline', () => {
      ringtone.stop();
      alert('The user is currently offline. You can send them a chat message instead.');
      cleanupCall();
    });

    s.on('user:online_status', ({ userId, isOnline }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    s.on('call:ended', () => {
      ringtone.stop();
      cleanupCall();
    });

    s.on('call:signal', async ({ fromUserId, signal }) => {
      if (!pcRef.current) return;

      try {
        if (signal.type === 'offer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          
          // Drain queued candidates if any
          while (candidateQueueRef.current.length > 0) {
            const cand = candidateQueueRef.current.shift();
            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }

          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          s.emit('call:signal', {
            toUserId: fromUserId,
            fromUserId: userRef.current?.id,
            signal: { type: 'answer', sdp: answer }
          });
        } else if (signal.type === 'answer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          
          // Drain queued candidates if any
          while (candidateQueueRef.current.length > 0) {
            const cand = candidateQueueRef.current.shift();
            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
        } else if (signal.candidate) {
          if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
          } else {
            candidateQueueRef.current.push(signal.candidate);
          }
        }
      } catch (err) {
        console.error('WebRTC signal handling error:', err);
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
      ringtone.stop();
    };
  }, []);

  // Update socket on user change
  useEffect(() => {
    if (socket && user?.id) {
      socket.emit('user:join', user.id);
    }
  }, [user?.id, socket]);

  // Cleanup WebRTC connection & media streams
  const cleanupCall = () => {
    ringtone.stop();
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    remoteStreamRef.current = null;
    setActiveCall(null);
    setIncomingCall(null);
  };

  // Setup Peer Connection
  const setupPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && userRef.current) {
        socket.emit('call:signal', {
          toUserId: targetUserId,
          fromUserId: userRef.current.id,
          signal: { candidate: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.streams);
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        setRemoteStream(event.streams[0]);
      }
    };

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    return pc;
  };

  // Robust media acquisition with video -> audio fallback
  const getMediaStream = async (wantVideo) => {
    if (wantVideo) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        return { stream, videoActive: true };
      } catch (videoErr) {
        console.warn('Video device unavailable or denied, falling back to audio-only:', videoErr);
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          return { stream: audioStream, videoActive: false };
        } catch (audioErr) {
          throw audioErr;
        }
      }
    } else {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return { stream: audioStream, videoActive: false };
    }
  };

  // Start outgoing call
  const startCall = async (targetUser, isVideo = true) => {
    if (!socket || !user) return;
    try {
      const { stream, videoActive } = await getMediaStream(isVideo);
      localStreamRef.current = stream;
      setLocalStream(stream);

      setupPeerConnection(targetUser.id);

      setActiveCall({
        otherUser: targetUser,
        isVideo: videoActive,
        status: 'calling', // 'calling' | 'connected'
        isMuted: false,
        isCamOff: !videoActive
      });

      ringtone.playRing();

      socket.emit('call:initiate', {
        toUserId: targetUser.id,
        fromUserId: user.id,
        fromName: user.name,
        fromAvatar: user.avatar,
        isVideo: videoActive
      });
    } catch (err) {
      console.error('Cannot access camera/mic:', err);
      alert('Could not access microphone or camera. Please verify device permissions in your browser.');
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingCall || !socket || !user) return;
    ringtone.stop();

    try {
      const { stream, videoActive } = await getMediaStream(incomingCall.isVideo);
      localStreamRef.current = stream;
      setLocalStream(stream);

      setupPeerConnection(incomingCall.callerId);

      setActiveCall({
        otherUser: {
          id: incomingCall.callerId,
          name: incomingCall.callerName,
          avatar: incomingCall.callerAvatar
        },
        isVideo: videoActive,
        status: 'connected',
        isMuted: false,
        isCamOff: !videoActive
      });

      socket.emit('call:accept', {
        callerId: incomingCall.callerId,
        receiverId: user.id,
        receiverName: user.name
      });

      setIncomingCall(null);
    } catch (err) {
      console.error('Cannot access media on accept:', err);
      alert('Could not access microphone or camera to accept call.');
      rejectCall();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    ringtone.stop();
    if (incomingCall && socket) {
      socket.emit('call:reject', {
        callerId: incomingCall.callerId,
        reason: 'Call declined by user'
      });
    }
    setIncomingCall(null);
  };

  // End active call
  const endCall = () => {
    if (activeCall && socket) {
      socket.emit('call:end', {
        toUserId: activeCall.otherUser.id
      });
    }
    cleanupCall();
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setActiveCall(prev => prev ? { ...prev, isMuted: !audioTrack.enabled } : null);
      }
    }
  };

  // Toggle Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setActiveCall(prev => prev ? { ...prev, isCamOff: !videoTrack.enabled } : null);
      }
    }
  };

  // Broadcast location change
  const broadcastLocation = (lat, lng, address) => {
    if (socket && user?.id) {
      socket.emit('location:update', {
        userId: user.id,
        lat,
        lng,
        address
      });
    }
  };

  // Send Chat message
  const sendMessage = (receiverId, messageText) => {
    if (socket && user?.id) {
      socket.emit('chat:send', {
        senderId: user.id,
        senderName: user.name,
        receiverId,
        message: messageText
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        otherUserLocations,
        incomingMessage,
        activeChatUser,
        setActiveChatUser,
        isChatDrawerOpen,
        setIsChatDrawerOpen,
        openChatList,
        openChatWithUser,
        closeChatDrawer,
        sendMessage,
        broadcastLocation,
        // WebRTC Calling
        incomingCall,
        activeCall,
        localStream,
        remoteStream,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
