import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JobScoutLogo } from '../components/JobScoutLogo';

export const AuthModal = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login', 
  initialRole = 'seeker', 
  onSuccess 
}) => {
  const { login, register, sendOtp } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(initialMode || 'login');

  // Role for Signup: 'seeker' | 'emp'
  const [role, setRole] = useState(initialRole || 'seeker');

  // Fields
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State for Signup & OTP Login
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Login Mode Sub-switch
  const [showOtpLogin, setShowOtpLogin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setRole(initialRole || 'seeker');
      setError('');
      setSuccess('');
      setOtpSent(false);
      setOtp('');
      setShowOtpLogin(false);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  // Send OTP Handler for Phone / Email
  const handleSendOtp = async () => {
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your mobile number or email address');
      return;
    }
    const isEmail = cleanId.includes('@');
    if (!isEmail) {
      const cleanPhone = cleanId.replace(/[^0-9]/g, '').slice(-10);
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }
    }

    setError('');
    setSendingOtp(true);
    try {
      const res = await sendOtp(cleanId, mode === 'register' ? 'register' : 'login');
      setOtpSent(true);
      const code = res.otp || '123456';
      setSimulatedOtp(code);
      setOtp(code); // Auto-fill for convenience
      setSuccess(`OTP sent to ${cleanId} (Demo Code: ${code})`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // Standard Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your email or mobile number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(cleanId, password);
      setSuccess(`Welcome back, ${loggedUser.name || 'User'}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(loggedUser, { isNewSignup: false });
        onClose();
      }, 400);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Minimal Signup Handler: Phone/Email + OTP + Password Only!
  const handleSignup = async (e) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!cleanId) {
      setError('Please enter your mobile number or email address');
      return;
    }
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP passcode received');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const isEmail = cleanId.includes('@');
      const payload = {
        name: isEmail ? cleanId.split('@')[0] : `User ${cleanId.replace(/[^0-9]/g, '').slice(-4)}`,
        email: isEmail ? cleanId.toLowerCase() : '',
        phone: !isEmail ? cleanId.replace(/[^0-9]/g, '').slice(-10) : '',
        otp: otp.trim(),
        password,
        role
      };

      const newUser = await register(payload);
      setSuccess(`Account created! Let's complete your profile.`);
      setTimeout(() => {
        // Pass isNewSignup: true so App.jsx opens the CompleteProfileModal immediately
        if (onSuccess) onSuccess(newUser, { isNewSignup: true });
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Signup failed. Please verify your OTP and details.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Login Helper
  const handleQuickDemo = async (demoId, demoPass) => {
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(demoId, demoPass);
      setSuccess(`Signed in as ${loggedUser.name}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(loggedUser, { isNewSignup: false });
        onClose();
      }, 400);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[94vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <JobScoutLogo size={36} />
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login' 
                  ? 'Access your jobs, radar & applications' 
                  : 'Fast signup with Phone/Email, OTP & Password'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 mx-6 mt-4 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* SIGN IN VIEW                                            */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or 9876543210"
                    autoFocus
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight size={16} />
              </button>

              {/* Quick Demo Logins */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  ⚡ 1-Click Fast Login
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('9876543210', 'password123')}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition flex items-center gap-1.5"
                  >
                    <Building2 size={15} className="text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-200 block truncate">Employer</span>
                      <span className="text-[9px] text-slate-400 block truncate">TechPulse</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('9123456789', 'password123')}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition flex items-center gap-1.5"
                  >
                    <User size={15} className="text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-200 block truncate">Candidate</span>
                      <span className="text-[9px] text-slate-400 block truncate">Rahul S.</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin@jobscout.io', 'admin123')}
                    disabled={loading}
                    className="p-2 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 rounded-xl text-left transition flex items-center gap-1.5"
                  >
                    <ShieldCheck size={15} className="text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-rose-200 block truncate">Admin</span>
                      <span className="text-[9px] text-rose-300/80 block truncate">Master Portal</span>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SIGNUP VIEW: ONLY PHONE/EMAIL, OTP & PASSWORD!          */}
          {/* ======================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  I want to:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('seeker')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      role === 'seeker'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <User size={18} className={role === 'seeker' ? 'text-indigo-400' : 'text-slate-500'} />
                    <span className="block text-xs font-bold mt-1 text-slate-200">Find Jobs</span>
                    <span className="text-[10px] text-slate-400">Job Seeker</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('emp')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      role === 'emp'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Building2 size={18} className={role === 'emp' ? 'text-indigo-400' : 'text-slate-500'} />
                    <span className="block text-xs font-bold mt-1 text-slate-200">Hire Talent</span>
                    <span className="text-[10px] text-slate-400">Employer</span>
                  </button>
                </div>
              </div>

              {/* 1. Phone or Email + Send OTP Button */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone Number or Email
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                      <Mail size={16} />
                    </span>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setOtpSent(false);
                      }}
                      placeholder="9876543210 or name@example.com"
                      required
                      autoFocus
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !identifier.trim()}
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow disabled:opacity-50 shrink-0"
                  >
                    {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* 2. 6-Digit OTP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    6-Digit OTP Passcode
                  </label>
                  {simulatedOtp && (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      Code: {simulatedOtp}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code (e.g. 123456)"
                    maxLength={6}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Create Password (min 6 characters)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    minLength={6}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !identifier.trim() || !otp.trim() || !password}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Sign Up & Continue'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                Sign Up in 10 seconds
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
