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
  const { login, register, sendOtp, loginWithPhoneOtp } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(initialMode || 'login');

  // Login Method: 'phone' | 'email'
  const [loginMethod, setLoginMethod] = useState('phone');

  // Role for Signup: 'seeker' | 'emp'
  const [role, setRole] = useState(initialRole || 'seeker');

  // Login Specific Fields
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phonePasswordMode, setPhonePasswordMode] = useState(false);

  // OTP State for Phone Login & Signup
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Generic identifier for register (Phone or Email)
  const [identifier, setIdentifier] = useState('');

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
      setPhonePasswordMode(false);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  // Send OTP Handler for Phone Login
  const handlePhoneSendOtp = async () => {
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setError('');
    setSendingOtp(true);
    try {
      const res = await sendOtp(cleanPhone, 'login');
      setOtpSent(true);
      const code = res.otp || '123456';
      setSimulatedOtp(code);
      setOtp(code); // Conveniently auto-fill demo OTP
      setSuccess(`OTP sent to +91 ${cleanPhone} (Demo Passcode: ${code})`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP to mobile number');
    } finally {
      setSendingOtp(false);
    }
  };

  // Phone + OTP Login Handler
  const handlePhoneOtpLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit OTP received');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await loginWithPhoneOtp(cleanPhone, otp.trim());
      if (res?.isNewUser) {
        setSuccess('Mobile number verified! Please create your account.');
        setIdentifier(cleanPhone);
        setMode('register');
        setOtp(otp);
        return;
      }

      setSuccess(`Welcome back, ${res.name || 'User'}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(res, { isNewSignup: false });
        onClose();
      }, 400);
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Phone + Password Login Handler
  const handlePhonePasswordLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(cleanPhone, password);
      setSuccess(`Welcome back, ${loggedUser.name || 'User'}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(loggedUser, { isNewSignup: false });
        onClose();
      }, 400);
    } catch (err) {
      setError(err.message || 'Invalid mobile number or password.');
    } finally {
      setLoading(false);
    }
  };

  // Email + Password Login Handler
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(cleanEmail, password);
      setSuccess(`Welcome back, ${loggedUser.name || 'User'}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(loggedUser, { isNewSignup: false });
        onClose();
      }, 400);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for Registration
  const handleRegisterSendOtp = async () => {
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
      const res = await sendOtp(cleanId, 'register');
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
            <div className="space-y-4">
              {/* Method Switcher Tabs: Phone + OTP vs Email + Password */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setError(''); setSuccess(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    loginMethod === 'phone'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone size={13} />
                  <span>Mobile + OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setError(''); setSuccess(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    loginMethod === 'email'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail size={13} />
                  <span>Email + Password</span>
                </button>
              </div>

              {/* METHOD A: PHONE NUMBER + OTP */}
              {loginMethod === 'phone' && (
                <form onSubmit={phonePasswordMode ? handlePhonePasswordLogin : handlePhoneOtpLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      10-Digit Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-bold pointer-events-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phoneInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setPhoneInput(val);
                          }}
                          placeholder="9876543210"
                          autoFocus
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono tracking-wider transition"
                        />
                      </div>

                      {!phonePasswordMode && (
                        <button
                          type="button"
                          onClick={handlePhoneSendOtp}
                          disabled={sendingOtp || phoneInput.length < 10}
                          className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap active:scale-95 flex items-center gap-1"
                        >
                          {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* OTP Field (if OTP mode) */}
                  {!phonePasswordMode && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-slate-300">
                          6-Digit OTP Passcode
                        </label>
                        {simulatedOtp && (
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">
                            Demo Code: {simulatedOtp}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                          <KeyRound size={16} />
                        </span>
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123456"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono tracking-widest transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Field (if Password mode for phone) */}
                  {phonePasswordMode && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Account Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                          <Lock size={16} />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your account password"
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
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:from-indigo-700 active:to-violet-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : phonePasswordMode ? 'Sign In with Password' : 'Verify OTP & Sign In'}
                    <ArrowRight size={15} />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setPhonePasswordMode(!phonePasswordMode)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {phonePasswordMode ? '← Sign In with OTP instead' : 'Have a password? Sign In with Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* METHOD B: EMAIL + PASSWORD */}
              {loginMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="admin@jobscout.io or you@example.com"
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
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:from-indigo-700 active:to-violet-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign In with Password'}
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}

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
            </div>
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
                    onClick={handleRegisterSendOtp}
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
