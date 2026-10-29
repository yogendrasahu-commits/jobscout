import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, MessageSquare, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { playSuccessChime } from '../utils/soundEffects';

export const AlertNotificationToast = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleAlert = (alert) => {
      // Check if alert is relevant to current user
      const userPhone = user?.phone?.replace(/\D/g, '') || '';
      const userWhatsApp = user?.notificationPrefs?.whatsappPhone?.replace(/\D/g, '') || '';
      const alertPhone = alert?.candidatePhone?.replace(/\D/g, '') || '';

      const isForMe = !user || !alertPhone || 
        userPhone.includes(alertPhone) || 
        alertPhone.includes(userPhone) ||
        userWhatsApp.includes(alertPhone) ||
        alertPhone.includes(userWhatsApp) ||
        alert.candidateName === user?.name;

      if (isForMe) {
        setActiveAlert(alert);
        try { playSuccessChime(); } catch {}

        // Auto dismiss after 10 seconds
        setTimeout(() => {
          setActiveAlert((prev) => (prev?.id === alert.id ? null : prev));
        }, 10000);
      }
    };

    socket.on('alert:received', handleAlert);
    return () => socket.off('alert:received', handleAlert);
  }, [socket, user]);

  if (!activeAlert) return null;

  const toastContent = (
    <div className="fixed top-4 right-4 z-[99999] max-w-sm w-full mx-auto p-4 bg-slate-900/95 text-white rounded-3xl shadow-2xl border border-slate-700/80 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-base shadow-md flex-shrink-0">
            💬
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-emerald-400 uppercase tracking-wider">
                Instant Mobile Alert
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h4 className="font-extrabold text-xs text-white mt-0.5 line-clamp-1">
              {activeAlert.headline || 'JobScout Live Notification'}
            </h4>
          </div>
        </div>

        <button
          onClick={() => setActiveAlert(null)}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
        <strong>{activeAlert.employerName || 'Employer'}</strong> • {activeAlert.jobTitle || 'Role'}
      </p>

      {/* Action Buttons: WhatsApp & Telegram */}
      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
        {activeAlert.whatsappUrl && (
          <a
            href={activeAlert.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setActiveAlert(null)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all text-center"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </a>
        )}

        {activeAlert.telegramUrl && (
          <a
            href={activeAlert.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setActiveAlert(null)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all text-center"
          >
            <span>✈️</span>
            <span>Telegram</span>
          </a>
        )}
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
};

export default AlertNotificationToast;
