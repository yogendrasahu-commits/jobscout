import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Download, 
  Smartphone, 
  QrCode, 
  Share2, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  MapPin, 
  Video, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Laptop,
  Check,
  RefreshCw,
  Zap
} from 'lucide-react';
import { JobScoutLogo } from './JobScoutLogo';
import { usePwaInstall } from '../hooks/usePwaInstall';

export const MobileAppDownloadModal = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [activeTab, setActiveTab] = useState('download'); // 'download' | 'qr' | 'guide'
  const [guidePlatform, setGuidePlatform] = useState('android'); // 'android' | 'ios'
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Determine local network mobile URL
  const mobileUrl = typeof window !== 'undefined' 
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? `${window.location.protocol}//192.168.11.22:${window.location.port || '5173'}`
      : window.location.origin
    : 'http://192.168.11.22:5173';

  // Generate QR Code on mount or url change
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(mobileUrl, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#1e1b4b', // deep indigo
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Error generating QR Code:', err));
  }, [isOpen, mobileUrl]);

  // Handle Copy Link
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Handle 1-Click PWA Install
  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await promptInstall();
    } finally {
      setInstalling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Smartphone size={24} className="text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">JobScout Mobile App</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 shadow-xs">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium mt-0.5">
                Android APK Package & Native PWA WebAPK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('download')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'download'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download size={14} />
            <span>Download & Install</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode size={14} />
            <span>QR Code Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone size={14} />
            <span>Install Guide</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: DIRECT DOWNLOAD & INSTALL */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              
              {/* Primary APK Download Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-cyan-50/70 border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">Direct Android APK Package</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                        ~5.07 MB
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Download the standalone `.apk` package to install directly on your Android phone or tablet.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 size={12} /> Android 7.0+
                      </span>
                      <span>•</span>
                      <span>Full Offline Cache</span>
                      <span>•</span>
                      <span>GPS Enabled</span>
                    </div>
                  </div>

                  <a
                    href="/download/jobscout-mobile.apk"
                    download="jobscout-mobile.apk"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 active:scale-95 shrink-0"
                  >
                    <Download size={15} />
                    <span>Download APK</span>
                  </a>
                </div>
              </div>

              {/* Instant WebAPK / PWA Install Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-amber-500 fill-amber-500" />
                      <span className="text-sm font-black text-slate-900">Instant WebAPK App (No file download needed)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Add JobScout as a native app directly from your browser. Automatically updates with the latest version.
                    </p>
                  </div>

                  {isInstalled ? (
                    <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>Installed on Device</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      disabled={installing}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    >
                      <Smartphone size={14} />
                      <span>{installing ? 'Installing...' : '1-Click Install App'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Live Synchronization Highlights */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span>100% Real-Time Connected with Web (दोनों हमेशा सिंक रहेंगे)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <MapPin size={14} className="text-cyan-500 shrink-0" />
                    <span>Real-time GPS Radar & Live Map</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <Video size={14} className="text-emerald-500 shrink-0" />
                    <span>WebRTC Speed Video & Voice Calling</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <MessageSquare size={14} className="text-indigo-500 shrink-0" />
                    <span>Instant Direct Chat & WhatsApp Alerts</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <RefreshCw size={14} className="text-amber-500 shrink-0" />
                    <span>Shared Database & Live Account Sync</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: QR CODE SCANNER */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="bg-gradient-to-b from-indigo-50/50 to-white p-5 rounded-2xl border border-indigo-100 inline-block mx-auto shadow-sm">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="JobScout Mobile App QR Code" 
                    className="w-56 h-56 mx-auto rounded-xl shadow-md border-4 border-white"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-xl animate-pulse">
                    <QrCode size={40} className="text-slate-300" />
                  </div>
                )}
                <div className="mt-3 text-[11px] font-bold text-indigo-700 flex items-center justify-center gap-1">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Scan with Phone Camera or Google Lens</span>
                </div>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <p className="text-xs text-slate-600">
                  Phone aur PC dono ek hi Wi-Fi network par hon ya local network URL ke through connect hon:
                </p>

                <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={mobileUrl}
                    className="w-full bg-transparent text-xs font-mono text-slate-700 focus:outline-none px-2"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-indigo-600 font-bold text-xs border border-slate-200 transition flex items-center gap-1 shadow-xs shrink-0"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP INSTALLATION GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              
              {/* Platform Selector */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  onClick={() => setGuidePlatform('android')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    guidePlatform === 'android'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🤖 Android (APK & Chrome WebAPK)
                </button>
                <button
                  onClick={() => setGuidePlatform('ios')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    guidePlatform === 'ios'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🍎 iPhone & iPad (Safari)
                </button>
              </div>

              {guidePlatform === 'android' ? (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">APK Download Karein:</span>
                      <p className="text-slate-500 mt-0.5">
                        Upar diye gaye <strong>"Download APK"</strong> button par click karein aur `jobscout-mobile.apk` download hone par use tap karke install karein.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">Ya Chrome Browser se Direct Install Karein:</span>
                      <p className="text-slate-500 mt-0.5">
                        Phone me Chrome browser open karein, top-right me 3 dots menu (⋮) par tap karein aur <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> chunein.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">Poori Screen me App Chalayein:</span>
                      <p className="text-slate-500 mt-0.5">
                        Aapke home screen par JobScout ka app icon ban jayega. Ye bina browser address bar ke full native app ki tarah chalega!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">Safari Browser me Kholein:</span>
                      <p className="text-slate-500 mt-0.5">
                        Apne iPhone par Safari browser me JobScout ka link kholein ya QR code scan karein.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">Share Button Dabayein:</span>
                      <p className="text-slate-500 mt-0.5">
                        Screen ke neeche bane <strong>Share</strong> icon (teer wala square) par tap karein.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">"Add to Home Screen" Chunein:</span>
                      <p className="text-slate-500 mt-0.5">
                        Scroll karke <strong>"Add to Home Screen"</strong> par tap karein aur "Add" par click karein.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secure & Verified Build</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition active:scale-95 shadow-xs"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
};
