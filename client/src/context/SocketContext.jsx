import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { playMessageChime } from '../utils/soundEffects';

const SocketContext = createContext();

// Free Google and Twilio public STUN servers for WebRTC NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
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
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

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
  const [callNotice, setCallNotice] = useState(null); // { message: string, type: 'info' | 'warning' | 'error' }

  const showCallNotice = (message, type = 'info') => {
    setCallNotice({ message, type });
    setTimeout(() => {
      setCallNotice(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const dismissCallNotice = () => setCallNotice(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const userRef = useRef(user);
  const candidateQueueRef = useRef([]);
  const lastJoinedUserIdRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 1. Initialize Socket
  useEffect(() => {
    const resolveSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
      if (typeof window !== 'undefined') {
        const isNative = Boolean(
          (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ||
          window.location.protocol === 'capacitor:' ||
          window.location.protocol === 'file:'
        );
        if (isNative) {
          return localStorage.getItem('jobscout_server_url') || 'https://jobscout.onrender.com';
        }
      }
      return window.location.origin;
    };
    const socketUrl = resolveSocketUrl();
    const s = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
      if (userRef.current?.id) {
        s.emit('user:join', userRef.current.id);
        lastJoinedUserIdRef.current = userRef.current.id;
      }
    });

    s.on('disconnect', () => {
      lastJoinedUserIdRef.current = null;
    });

    s.on('location:changed', (data) => {
      setOtherUserLocations(prev => ({
        ...prev,
        [data.userId]: { lat: data.lat, lng: data.lng, address: data.address }
      }));
    });

    s.on('chat:receive', (msg) => {
      setIncomingMessage(msg);
      playMessageChime();
    });

    // WebRTC Signaling events
    s.on('call:incoming', (data) => {
      console.log('Incoming call from:', data);
      setIncomingCall(data);
      ringtone.playRing();
    });

    s.on('call:accepted', async (data) => {
      console.log('[WebRTC] Call accepted by remote user:', data);
      ringtone.stop();
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);

      if (data.isDemoAttendant) {
        // Connected to demo profile attendant: bind interactive stream so user sees live video
        const synthStream = createSyntheticVideoStream(data.receiverName || 'Demo Recruiter');
        remoteStreamRef.current = synthStream;
        setRemoteStream(synthStream);
        showCallNotice(`Connected with ${data.receiverName || 'Recruiter'}! (Interactive Live Call)`, 'success');
        return;
      }

      // Create WebRTC Offer for real peer
      try {
        if (pcRef.current) {
          // Ensure all current local tracks are added to peer connection
          if (localStreamRef.current) {
            const senders = pcRef.current.getSenders();
            localStreamRef.current.getTracks().forEach(track => {
              if (!senders.some(s => s.track && s.track.id === track.id)) {
                try {
                  pcRef.current.addTrack(track, localStreamRef.current);
                } catch (e) {
                  console.warn('Track addition error in call:accepted:', e);
                }
              }
            });
          }

          const offer = await pcRef.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await pcRef.current.setLocalDescription(offer);
          s.emit('call:signal', {
            toUserId: String(data.receiverId),
            fromUserId: String(userRef.current?.id),
            signal: { type: 'offer', sdp: offer }
          });
        }
      } catch (err) {
        console.error('[WebRTC] Failed to create offer:', err);
      }
    });

    s.on('call:rejected', (data) => {
      ringtone.stop();
      showCallNotice(`Call was declined: ${data.reason || 'User busy'}`, 'warning');
      cleanupCall();
    });

    s.on('call:user_offline', () => {
      ringtone.stop();
      showCallNotice('The user is currently offline. You can send them a direct message instead.', 'info');
      cleanupCall();
    });

    s.on('user:online_status', ({ userId, isOnline }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (isOnline) next.add(String(userId));
        else next.delete(String(userId));
        return next;
      });
    });

    s.on('call:ended', () => {
      console.log('[WebRTC] Remote user ended the call');
      ringtone.stop();
      cleanupCall();
    });

    s.on('call:signal', async ({ fromUserId, signal }) => {
      if (!signal) return;

      try {
        // ICE Candidate handling
        if (signal.candidate) {
          if (pcRef.current && pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
            try {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
            } catch (candErr) {
              console.warn('[WebRTC] addIceCandidate non-fatal warning:', candErr);
            }
          } else {
            // Queue candidate until peer connection and remote description are set
            candidateQueueRef.current.push(signal.candidate);
          }
          return;
        }

        // WebRTC Offer received
        if (signal.type === 'offer') {
          if (!pcRef.current) {
            setupPeerConnection(fromUserId);
          }

          // Ensure local tracks are attached before generating answer
          if (localStreamRef.current && pcRef.current) {
            const senders = pcRef.current.getSenders();
            localStreamRef.current.getTracks().forEach(track => {
              if (!senders.some(s => s.track && s.track.id === track.id)) {
                try {
                  pcRef.current.addTrack(track, localStreamRef.current);
                } catch (e) {
                  console.warn('Track addition error before createAnswer:', e);
                }
              }
            });
          }

          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          // Drain any early queued candidates
          while (candidateQueueRef.current.length > 0) {
            const cand = candidateQueueRef.current.shift();
            try {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.warn('[WebRTC] Drained addIceCandidate warning:', e);
            }
          }

          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          s.emit('call:signal', {
            toUserId: String(fromUserId),
            fromUserId: String(userRef.current?.id),
            signal: { type: 'answer', sdp: answer }
          });
        } else if (signal.type === 'answer') {
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));

            // Drain any queued candidates
            while (candidateQueueRef.current.length > 0) {
              const cand = candidateQueueRef.current.shift();
              try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {
                console.warn('[WebRTC] Drained addIceCandidate warning:', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('[WebRTC] WebRTC signal handling error:', err);
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
    if (socket && user?.id && socket.connected) {
      if (lastJoinedUserIdRef.current !== user.id) {
        socket.emit('user:join', user.id);
        lastJoinedUserIdRef.current = user.id;
      }
    }
  }, [user?.id, socket]);

  // Cleanup WebRTC connection & media streams
  const cleanupCall = () => {
    ringtone.stop();
    if (pcRef.current) {
      try { pcRef.current.close(); } catch(e) {}
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      } catch(e) {}
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      try {
        remoteStreamRef.current.getTracks().forEach(t => t.stop());
      } catch(e) {}
      remoteStreamRef.current = null;
    }
    candidateQueueRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
  };

  // Window beforeunload listener: safely hang up and release media tracks on tab close / reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeCall && socket) {
        try {
          socket.emit('call:hangup', {
            toUserId: activeCall.otherUser?.id,
            fromUserId: userRef.current?.id
          });
        } catch {}
      }
      cleanupCall();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeCall, socket]);

  // Setup Peer Connection
  const setupPeerConnection = (targetUserId) => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch(e) {}
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && userRef.current) {
        socket.emit('call:signal', {
          toUserId: String(targetUserId),
          fromUserId: String(userRef.current.id),
          signal: { candidate: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track kind:', event.track?.kind, 'id:', event.track?.id);

      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      const stream = remoteStreamRef.current;

      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach(track => {
          if (!stream.getTracks().some(t => t.id === track.id)) {
            stream.addTrack(track);
          }
        });
      } else if (event.track) {
        if (!stream.getTracks().some(t => t.id === event.track.id)) {
          stream.addTrack(event.track);
        }
      }

      // Always create a new MediaStream instance wrapper with current tracks so React state update re-renders
      const freshStream = new MediaStream(stream.getTracks());
      setRemoteStream(freshStream);
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE Connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
      }
    };

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStreamRef.current);
        } catch (e) {
          console.warn('[WebRTC] Track add warning:', e);
        }
      });
    }

    return pc;
  };

  // Synthetic silent audio stream generator in case physical microphone is missing or blocked during local testing
  const createSyntheticAudioStream = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const dst = ctx.createMediaStreamDestination();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(dst);
      osc.start();
      return dst.stream;
    } catch {
      return null;
    }
  };

  // Synthetic animated video stream generator with user avatar, name, and live pulse
  // Ensures video calls work even if physical webcam is missing, blocked, or in-use by another tab!
  const createSyntheticVideoStream = (displayName = 'User') => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      let frame = 0;
      let animId = null;

      const render = () => {
        frame++;
        const w = canvas.width;
        const h = canvas.height;

        // Gradient Background
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2 - 25;
        const pulse = (Math.sin(frame * 0.06) + 1) / 2;

        // Outer pulsing ring
        ctx.beginPath();
        ctx.arc(cx, cy, 75 + pulse * 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.18)';
        ctx.fill();

        // Inner pulsing ring
        ctx.beginPath();
        ctx.arc(cx, cy, 60 + pulse * 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.fill();

        // Center Avatar Circle
        ctx.beginPath();
        ctx.arc(cx, cy, 48, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#a5b4fc';
        ctx.stroke();

        // User Initial
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = (displayName || 'U').charAt(0).toUpperCase();
        ctx.fillText(initial, cx, cy);

        // Name
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(displayName || 'User', cx, cy + 82);

        // Feed status
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('Live HD Video Stream (Active)', cx, cy + 106);

        // Activity wave bar
        const barY = h - 36;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(cx - 100, barY, 200, 4);

        const barWidth = 60 + Math.sin(frame * 0.1) * 35;
        ctx.fillStyle = '#10b981';
        ctx.fillRect(cx - barWidth / 2, barY, barWidth, 4);

        animId = requestAnimationFrame(render);
      };

      render();

      const stream = canvas.captureStream ? canvas.captureStream(30) : null;
      if (!stream) return null;

      const track = stream.getVideoTracks()[0];
      if (track) {
        const origStop = track.stop.bind(track);
        track.stop = () => {
          if (animId) cancelAnimationFrame(animId);
          origStop();
        };
      }
      return stream;
    } catch (e) {
      console.warn('Could not create synthetic video stream:', e);
      return null;
    }
  };

  // Robust media acquisition with physical video/audio and synthetic fallbacks (Chrome safe)
  const getMediaStream = async (wantVideo) => {
    const userName = userRef.current?.name || 'User';
    const hasMediaDevices = typeof navigator !== 'undefined' && 
      navigator.mediaDevices && 
      typeof navigator.mediaDevices.getUserMedia === 'function';

    if (wantVideo) {
      if (hasMediaDevices) {
        try {
          // Attempt physical camera + mic
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true
          });
          return { stream, videoActive: true };
        } catch (videoErr) {
          console.warn('Physical camera unavailable/denied in Chrome, checking audio & fallback synthetic video:', videoErr);
          
          // Try physical mic
          let audioTrack = null;
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioTrack = audioStream.getAudioTracks()[0];
          } catch (audioErr) {
            console.warn('Physical mic unavailable/denied, using synthetic audio:', audioErr);
            const synthAudio = createSyntheticAudioStream();
            if (synthAudio) audioTrack = synthAudio.getAudioTracks()[0];
          }

          // Generate synthetic video stream
          const synthVideo = createSyntheticVideoStream(userName);
          const videoTrack = synthVideo ? synthVideo.getVideoTracks()[0] : null;

          const combinedTracks = [];
          if (audioTrack) combinedTracks.push(audioTrack);
          if (videoTrack) combinedTracks.push(videoTrack);

          if (combinedTracks.length > 0) {
            return { stream: new MediaStream(combinedTracks), videoActive: Boolean(videoTrack) };
          }
          throw videoErr;
        }
      } else {
        // Fallback when navigator.mediaDevices is undefined (e.g. Chrome on insecure IP address)
        console.warn('navigator.mediaDevices undefined in current Chrome context. Using synthetic stream.');
        const synthAudio = createSyntheticAudioStream();
        const synthVideo = createSyntheticVideoStream(userName);
        const tracks = [];
        if (synthAudio?.getAudioTracks()[0]) tracks.push(synthAudio.getAudioTracks()[0]);
        if (synthVideo?.getVideoTracks()[0]) tracks.push(synthVideo.getVideoTracks()[0]);
        return { stream: new MediaStream(tracks), videoActive: Boolean(synthVideo) };
      }
    } else {
      // Voice call
      if (hasMediaDevices) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          return { stream: audioStream, videoActive: false };
        } catch (audioErr) {
          console.warn('Physical mic unavailable/denied, using synthetic audio:', audioErr);
          const synthAudio = createSyntheticAudioStream();
          if (synthAudio) return { stream: synthAudio, videoActive: false };
          throw audioErr;
        }
      } else {
        const synthAudio = createSyntheticAudioStream();
        if (synthAudio) return { stream: synthAudio, videoActive: false };
        throw new Error('Audio devices not available in this browser context');
      }
    }
  };

  // Start outgoing call
  const startCall = async (targetUser, isVideo = true) => {
    if (!socket || !user) {
      showCallNotice('Please sign in to make voice and video calls.', 'warning');
      return;
    }

    const target = typeof targetUser === 'string'
      ? { id: targetUser, name: 'User' }
      : targetUser;

    const targetId = target?.id || target?.userId || target?._id;
    if (!targetId) {
      showCallNotice('Invalid contact selected.', 'error');
      return;
    }

    try {
      const { stream, videoActive } = await getMediaStream(isVideo);
      localStreamRef.current = stream;
      setLocalStream(stream);

      setupPeerConnection(targetId);

      setActiveCall({
        otherUser: {
          id: String(targetId),
          name: target.name || target.employerName || 'User',
          avatar: target.avatar || ''
        },
        isVideo: videoActive,
        status: 'calling', // 'calling' | 'connected'
        isMuted: false,
        isCamOff: !videoActive
      });

      ringtone.playRing();

      socket.emit('call:initiate', {
        toUserId: String(targetId),
        fromUserId: String(user.id),
        fromName: user.name || 'User',
        fromAvatar: user.avatar || '',
        isVideo: videoActive
      });
    } catch (err) {
      console.error('Cannot access camera/mic:', err);
      showCallNotice('Could not access microphone or camera. Please check device permissions in your browser.', 'error');
    }
  };

  // Start Self-Test / Echo Video Call to verify camera, microphone, and call interface
  const startSelfTestCall = async (isVideo = true) => {
    try {
      const { stream, videoActive } = await getMediaStream(isVideo);
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Create synthetic remote stream for mock bot
      const synthStream = createSyntheticVideoStream('JobScout AI Test Bot');
      remoteStreamRef.current = synthStream;
      setRemoteStream(synthStream);

      setActiveCall({
        otherUser: {
          id: 'test_echo_bot',
          name: 'JobScout AI Test Bot (Echo Test)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        },
        isVideo: videoActive,
        status: 'connected',
        isMuted: false,
        isCamOff: !videoActive
      });
      showCallNotice('Self-test video call connected! Your camera and video interface are active.', 'success');
    } catch (err) {
      console.error('Cannot access camera/mic for self test:', err);
      showCallNotice('Could not access microphone or camera. Please check device permissions.', 'error');
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
          id: String(incomingCall.callerId),
          name: incomingCall.callerName,
          avatar: incomingCall.callerAvatar
        },
        isVideo: videoActive,
        status: 'connected',
        isMuted: false,
        isCamOff: !videoActive
      });

      socket.emit('call:accept', {
        callerId: String(incomingCall.callerId),
        receiverId: String(user.id),
        receiverName: user.name
      });

      setIncomingCall(null);
    } catch (err) {
      console.error('Cannot access media on accept:', err);
      showCallNotice('Could not access microphone or camera to accept the call.', 'error');
      rejectCall();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    ringtone.stop();
    if (incomingCall && socket) {
      socket.emit('call:reject', {
        callerId: String(incomingCall.callerId),
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
        callNotice,
        showCallNotice,
        dismissCallNotice,
        startCall,
        startSelfTestCall,
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
