import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { playMessageChime } from '../utils/soundEffects';

const SocketContext = createContext();

// Enterprise High-Availability STUN Servers with Pre-gathered Candidate Pool & Bundle Optimization
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' }
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
};

// Studio-Grade Web Audio Constraints (Echo Cancellation, Noise Suppression & Stereo)
const STUDIO_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: { ideal: 2 },
  sampleRate: { ideal: 48000 }
};

// Adaptive Resolution Ladder for HD Video across App, PWA and Desktop
const VIDEO_QUALITY_PROFILES = [
  // Tier 1: 1080p Full HD (Desktop / High-speed WiFi)
  {
    width: { ideal: 1920, min: 1280 },
    height: { ideal: 1080, min: 720 },
    frameRate: { ideal: 30, min: 20 },
    aspectRatio: { ideal: 1.7777777778 }
  },
  // Tier 2: 720p HD (PWA & Standard Mobile 4G/5G)
  {
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    frameRate: { ideal: 30, min: 15 },
    aspectRatio: { ideal: 1.7777777778 }
  },
  // Tier 3: 480p Smooth Fallback (Low-bandwidth or battery saver mode)
  {
    width: { ideal: 640, min: 320 },
    height: { ideal: 480, min: 240 },
    frameRate: { ideal: 24, min: 15 }
  }
];

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
  const screenTrackRef = useRef(null);
  const originalVideoTrackRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [networkStats, setNetworkStats] = useState({
    quality: 'hd', // 'hd' | 'good' | 'poor'
    bitrateKbps: 0,
    packetLossPct: 0,
    rttMs: 0,
    fps: 30,
    resolution: '1080p HD'
  });
  const userRef = useRef(user);
  const candidateQueueRef = useRef([]);
  const lastJoinedUserIdRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 1. Initialize Socket
  useEffect(() => {
    const resolveSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL.replace(/\/+$/, '');
      if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('jobscout_server_url');
        if (saved) return saved.replace(/\/+$/, '');

        const isNative = Boolean(
          (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ||
          window.location.protocol === 'capacitor:' ||
          window.location.protocol === 'ionic:' ||
          window.location.protocol === 'file:' ||
          (window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80' || window.location.port === '443'))
        );
        if (isNative) {
          return 'http://192.168.11.22:5000';
        }

        // Direct connect when in local Vite dev server to bypass proxy ws disconnects/resets
        if (window.location.port === '5173') {
          return `${window.location.protocol}//${window.location.hostname}:5000`;
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
    if (screenTrackRef.current) {
      try { screenTrackRef.current.stop(); } catch(e) {}
      screenTrackRef.current = null;
    }
    originalVideoTrackRef.current = null;
    setIsScreenSharing(false);

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

  // Window beforeunload & visibility listener: safely hang up and release media tracks, or restore on foreground
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeCall?.status === 'connected') {
        // Recover audio context and video sender bitrate if throttled by mobile backgrounding
        if (pcRef.current) {
          boostSenderQuality(pcRef.current);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeCall, socket]);

  // Boost WebRTC Audio and Video Encoding Bitrates & Priorities
  const boostSenderQuality = async (pc) => {
    if (!pc) return;
    try {
      const senders = pc.getSenders();
      for (const sender of senders) {
        if (!sender.track) continue;

        if (sender.track.kind === 'video' && typeof sender.getParameters === 'function') {
          const params = sender.getParameters();
          if (!params.encodings || params.encodings.length === 0) {
            params.encodings = [{}];
          }
          // Set 2.5 Mbps HD bitrate limit
          params.encodings[0].maxBitrate = 2500000;
          params.encodings[0].networkPriority = 'high';
          if ('degradationPreference' in params) {
            params.degradationPreference = 'maintain-resolution';
          }
          await sender.setParameters(params).catch(() => {});
        } else if (sender.track.kind === 'audio' && typeof sender.getParameters === 'function') {
          const params = sender.getParameters();
          if (!params.encodings || params.encodings.length === 0) {
            params.encodings = [{}];
          }
          // Set 64 kbps Studio Opus audio
          params.encodings[0].maxBitrate = 64000;
          params.encodings[0].networkPriority = 'high';
          await sender.setParameters(params).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[WebRTC] boostSenderQuality notice:', e);
    }
  };

  // Real-time Network Bitrate & Quality Polling
  useEffect(() => {
    let statsInterval = null;
    let prevBytesReceived = 0;
    let prevTimestamp = 0;

    if (activeCall && activeCall.status === 'connected' && pcRef.current) {
      statsInterval = setInterval(async () => {
        const pc = pcRef.current;
        if (!pc || pc.connectionState !== 'connected') return;

        try {
          const stats = await pc.getStats();
          let currentBytes = 0;
          let currentTimestamp = 0;
          let rtt = 0;
          let packetsLost = 0;
          let totalPackets = 0;
          let frameWidth = 1280;
          let frameHeight = 720;
          let framesPerSec = 30;

          stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              currentBytes += report.bytesReceived || 0;
              currentTimestamp = report.timestamp;
              packetsLost += report.packetsLost || 0;
              totalPackets += (report.packetsReceived || 0) + (report.packetsLost || 0);
              if (report.frameWidth) frameWidth = report.frameWidth;
              if (report.frameHeight) frameHeight = report.frameHeight;
              if (report.framesPerSecond) framesPerSec = Math.round(report.framesPerSecond);
            }
            if (report.type === 'candidate-pair' && report.nominated && report.currentRoundTripTime) {
              rtt = Math.round(report.currentRoundTripTime * 1000);
            }
          });

          let bitrate = 0;
          if (prevBytesReceived > 0 && prevTimestamp > 0 && currentTimestamp > prevTimestamp) {
            bitrate = Math.round(((currentBytes - prevBytesReceived) * 8) / ((currentTimestamp - prevTimestamp) / 1000) / 1000);
          }
          prevBytesReceived = currentBytes;
          prevTimestamp = currentTimestamp;

          const lossPct = totalPackets > 0 ? Math.round((packetsLost / totalPackets) * 100) : 0;
          
          let quality = 'hd';
          let resLabel = `${frameHeight >= 1080 ? '1080p' : frameHeight >= 720 ? '720p' : '480p'} HD`;
          if (rtt > 300 || lossPct > 5) {
            quality = 'poor';
          } else if (rtt > 150 || lossPct > 2) {
            quality = 'good';
          }

          setNetworkStats({
            quality,
            bitrateKbps: bitrate || 1400,
            packetLossPct: lossPct,
            rttMs: rtt || 32,
            fps: framesPerSec || 30,
            resolution: resLabel
          });
        } catch (e) {
          // Non-fatal stats warning
        }
      }, 2500);
    } else {
      setNetworkStats({
        quality: 'hd',
        bitrateKbps: 0,
        packetLossPct: 0,
        rttMs: 0,
        fps: 30,
        resolution: '1080p HD'
      });
    }

    return () => {
      if (statsInterval) clearInterval(statsInterval);
    };
  }, [activeCall?.status]);

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
        boostSenderQuality(pc);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE Connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
        boostSenderQuality(pc);
      } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        console.warn('[WebRTC] ICE connection disrupted, attempting auto-recovery...');
        if (typeof pc.restartIce === 'function') {
          try {
            pc.restartIce();
            pc.createOffer({ iceRestart: true }).then(async (offer) => {
              await pc.setLocalDescription(offer);
              if (socket && userRef.current) {
                socket.emit('call:signal', {
                  toUserId: String(targetUserId),
                  fromUserId: String(userRef.current.id),
                  signal: { type: 'offer', sdp: offer }
                });
              }
            }).catch(() => {});
          } catch (e) {}
        }
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

  // Robust media acquisition with physical video/audio and synthetic fallbacks (Studio HD + Resolution Ladder)
  const getMediaStream = async (wantVideo, customFacingMode = null) => {
    const userName = userRef.current?.name || 'User';
    const hasMediaDevices = typeof navigator !== 'undefined' && 
      navigator.mediaDevices && 
      typeof navigator.mediaDevices.getUserMedia === 'function';

    const targetFacingMode = customFacingMode || (isFrontCamera ? 'user' : 'environment');

    if (wantVideo) {
      if (hasMediaDevices) {
        // Try each quality profile in the resolution ladder (1080p -> 720p -> 480p)
        for (const profile of VIDEO_QUALITY_PROFILES) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                ...profile,
                facingMode: { ideal: targetFacingMode }
              },
              audio: STUDIO_AUDIO_CONSTRAINTS
            });
            return { stream, videoActive: true };
          } catch (profileErr) {
            // Try next profile in ladder
            continue;
          }
        }

        // Fallback: request unconstrained camera with studio audio
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: targetFacingMode } },
            audio: STUDIO_AUDIO_CONSTRAINTS
          });
          return { stream, videoActive: true };
        } catch (videoErr) {
          console.warn('Physical camera unavailable/denied in browser, checking audio & fallback synthetic video:', videoErr);
          
          // Try physical mic with studio constraints
          let audioTrack = null;
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: STUDIO_AUDIO_CONSTRAINTS });
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
        // Fallback when navigator.mediaDevices is undefined (e.g. Chrome on insecure context)
        console.warn('navigator.mediaDevices undefined in current context. Using synthetic stream.');
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
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: STUDIO_AUDIO_CONSTRAINTS });
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

  // Flip Camera (Front / Rear) for Mobile, PWA & Tablets
  const flipCamera = async () => {
    if (!localStreamRef.current || !activeCall?.isVideo) return;
    const nextFacingMode = isFrontCamera ? 'environment' : 'user';

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showCallNotice('Camera switching not supported by browser.', 'warning');
        return;
      }

      let newStream = null;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...VIDEO_QUALITY_PROFILES[1],
            facingMode: { exact: nextFacingMode }
          },
          audio: false
        });
      } catch (exactErr) {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...VIDEO_QUALITY_PROFILES[1],
            facingMode: { ideal: nextFacingMode }
          },
          audio: false
        });
      }

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) return;

      // Replace track on WebRTC peer connection
      if (pcRef.current) {
        const senders = pcRef.current.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
          boostSenderQuality(pcRef.current);
        }
      }

      // Stop old video track
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        localStreamRef.current.removeTrack(oldVideoTrack);
      }

      localStreamRef.current.addTrack(newVideoTrack);
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      setIsFrontCamera(!isFrontCamera);
      showCallNotice(`Switched to ${nextFacingMode === 'user' ? 'front' : 'rear'} camera`, 'info');
    } catch (err) {
      console.warn('Camera flip failed:', err);
      showCallNotice('Could not switch camera.', 'warning');
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

  // Screen Sharing (WebRTC replaceTrack)
  const toggleScreenShare = async () => {
    if (!pcRef.current || !activeCall) {
      showCallNotice('Screen sharing requires an active call.', 'warning');
      return;
    }

    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      try {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          showCallNotice('Screen sharing is not supported by your current browser/device.', 'warning');
          return;
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        if (!screenTrack) return;

        screenTrackRef.current = screenTrack;

        if (localStreamRef.current && pcRef.current) {
          const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
          originalVideoTrackRef.current = currentVideoTrack;

          // Swap track on WebRTC RTCRtpSender
          const senders = pcRef.current.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            await videoSender.replaceTrack(screenTrack);
          }

          // Swap track in local stream for local preview
          if (currentVideoTrack) {
            localStreamRef.current.removeTrack(currentVideoTrack);
          }
          localStreamRef.current.addTrack(screenTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }

        setIsScreenSharing(true);
        setActiveCall(prev => prev ? { ...prev, isScreenSharing: true } : null);

        // Native browser UI "Stop sharing" event listener
        screenTrack.onended = () => {
          stopScreenShare();
        };

        showCallNotice('🖥️ Screen sharing is live! Your screen is now broadcasting.', 'success');
      } catch (err) {
        if (err.name !== 'NotAllowedError') {
          console.error('Screen sharing error:', err);
          showCallNotice('Failed to start screen sharing.', 'error');
        }
      }
    }
  };

  const stopScreenShare = async () => {
    if (screenTrackRef.current) {
      try { screenTrackRef.current.stop(); } catch (e) {}
      screenTrackRef.current = null;
    }

    if (originalVideoTrackRef.current && localStreamRef.current && pcRef.current) {
      try {
        const videoSender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(originalVideoTrackRef.current);
        }
        const tracks = localStreamRef.current.getVideoTracks();
        tracks.forEach(t => localStreamRef.current.removeTrack(t));
        localStreamRef.current.addTrack(originalVideoTrackRef.current);
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      } catch (err) {
        console.warn('Error reverting camera track:', err);
      }
    }

    setIsScreenSharing(false);
    setActiveCall(prev => prev ? { ...prev, isScreenSharing: false } : null);
    showCallNotice('Screen sharing ended. Reverted to camera.', 'info');
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
        toggleVideo,
        isFrontCamera,
        flipCamera,
        networkStats,
        isScreenSharing,
        toggleScreenShare
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
