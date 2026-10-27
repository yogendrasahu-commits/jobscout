import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Check, 
  AlertCircle, 
  ArrowLeft, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  Send, 
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmailSettingsModal = ({ isOpen, onClose, onConfigSaved }) => {
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState('gmail'); // 'gmail' | 'smtp'
  const [gmailUser, setGmailUser] = useState('');
  const [gmailPass, setGmailPass] = useState('');
  
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [emailFrom, setEmailFrom] = useState('');

  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testError, setTestError] = useState('');

  const [currentConfig, setCurrentConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current email config status
  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/settings/email');
      if (res.ok) {
        const data = await res.json();
        setCurrentConfig(data);
        if (data.senderEmail && !gmailUser) {
          setGmailUser(data.senderEmail);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch email settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setTestMessage('');
      setTestError('');
      if (user?.email && !testEmailAddress) {
        setTestEmailAddress(user.email);
      }
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = activeTab === 'gmail' 
      ? {
          gmailUser: (gmailUser || '').trim(),
          gmailPass: (gmailPass || '').replace(/\s+/g, ''),
          emailFrom: `JobScout Live Platform <${(gmailUser || '').trim()}>`
        }
      : {
          smtpHost: (smtpHost || '').trim(),
          smtpPort: smtpPort || '587',
          smtpUser: (smtpUser || '').trim(),
          smtpPass: (smtpPass || '').trim(),
          emailFrom: (emailFrom || '').trim()
        };

    try {
      const res = await fetch('/api/auth/settings/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify and save email settings');
      }

      setSuccess('✅ Gmail SMTP connection verified and saved! Real emails will now be delivered to inboxes.');
      await fetchStatus();
      if (onConfigSaved) onConfigSaved();
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your credentials.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestError('');
    setTestMessage('');
    const target = (testEmailAddress || user?.email || gmailUser || '').trim();
    if (!target || !target.includes('@')) {
      setTestError('Please enter a valid recipient email address');
      return;
    }

    setTestLoading(true);
    try {
      const res = await fetch('/api/auth/settings/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetEmail: target })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      setTestMessage(`🎉 Test email sent successfully to ${target}! Check your inbox and spam folder.`);
    } catch (err) {
      setTestError(err.message || 'Failed to send test email.');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 my-auto text-slate-900">
        
        {/* Top-Left Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Back / Close"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back</span>
        </button>

        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          title="Close dialog"
        >
          <span className="text-[11px] font-semibold hidden sm:inline">Close</span>
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-5 sm:pt-4 pb-4 border-b border-slate-200/80">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            Email Delivery & SMTP Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            उम्मीदवारों को ऑफर लेटर और हायरिंग अलर्ट सीधे उनके Gmail इनबॉक्स में भेजने के लिए अपनी ईमेल सेटिंग्स कनेक्ट करें।
          </p>

          {/* Current Live Status Pill */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border">
            {currentConfig?.configured ? (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Real Delivery Active ({currentConfig.senderEmail})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Authentication Needed (Enter App Password below)
              </span>
            )}
          </div>
        </div>

        {/* Service Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 mt-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('gmail')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'gmail'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Gmail (Recommended)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('smtp')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'smtp'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Custom SMTP</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold">Verification Error:</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold">{success}</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          {activeTab === 'gmail' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Gmail Address:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={gmailUser}
                    onChange={(e) => setGmailUser(e.target.value)}
                    placeholder="e.g. yogendrasahu9336@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    16-Character Google App Password:
                  </label>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 underline"
                  >
                    <span>Get App Password</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={gmailPass}
                    onChange={(e) => setGmailPass(e.target.value)}
                    placeholder="e.g. abcd efgh ijkl mnop (16 letters)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono font-bold text-slate-900 tracking-wider"
                  />
                </div>
              </div>

              {/* Instructions Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>How to generate a Google App Password (1 minute):</span>
                </p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-slate-600">
                  <li>Visit <strong className="text-slate-800">myaccount.google.com/apppasswords</strong> in your browser.</li>
                  <li>Ensure <strong className="text-slate-800">2-Step Verification</strong> is ON for your Gmail.</li>
                  <li>Type App Name: <strong className="text-indigo-600">JobScout</strong> and click <strong>Create</strong>.</li>
                  <li>Copy the 16-character code (yellow box) and paste it here!</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    required
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Port</label>
                  <input
                    type="text"
                    required
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">SMTP Username</label>
                <input
                  type="text"
                  required
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">SMTP Password</label>
                <input
                  type="password"
                  required
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying with Google SMTP...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Save Connection (सेव और कनेक्ट करें)</span>
              </>
            )}
          </button>
        </form>

        {/* Live Test Email Section */}
        <div className="mt-5 pt-4 border-t border-slate-200/80">
          <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            <span>Send a Live Test Email to Your Inbox:</span>
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="Enter your email to test"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={testLoading}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60 whitespace-nowrap"
            >
              {testLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send Test</span>
            </button>
          </div>

          {testMessage && (
            <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{testMessage}</span>
            </p>
          )}

          {testError && (
            <p className="mt-2 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{testError}</span>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
