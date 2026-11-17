import React, { useState } from 'react';
import { Settings, X, Wifi, CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react';

export const ServerConfigModal = ({ isOpen, onClose }) => {
  const currentSaved = typeof window !== 'undefined' ? localStorage.getItem('jobscout_server_url') || '' : '';
  const [serverUrl, setServerUrl] = useState(currentSaved || (typeof window !== 'undefined' ? window.location.origin : 'http://192.168.11.22:5000'));
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, msg: string }

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = serverUrl.replace(/\/+$/, '');
      const start = Date.now();
      const res = await fetch(`${cleanUrl}/api/health`, { method: 'GET', signal: AbortSignal.timeout(6000) });
      const duration = Date.now() - start;
      if (res.ok) {
        setTestResult({
          success: true,
          msg: `Connected successfully in ${duration}ms! Backend is live.`
        });
      } else {
        setTestResult({
          success: false,
          msg: `HTTP ${res.status}: Backend responded with non-200 code.`
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        msg: `Connection failed: ${err.message || 'Server unreachable'}. Verify IP/port and firewall.`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const cleanUrl = serverUrl.trim().replace(/\/+$/, '');
    if (cleanUrl) {
      localStorage.setItem('jobscout_server_url', cleanUrl);
    } else {
      localStorage.removeItem('jobscout_server_url');
    }
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem('jobscout_server_url');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-sm tracking-tight">App & PWA Server Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Mobile App (APK) aur PWA jis backend server se connect hote hain, uska URL yahan set kar sakte hain:
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              Backend Server URL
            </label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="e.g. http://192.168.11.22:5000 or https://jobscout.onrender.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setServerUrl('http://192.168.11.22:5000')}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
            >
              LAN: 192.168.11.22:5000
            </button>
            <button
              type="button"
              onClick={() => setServerUrl('http://localhost:5000')}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
            >
              Localhost: 5000
            </button>
            {typeof window !== 'undefined' && window.location.origin.includes('http') && (
              <button
                type="button"
                onClick={() => setServerUrl(window.location.origin)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
              >
                Current Origin ({window.location.host})
              </button>
            )}
          </div>

          {/* Test Connection Result */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{testResult.msg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                Reset Auto
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
