import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  MessageSquare, 
  Send, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink,
  Zap,
  Radio,
  Check,
  Loader2,
  Bot,
  Key,
  ChevronDown,
  ChevronUp,
  Info,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendTestAlert, generateWhatsAppUrl, generateTelegramUrl } from '../utils/alertService';
import { triggerConfetti } from '../utils/confetti';
import { playSuccessChime } from '../utils/soundEffects';

export const AlertSettingsModal = ({ isOpen, onClose }) => {
  const { user, token, updateUser } = useAuth();

  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [notifyOnOffer, setNotifyOnOffer] = useState(true);
  const [notifyOnInterview, setNotifyOnInterview] = useState(true);
  const [notifyOnApplication, setNotifyOnApplication] = useState(true);

  // Gateway / Automated credentials state
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');
  const [whatsappProvider, setWhatsappProvider] = useState('meta');
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioFromNumber, setTwilioFromNumber] = useState('');
  const [gatewayUrl, setGatewayUrl] = useState('');

  const [hasTelegramBot, setHasTelegramBot] = useState(false);
  const [hasWhatsAppGateway, setHasWhatsAppGateway] = useState(false);

  const [saving, setSaving] = useState(false);
  const [testingChannel, setTestingChannel] = useState(null); // 'whatsapp' | 'telegram'
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Escape key listener & Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Load existing settings
  useEffect(() => {
    if (isOpen && token) {
      setSuccessMsg('');
      setErrorMsg('');

      fetch('/api/alerts/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.preferences) {
            const p = data.preferences;
            setWhatsappEnabled(p.whatsappEnabled !== false);
            setTelegramEnabled(Boolean(p.telegramEnabled));
            setWhatsappPhone(p.whatsappPhone || user?.phone || '');
            setTelegramChatId(p.telegramChatId || '');
            setNotifyOnOffer(p.notifyOnOffer !== false);
            setNotifyOnInterview(p.notifyOnInterview !== false);
            setNotifyOnApplication(p.notifyOnApplication !== false);
          }
          if (data.gatewayConfig) {
            const g = data.gatewayConfig;
            setHasTelegramBot(Boolean(g.hasTelegramBot));
            setHasWhatsAppGateway(Boolean(g.hasWhatsAppGateway));
            setTelegramBotToken(g.telegramBotToken || '');
            setWhatsappPhoneNumberId(g.whatsappPhoneNumberId || '');
            setWhatsappProvider(g.whatsappProvider || 'meta');
            setGatewayUrl(g.gatewayUrl || '');
          }
        })
        .catch(err => console.error('Failed to load alert settings:', err));
    }
  }, [isOpen, token, user?.phone]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        whatsappEnabled,
        telegramEnabled,
        whatsappPhone: whatsappPhone.trim(),
        telegramChatId: telegramChatId.trim(),
        notifyOnOffer,
        notifyOnInterview,
        notifyOnApplication,
        gatewayConfig: {
          telegramBotToken: telegramBotToken.trim(),
          telegramDefaultChatId: telegramChatId.trim(),
          whatsappToken: whatsappToken.trim(),
          whatsappPhoneNumberId: whatsappPhoneNumberId.trim(),
          whatsappProvider,
          twilioAccountSid: twilioAccountSid.trim(),
          twilioAuthToken: twilioAuthToken.trim(),
          twilioFromNumber: twilioFromNumber.trim(),
          gatewayUrl: gatewayUrl.trim()
        }
      };

      const res = await fetch('/api/alerts/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update alert settings');

      setSuccessMsg('✅ Notification channels & automated dispatch saved!');
      triggerConfetti();
      playSuccessChime();

      if (user) {
        updateUser({
          ...user,
          notificationPrefs: data.preferences
        });
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (channel) => {
    setTestingChannel(channel);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await sendTestAlert({
        token,
        channel,
        phone: whatsappPhone.trim() || user?.phone,
        telegramChatId: telegramChatId.trim()
      });

      if (data.autoDelivered) {
        setSuccessMsg(`⚡ Automated ${channel === 'telegram' ? 'Telegram Bot' : 'WhatsApp'} alert delivered directly to your device in the background!`);
      } else {
        if (channel === 'whatsapp' && data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank');
          setSuccessMsg('📲 Opened WhatsApp with pre-filled live notification card! (Configure Meta/Twilio API below for silent 100% automated background delivery).');
        } else if (channel === 'telegram' && data.telegramUrl) {
          window.open(data.telegramUrl, '_blank');
          setSuccessMsg('✈️ Opened Telegram share window! (Add your free Telegram Bot Token & Chat ID below for direct 100% automated bot delivery).');
        }
      }
      playSuccessChime();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setTestingChannel(null);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/75 backdrop-blur-md flex justify-center items-start sm:items-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky with prominent Close Button */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  Instant Alerts & Automation
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Real-time
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 hidden xs:block">
                Automated WhatsApp & Telegram mobile alerts
              </p>
            </div>
          </div>

          {/* Prominent Catchy Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all font-bold text-xs active:scale-95 shadow-2xs group flex-shrink-0 ml-2"
            title="Close Settings (बंद करें)"
          >
            <X className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
            <span className="font-extrabold">Close</span>
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-xs">
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. WhatsApp Channel Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="text-lg">💬</span>
                <span>WhatsApp Mobile Alerts</span>
                {hasWhatsAppGateway ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
                    ⚡ Auto-API
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    🔗 1-Click Link
                  </span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                WhatsApp Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  disabled={!whatsappEnabled}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono text-xs disabled:opacity-60"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Direct mobile number for instant job status, interviews & offer letters.
              </span>
            </div>

            {whatsappEnabled && (
              <button
                type="button"
                onClick={() => handleSendTest('whatsapp')}
                disabled={testingChannel === 'whatsapp'}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 hover:border-emerald-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
              >
                {testingChannel === 'whatsapp' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                <span>Send Test WhatsApp Alert</span>
              </button>
            )}
          </div>

          {/* 2. Telegram Channel Card */}
          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="text-lg">✈️</span>
                <span>Telegram Bot Alerts</span>
                {hasTelegramBot ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 border border-sky-200">
                    ⚡ Automated Bot Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    🤖 Bot Ready
                  </span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={telegramEnabled}
                  onChange={(e) => setTelegramEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Telegram Chat ID or Username
              </label>
              <div className="relative">
                <Bot className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. 123456789 or @username"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  disabled={!telegramEnabled}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-mono text-xs disabled:opacity-60"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Tip: Get your numeric chat ID instantly from free Telegram bot <b>@userinfobot</b> or <b>@raw_data_bot</b>.
              </span>
            </div>

            {telegramEnabled && (
              <button
                type="button"
                onClick={() => handleSendTest('telegram')}
                disabled={testingChannel === 'telegram'}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-sky-600 text-sky-800 hover:text-white border border-sky-300 hover:border-sky-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
              >
                {testingChannel === 'telegram' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send Test Telegram Alert</span>
              </button>
            )}
          </div>

          {/* 3. Automated Server Dispatch / Gateway Settings (Expandable) */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80">
            <button
              type="button"
              onClick={() => setShowGatewayConfig(!showGatewayConfig)}
              className="w-full flex items-center justify-between font-bold text-slate-900 text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                <span>⚡ Automated Background Dispatch Configuration</span>
              </div>
              {showGatewayConfig ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showGatewayConfig && (
              <div className="mt-3 pt-3 border-t border-indigo-100 space-y-3 animate-in fade-in">
                <div className="p-2.5 rounded-xl bg-white/80 border border-indigo-100 text-[11px] text-slate-600 leading-relaxed">
                  <p className="font-semibold text-indigo-900 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-indigo-600" /> How 100% Silent Background Delivery Works:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><b>Telegram Bot:</b> Free to set up! Open Telegram, talk to <b>@BotFather</b>, type <code>/newbot</code>, copy the Bot Token here. Telegram delivers alerts silently to phones with zero fees.</li>
                    <li><b>WhatsApp Cloud API:</b> Requires Meta Developer token or Twilio account to send background WhatsApp messages without opening a browser tab.</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Telegram Bot Token (from @BotFather)
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-indigo-100/60">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    WhatsApp Automated Provider
                  </label>
                  <select
                    value={whatsappProvider}
                    onChange={(e) => setWhatsappProvider(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold mb-2"
                  >
                    <option value="meta">Meta WhatsApp Cloud API (Official)</option>
                    <option value="twilio">Twilio WhatsApp API</option>
                    <option value="gateway">Custom Webhook / UltraMsg Gateway</option>
                  </select>

                  {whatsappProvider === 'meta' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Meta Cloud API Permanent Token
                        </label>
                        <input
                          type="password"
                          placeholder="EAAB..."
                          value={whatsappToken}
                          onChange={(e) => setWhatsappToken(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          WhatsApp Phone Number ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 104523948572019"
                          value={whatsappPhoneNumberId}
                          onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {whatsappProvider === 'twilio' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Twilio Account SID
                        </label>
                        <input
                          type="text"
                          placeholder="AC..."
                          value={twilioAccountSid}
                          onChange={(e) => setTwilioAccountSid(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Twilio Auth Token
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={twilioAuthToken}
                          onChange={(e) => setTwilioAuthToken(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Twilio From Number
                        </label>
                        <input
                          type="text"
                          placeholder="+14155238886"
                          value={twilioFromNumber}
                          onChange={(e) => setTwilioFromNumber(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {whatsappProvider === 'gateway' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Gateway Webhook URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://api.ultramsg.com/instance123/messages/chat"
                        value={gatewayUrl}
                        onChange={(e) => setGatewayUrl(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Notification Triggers Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="font-extrabold text-slate-900 block text-xs">
              When should JobScout dispatch mobile alerts?
            </span>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={notifyOnOffer}
                onChange={(e) => setNotifyOnOffer(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span>🎉 Official Stamped Offer Letters Dispatched (Immediate Salary & CTC)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={notifyOnInterview}
                onChange={(e) => setNotifyOnInterview(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span>📅 Direct Video / Voice Interview Call Invitations</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={notifyOnApplication}
                onChange={(e) => setNotifyOnApplication(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span>📢 Application Status Updates (Submitted, Reviewed, Hired)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 text-center sm:text-left">
              Zero spam policy • 100% Encrypted & Safe
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95"
              >
                Close (बंद करें)
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none py-2 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AlertSettingsModal;
