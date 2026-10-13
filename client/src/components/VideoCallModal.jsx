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
  Sparkles
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

  // Bind local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, activeCall]);

  // Bind remote stream to video & audio
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream, activeCall]);

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

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className={`relative bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl h-[85vh] max-h-[720px]'
      }`}>
        
        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-slate-800">
              {activeCall.otherUser?.avatar ? (
                <img src={activeCall.otherUser.avatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full p-2 text-slate-300" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {activeCall.otherUser?.name || 'User'}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                {activeCall.status === 'connected' ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Connected ({formatTime(callDuration)})
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Calling & Connecting...
                  </span>
                )}
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">
                  {activeCall.isVideo ? 'WebRTC HD Video' : 'HQ Voice Call'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Video / Audio Canvas */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          
          {/* Always-on remote audio stream player */}
          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

          {/* Remote Video Stream or Avatar Placeholder */}
          {activeCall.isVideo && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-5 text-center p-6">
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-indigo-500/40 overflow-hidden shadow-2xl bg-slate-800 flex items-center justify-center">
                  {activeCall.otherUser?.avatar ? (
                    <img src={activeCall.otherUser.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-indigo-300" />
                  )}
                </div>
                {/* Audio pulse wave rings */}
                <span className="absolute -inset-3 rounded-full border border-indigo-500/40 animate-ping pointer-events-none opacity-60" />
                <span className="absolute -inset-8 rounded-full border border-indigo-500/20 animate-pulse pointer-events-none opacity-40" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{activeCall.otherUser?.name}</h2>
                <p className="text-sm text-slate-400">
                  {activeCall.status === 'connected' ? 'High definition voice streaming' : 'Dialing peer...'}
                </p>
              </div>
            </div>
          )}

          {/* Local Video Stream (PiP in Corner) */}
          {activeCall.isVideo && (
            <div className="absolute bottom-24 right-4 sm:right-6 w-36 sm:w-48 aspect-video bg-slate-900 border-2 border-indigo-500/60 rounded-2xl overflow-hidden shadow-2xl z-20">
              {activeCall.isCamOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-xs text-slate-400">
                  <VideoOff className="w-6 h-6 text-slate-500 mb-1" />
                  Camera off
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
              <div className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white font-medium">
                You
              </div>
            </div>
          )}

        </div>

        {/* Controls Footer */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-center gap-4">
          
          {/* Mute Mic */}
          <button
            onClick={toggleMute}
            className={`p-3.5 sm:p-4 rounded-full font-semibold transition-all shadow-lg active:scale-95 ${
              activeCall.isMuted
                ? 'bg-rose-500/80 hover:bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
            }`}
            title={activeCall.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="p-4 sm:p-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all shadow-xl shadow-rose-600/40 active:scale-95 hover:scale-105"
            title="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Toggle Camera (if video call) */}
          {activeCall.isVideo && (
            <button
              onClick={toggleVideo}
              className={`p-3.5 sm:p-4 rounded-full font-semibold transition-all shadow-lg active:scale-95 ${
                activeCall.isCamOff
                  ? 'bg-rose-500/80 hover:bg-rose-500 text-white shadow-rose-500/30'
                  : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
              }`}
              title={activeCall.isCamOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {activeCall.isCamOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
