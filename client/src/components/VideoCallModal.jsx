import React, { useEffect, useRef, useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Maximize2, 
  Minimize2, 
  Volume2,
  User,
  Sparkles,
  FileText,
  Briefcase,
  MapPin,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Award
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const VideoCallModal = () => {
  const { 
    activeCall, 
    localStream, 
    remoteStream, 
    endCall, 
    toggleMute, 
    toggleVideo 
  } = useSocket();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [pipCorner, setPipCorner] = useState('bottom-right'); // 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const idleTimerRef = useRef(null);

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (activeCall?.status === 'connected' && !showProfileDrawer) {
        setIsControlsVisible(false);
      }
    }, 4500);
  };

  // Bind local stream (Chrome-safe autoplay)
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.muted = true;
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn('Local video play warning:', e));
    }
  }, [localStream, activeCall?.isCamOff]);

  // Bind remote stream to video & audio
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn('Remote video play warning:', e));
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(e => console.warn('Remote audio play warning:', e));
    }
  }, [remoteStream, activeCall?.isVideo, activeCall?.status]);

  // Duration Timer
  useEffect(() => {
    let timer;
    if (activeCall && activeCall.status === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall?.status]);

  if (!activeCall) return null;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const getPipPositionClass = () => {
    switch(pipCorner) {
      case 'top-right': return 'top-20 right-4 sm:right-6';
      case 'top-left': return 'top-20 left-4 sm:left-6';
      case 'bottom-left': return 'bottom-28 left-4 sm:left-6';
      case 'bottom-right':
      default: return 'bottom-28 right-4 sm:right-6';
    }
  };

  const cyclePipCorner = (e) => {
    e.stopPropagation();
    const order = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
    const idx = order.indexOf(pipCorner);
    setPipCorner(order[(idx + 1) % order.length]);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div className={`relative bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col transition-all duration-300 ring-1 ring-white/5 ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh] max-h-[760px]'
      }`}>
        
        {/* Apple-style Frosted Glass Top HUD */}
        <div className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 sm:p-5 bg-gradient-to-b from-black/80 via-black/30 to-transparent transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl py-2 px-3.5 shadow-lg">
            <div className="relative w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-slate-800 flex-shrink-0 shadow-inner">
              {activeCall.otherUser?.avatar ? (
                <img src={activeCall.otherUser.avatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full p-2 text-slate-300" />
              )}
              {activeCall.status === 'connected' && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight truncate max-w-[180px] sm:max-w-xs">
                  {activeCall.otherUser?.name || 'User'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-300 font-bold uppercase tracking-wider">
                  {activeCall.isVideo ? 'HD Video' : 'HQ Voice'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                {activeCall.status === 'connected' ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{formatTime(callDuration)}</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Connecting...
                  </span>
                )}
                <span className="text-white/30">•</span>
                <span className="text-slate-300 text-[11px] font-medium">Encrypted WebRTC</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Profile / Skills Peek Drawer Button */}
            <button
              type="button"
              onClick={() => setShowProfileDrawer(!showProfileDrawer)}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-2xl text-xs font-bold transition-all backdrop-blur-xl border ${
                showProfileDrawer 
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-200 border-white/10'
              }`}
              title="View Candidate / Employer Profile without leaving call"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Profile Peek</span>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 border border-white/10 backdrop-blur-xl transition-colors active:scale-95"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Quick Hangup Header button */}
            <button
              type="button"
              onClick={endCall}
              className="p-2.5 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-500 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              title="End Call"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video / Audio Canvas */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          
          {/* Always-on remote audio stream player */}
          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

          {/* Remote Video Stream or Avatar Placeholder */}
          {activeCall.isVideo && remoteStream && remoteStream.getVideoTracks().length > 0 ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-5 text-center p-6 z-10">
              <div className="relative">
                <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full border-4 border-indigo-500/40 overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.25)] bg-slate-900 flex items-center justify-center">
                  {activeCall.otherUser?.avatar ? (
                    <img src={activeCall.otherUser.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-300" />
                  )}
                </div>
                {/* Audio pulse wave rings */}
                <span className="absolute -inset-3 rounded-full border border-indigo-500/40 animate-ping pointer-events-none opacity-40" />
                <span className="absolute -inset-8 rounded-full border border-indigo-500/20 animate-pulse pointer-events-none opacity-30" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                  {activeCall.otherUser?.name}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activeCall.status === 'connected' ? 'High-Definition Voice Stream Active' : 'Ringing Peer...'}</span>
                </div>
              </div>

              {/* Dynamic Sound Wave Activity Bars */}
              <div className="flex items-center gap-1.5 h-6">
                {[12, 24, 18, 30, 16, 22, 14, 28, 20].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${activeCall.status === 'connected' ? h : 4}px` }}
                    className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400 transition-all duration-300 animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Local Video Stream (Picture-in-Picture with Corner Tap) */}
          {activeCall.isVideo && (
            <div 
              onClick={cyclePipCorner}
              title="Tap to move self-view corner"
              className={`absolute ${getPipPositionClass()} w-32 sm:w-48 aspect-video bg-slate-900/90 border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl z-20 cursor-pointer group hover:border-indigo-400 transition-all duration-300 active:scale-95`}
            >
              {activeCall.isCamOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-[11px] text-slate-400 font-bold">
                  <VideoOff className="w-5 h-5 text-slate-500 mb-1" />
                  <span>Camera Off</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}
              <div className="absolute bottom-1 left-2 text-[9px] bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-white font-medium flex items-center gap-1">
                <span>You</span>
                <span className="text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">• Move</span>
              </div>
            </div>
          )}

          {/* In-Call Profile Peek Slide-Over Drawer */}
          {showProfileDrawer && (
            <div className="absolute inset-y-0 right-0 w-full sm:w-80 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 p-5 z-40 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Participant Profile</span>
                </div>
                <button
                  onClick={() => setShowProfileDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div className="text-center pb-2">
                  <img
                    src={activeCall.otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt="User"
                    className="w-16 h-16 rounded-full mx-auto border-2 border-indigo-400 object-cover shadow-md mb-2"
                  />
                  <h4 className="font-extrabold text-white text-base">{activeCall.otherUser?.name}</h4>
                  <p className="text-xs text-indigo-400 font-medium">Spot Interview Active</p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Connection Details</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Protocol</span>
                    <strong className="text-emerald-400">WebRTC P2P</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Video Quality</span>
                    <strong className="text-cyan-400">HD 720p / 30fps</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Audio Codec</span>
                    <strong className="text-indigo-400">Opus 48kHz Stereo</strong>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-200">
                  <p className="font-semibold text-white mb-1">💡 Interview Tip</p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Use full-screen mode to share notes, and test candidate responses with confidence.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Apple-Grade Floating Capsule Controls Bar */}
        <div className={`absolute bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none transition-all duration-300 ${
          isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-full px-5 py-2.5 flex items-center gap-3 sm:gap-4 ring-1 ring-white/10">
            
            {/* Mute Mic Button */}
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-full font-semibold transition-all active:scale-90 ${
                activeCall.isMuted
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
              title={activeCall.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Toggle Camera Button */}
            {activeCall.isVideo && (
              <button
                onClick={toggleVideo}
                className={`p-3.5 rounded-full font-semibold transition-all active:scale-90 ${
                  activeCall.isCamOff
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
                title={activeCall.isCamOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {activeCall.isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            )}

            {/* Red End Call Capsule Button */}
            <button
              onClick={endCall}
              className="py-3 px-5 sm:px-6 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-xl shadow-rose-600/40 active:scale-95 transition-all flex items-center gap-2 border border-rose-500/50"
              title="Hang Up Call"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};
