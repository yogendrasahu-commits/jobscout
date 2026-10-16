import React from 'react';
import { Phone, PhoneCall, PhoneOff, Video, User } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const IncomingCallBanner = () => {
  const { incomingCall, acceptCall, rejectCall } = useSocket();

  if (!incomingCall) return null;

  return (
    <div className="fixed top-16 sm:top-20 left-3 right-3 sm:left-auto sm:right-8 z-[1000] animate-bounce duration-1000 max-w-sm sm:w-full">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4 text-slate-900">
        
        {/* Caller Avatar & Ring Effect */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500 bg-slate-100 flex items-center justify-center shadow-md">
            {incomingCall.callerAvatar ? (
              <img src={incomingCall.callerAvatar} alt={incomingCall.callerName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-indigo-600" />
            )}
          </div>
          <span className="absolute -inset-1 rounded-full border-2 border-emerald-500 animate-ping pointer-events-none opacity-75" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold uppercase tracking-wider">
            {incomingCall.isVideo ? <Video className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
            Incoming {incomingCall.isVideo ? 'Video' : 'Voice'} Call
          </div>
          <h4 className="font-extrabold text-base text-slate-900 truncate">{incomingCall.callerName}</h4>
          <p className="text-xs text-slate-500">Ringing right now...</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Decline */}
          <button
            onClick={rejectCall}
            title="Decline Call"
            className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-600/30 transition-transform active:scale-95"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          {/* Accept */}
          <button
            onClick={acceptCall}
            title="Accept Call"
            className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 transition-transform active:scale-95 animate-pulse"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
