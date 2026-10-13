import React from 'react';
import { Phone, PhoneCall, PhoneOff, Video, User } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const IncomingCallBanner = () => {
  const { incomingCall, acceptCall, rejectCall } = useSocket();

  if (!incomingCall) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 animate-bounce duration-1000 max-w-sm w-full">
      <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-indigo-500/80 rounded-2xl p-4 shadow-2xl shadow-indigo-500/30 flex items-center justify-between gap-4">
        
        {/* Caller Avatar & Ring Effect */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-400 bg-slate-800 flex items-center justify-center">
            {incomingCall.callerAvatar ? (
              <img src={incomingCall.callerAvatar} alt={incomingCall.callerName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-indigo-300" />
            )}
          </div>
          <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none opacity-75" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            {incomingCall.isVideo ? <Video className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
            Incoming {incomingCall.isVideo ? 'Video' : 'Voice'} Call
          </div>
          <h4 className="font-bold text-base text-white truncate">{incomingCall.callerName}</h4>
          <p className="text-xs text-slate-400">Ringing right now...</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Decline */}
          <button
            onClick={rejectCall}
            title="Decline Call"
            className="w-10 h-10 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          {/* Accept */}
          <button
            onClick={acceptCall}
            title="Accept Call"
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 transition-transform active:scale-95 animate-pulse"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
