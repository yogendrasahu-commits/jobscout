import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  ShieldCheck, 
  ExternalLink,
  Server,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmailSenderConfigModal = ({ isOpen, onClose, onConfigSaved }) => {
  const { token } = useAuth();

  const [useCustomSmtp, setUseCustomSmtp] = useState(false);
  const [gmailUser, setGmailUser] = useState('');
  const [gmailPass, setGmailPass] = useState('');

  // Custom SMTP fields
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [emailFrom, setEmailFrom] = useState('');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGuide, setShowGuide] = useState(true);

  // Load current configuration status
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/settings/email');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          if (data.senderEmail && data.serviceType === 'Gmail') {
            setGmailUser(data.senderEmail);
          }
        }
      } catch (e) {
        console.warn('Failed to load email settings:', e);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = useCustomSmtp
      ? { smtpHost, smtpPort, smtpUser, smtpPass, emailFrom }
      : { gmailUser, gmailPass };

    try {
      const res = await fetch('/api/settings/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify email credentials');
      }

      setSuccess('🎉 ईमेल सेंडर सफलतापूर्वक कनेक्ट और सत्यापित हो गया है! अब उम्मीदवार के असली इनबॉक्स में ऑफर लेटर डिलीवर होगा।');
      setStatus({ configured: true, senderEmail: gmailUser || smtpUser, serviceType: useCustomSmtp ? 'Custom SMTP' : 'Gmail' });
      if (onConfigSaved) onConfigSaved();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'सत्यापन विफल। कृपया अपना जीमेल आईडी और 16-अक्षरों का ऐप पासवर्ड जांचें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[960] flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[94dvh] overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        
        {/* Top Header with Back and Close */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-1.5 active:scale-95"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back (वापस)</span>
          </button>

          <span className="text-xs font-bold text-white">
            Email Sender Setup (असली ईमेल भेजने की सेटिंग)
          </span>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-all flex items-center gap-1.5 active:scale-95"
            title="Close"
          >
            <span className="text-[11px] font-semibold hidden sm:inline">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Status Banner */}
          {status && (
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              status.configured
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                {status.configured ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">
                    {status.configured 
                      ? `सक्रिय (Active): ${status.senderEmail}`
                      : 'अभी असली ईमेल सेंडर कनेक्ट नहीं है (सिमुलेशन मोड सक्रिय)'}
                  </p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {status.configured 
                      ? 'ऑफर लेटर्स सीधे उम्मीदवार के इनबॉक्स में भेजे जा रहे हैं।'
                      : 'उम्मीदवार के असली Gmail इनबॉक्स में मेल पहुंचाने के लिए नीचे Gmail App Password जोड़ें।'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center justify-between p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setUseCustomSmtp(false)}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !useCustomSmtp ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gmail (Recommended - 2 Min Setup)</span>
            </button>
            <button
              type="button"
              onClick={() => setUseCustomSmtp(true)}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                useCustomSmtp ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Custom SMTP (Brevo / SES)</span>
            </button>
          </div>

          {/* 3-Step Guide for Gmail */}
          {!useCustomSmtp && showGuide && (
            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between text-white font-bold text-xs pb-1 border-b border-indigo-500/20">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Google App Password कैसे बनाएं? (केवल 2 मिनट):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Hide
                </button>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                <li>
                  अपने <strong>Google Account</strong> (Security) में जाएं और सुनिश्चित करें कि <strong>2-Step Verification</strong> ON है।
                </li>
                <li>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 underline"
                  >
                    <span>Google App Passwords पेज खोलें</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  App Name में <strong>JobScout</strong> लिखें और <strong>Create</strong> दबाएं। आपको 16 अक्षरों का पासवर्ड मिलेगा (उदा. <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">abcd efgh ijkl mnop</code>)।
                </li>
                <li>
                  वह 16-अक्षरों का पासवर्ड नीचे बॉक्स में पेस्ट करें और <strong>Connect & Save</strong> दबाएं।
                </li>
              </ol>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!useCustomSmtp ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your Gmail Address (भेजने वाले का जीमेल) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={gmailUser}
                      onChange={(e) => setGmailUser(e.target.value)}
                      placeholder="उदा. yourcompany@gmail.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    16-Character Google App Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={gmailPass}
                      onChange={(e) => setGmailPass(e.target.value)}
                      placeholder="उदा. abcd efgh ijkl mnop"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    यह आपका सामान्य जीमेल पासवर्ड नहीं है, बल्कि Google द्वारा जेनरेट किया गया 16-अक्षरों का सुरक्षित ऐप पासवर्ड है।
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.brevo.com"
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">SMTP Port</label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SMTP Username / Login</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="login-email@domain.com"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SMTP Password</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Sender Email / From Name</label>
                  <input
                    type="text"
                    value={emailFrom}
                    onChange={(e) => setEmailFrom(e.target.value)}
                    placeholder='"JobScout Hiring" <noreply@yourdomain.com>'
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
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
                className="w-full sm:w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                {loading ? (
                  <span>सत्यापित किया जा रहा है (Connecting)...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Save Connection (कनेक्ट करें)</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
