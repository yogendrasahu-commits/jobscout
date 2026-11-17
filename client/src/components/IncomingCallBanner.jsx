import React, { useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, Video, User, AlertCircle, X, ShieldCheck, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { playRingtone, stopRingtone } from '../utils/soundEffects';

export const IncomingCallBanner = () => {
  const { incomingCall, acceptCall, rejectCall, callNotice, dismissCallNotice } = useSocket();

  useEffect(() => {
    if (incomingCall) {
      playRingtone();

      // Trigger native Web Push Notification if supported and permitted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            const notif = new Notification(`📞 Incoming ${incomingCall.isVideo ? 'Video' : 'Voice'} Call`, {
              body: `${incomingCall.callerName || 'A recruiter'} is calling you for an interview on JobScout. Click to answer!`,
              icon: incomingCall.callerAvatar || '/icons/icon-192x192.png',
              tag: 'jobscout-call',
              requireInteraction: true
            });
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          } catch (e) {
            // Browser security boundary
          }
        } else if (Notification.permission === 'default') {
          try {
            Notification.requestPermission().catch(() => {});
          } catch (e) {}
        }
      }
    } else {
      stopRingtone();
    }
    return () => {
      stopRingtone();
    };
  }, [incomingCall]);

  return (
    <>
      {/* Realtime Call Status & System Notice Toast */}
      {callNotice && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-6 z-[1100] animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm sm:max-w-md w-[calc(100%-24px)] sm:w-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 text-slate-900 ring-1 ring-slate-900/5">
            <div className={`p-2 rounded-xl flex-shrink-0 ${
              callNotice.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
              callNotice.type === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
              'bg-indigo-50 text-indigo-600 border border-indigo-200'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-bold text-slate-800 leading-snug">{callNotice.message}</p>
            </div>
            <button
              onClick={dismissCallNotice}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors -mr-1 -mt-1"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* High-Impact Full-Screen Incoming Call Modal (Mobile, Tablet, Desktop) */}
      {incomingCall && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center text-white overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Security & Encryption Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-300 text-[11px] font-semibold mb-6">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>JobScout P2P WebRTC Encrypted</span>
            </div>

            {/* Pulsing Concentric Radar Rings & Avatar */}
            <div className="relative my-4 flex items-center justify-center">
              <span className="absolute w-36 h-36 rounded-full border border-indigo-400/30 animate-ping duration-1000 pointer-events-none" />
              <span className="absolute w-28 h-28 rounded-full border border-emerald-400/40 animate-pulse pointer-events-none" />
              
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500 shadow-2xl bg-slate-800 flex items-center justify-center z-10 ring-4 ring-indigo-500/30">
                {incomingCall.callerAvatar ? (
                  <img src={incomingCall.callerAvatar} alt={incomingCall.callerName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-indigo-300" />
                )}
              </div>
            </div>

            {/* Caller Name & Type */}
            <div className="space-y-1 mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-bold uppercase tracking-wider">
                {incomingCall.isVideo ? <Video size={14} className="text-indigo-400" /> : <PhoneCall size={14} className="text-emerald-400" />}
                <span>Incoming {incomingCall.isVideo ? 'Video Interview' : 'Voice Call'}</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight truncate px-2">
                {incomingCall.callerName || 'Candidate / Recruiter'}
              </h3>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Sparkles size={12} className="text-amber-400 animate-pulse" />
                <span>Ringing live right now...</span>
              </p>
            </div>

            {/* High-Impact Action Buttons */}
            <div className="flex items-center justify-center gap-6 pt-2">
              {/* Decline Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={rejectCall}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 border-2 border-rose-400/40 transition-transform cursor-pointer"
                  title="Decline Call"
                >
                  <PhoneOff size={26} />
                </button>
                <span className="text-xs font-bold text-slate-300">Decline</span>
              </div>

              {/* Accept Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={acceptCall}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-90 text-white flex items-center justify-center shadow-xl shadow-emerald-500/50 border-2 border-emerald-300 transition-transform animate-pulse cursor-pointer"
                  title="Accept Call"
                >
                  <Phone size={26} />
                </button>
                <span className="text-xs font-bold text-emerald-300">Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IncomingCallBanner;
