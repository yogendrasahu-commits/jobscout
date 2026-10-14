import React, { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, ArrowLeft, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UpdateEmailModal = ({ isOpen, onClose, onUpdated }) => {
  const { user, updateProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    } else {
      setEmail('');
    }
    setError('');
    setSuccess('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setError('कृपया एक मान्य ईमेल आईडी दर्ज करें (जैसे: name@example.com)');
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfile({ email: trimmed });
      if (res.success) {
        setSuccess('ईमेल सफलतापूर्वक अपडेट हो गया है! अब सभी ऑफर लेटर और अलर्ट्स इसी ईमेल पर प्राप्त होंगे।');
        if (onUpdated) onUpdated(trimmed);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'ईमेल अपडेट करने में विफल। कृपया पुनः प्रयास करें।');
      }
    } catch (err) {
      setError(err.message || 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 my-auto">
        
        {/* Top-Left Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          title="Back / Close"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back (वापस)</span>
        </button>

        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 transition-all flex items-center gap-1.5 active:scale-95"
          title="Close dialog"
        >
          <span className="text-[11px] font-semibold hidden sm:inline">Close</span>
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center pt-5 sm:pt-4 pb-4 border-b border-slate-800/80">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/20">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            Update Email Address
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            ईमेल आईडी अपडेट करें ताकि ऑफर लेटर और हायरिंग डॉक्युमेंट्स सीधे आपके इनबॉक्स में पहुंच सकें।
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Current Email Status */}
        <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
          <span className="text-slate-400 font-medium">वर्तमान ईमेल (Current):</span>
          <span className="font-bold text-white truncate max-w-[200px]">
            {user?.email || <span className="text-amber-400 italic">ईमेल सेट नहीं है (Not Set)</span>}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              New Official Email Address <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="उदा. candidate@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
              <span>JobScout इस ईमेल का उपयोग केवल आधिकारिक ऑफर लेटर व सूचनाओं के लिए करता है।</span>
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              {loading ? (
                <span>सेव हो रहा है...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Email (सेव करें)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
