import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JobScoutLogo } from '../components/JobScoutLogo';

export const AuthPage = ({ initialTab = 'login', onComplete, onBack }) => {
  const { login, register, loginWithPhoneOtp, sendOtp } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(initialTab === 'signup' || initialTab === 'register' ? 'register' : 'login');
  const [role, setRole] = useState('seeker');

  // Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Fallback
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Standard Login
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
      setSuccess(`Welcome back, ${loggedUser.name}!`);
      setTimeout(() => {
        if (onComplete) onComplete(loggedUser);
      }, 500);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Minimal Signup: Phone/Email + OTP + Password only
  const handleSignup = async (e) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!cleanId) {
      setError('Please enter an email address or mobile number');
      return;
    }
    if (!otpCode || otpCode.length < 4) {
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
        otp: otpCode.trim(),
        password,
        role
      };

      const newUser = await register(payload);
      setSuccess(`Account created! Let's complete your profile.`);
      setTimeout(() => {
        if (onComplete) onComplete(newUser, { isNewSignup: true });
      }, 500);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSignupOtp = async () => {
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
    setLoading(true);
    try {
      const res = await sendOtp(cleanId, 'register');
      setOtpSent(true);
      const code = res.otp || '123456';
      setOtpCode(code);
      setSuccess(`OTP sent to ${cleanId} (Demo Code: ${code})`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickDemo = async (demoId, demoPass) => {
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(demoId, demoPass);
      setSuccess(`Signed in as ${loggedUser.name}!`);
      setTimeout(() => {
        if (onComplete) onComplete(loggedUser);
      }, 400);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    const clean = otpPhone.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp(clean, 'login');
      setOtpSent(true);
      setSuccess('Test OTP sent! Use 123456 to log in.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const clean = otpPhone.replace(/[^0-9]/g, '').slice(-10);
    if (!clean || !otpCode) {
      setError('Please enter phone and 6-digit OTP code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const loggedUser = await loginWithPhoneOtp(clean, otpCode);
      setSuccess(`Welcome, ${loggedUser.name}!`);
      setTimeout(() => {
        if (onComplete) onComplete(loggedUser);
      }, 500);
    } catch (err) {
      setError(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 antialiased">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Brand Hero */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
              >
                <ArrowLeft size={16} />
                Back to Platform
              </button>
            )}
            <div className="flex items-center gap-3 mb-6">
              <JobScoutLogo size={42} />
              <div>
                <span className="font-black text-xl tracking-tight text-white flex items-center">
                  Job<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 ml-0.5">Scout</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 ml-1.5 animate-pulse" />
                </span>
                <span className="text-[11px] text-slate-400 font-semibold block">Real-time Map & Speed Connect</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white leading-tight mb-3">
              {mode === 'login' ? (
                <>Welcome back to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">career radar</span>.</>
              ) : (
                <>Join JobScout and connect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">in minutes</span>.</>
              )}
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Geospatial talent discovery, WebRTC video calling, and instant spot-hiring in your local area.
            </p>
          </div>

          {/* Quick Demo Pill Footer */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              ⚡ Instant Demo Profiles
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('9876543210', 'password123')}
                disabled={loading}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
              >
                <span className="text-xs font-semibold text-white block truncate">TechPulse</span>
                <span className="text-[10px] text-slate-400 block truncate">👔 Employer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('9123456789', 'password123')}
                disabled={loading}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
              >
                <span className="text-xs font-semibold text-white block truncate">Rahul S.</span>
                <span className="text-[10px] text-slate-400 block truncate">🔍 Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@jobscout.io', 'admin123')}
                disabled={loading}
                className="p-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl text-left transition"
              >
                <span className="text-xs font-semibold text-rose-300 block truncate">Admin</span>
                <span className="text-[10px] text-rose-400 block truncate">🛡️ Super Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Form */}
        <div className="p-8 flex flex-col justify-center">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); setShowOtpLogin(false); }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && !showOtpLogin && (
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
                    placeholder="Enter password"
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
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight size={16} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpLogin(true)}
                  className="text-xs text-slate-400 hover:text-indigo-400 transition"
                >
                  Prefer mobile passcode? <span className="underline font-medium">Log in with OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* Login with OTP Form */}
          {mode === 'login' && showOtpLogin && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  10-Digit Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpPhone.length < 10}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition disabled:opacity-50"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Enter 6-Digit OTP (Demo: <span className="text-cyan-400 font-mono">123456</span>)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                      <KeyRound size={16} />
                    </span>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !otpCode}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowOtpLogin(false)}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  &larr; Back to Email / Password Login
                </button>
              </div>
            </form>
          )}

          {/* Simple Signup Form */}
          {mode === 'register' && (
            <form onSubmit={handleSignup} className="space-y-4">
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

              {/* Mobile Number or Email + Send OTP */}
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendSignupOtp}
                    disabled={loading || !identifier.trim()}
                    className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-xs font-bold text-indigo-300 hover:text-white rounded-xl transition disabled:opacity-40 shrink-0"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {/* OTP Passcode */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    One-Time Passcode (OTP)
                  </label>
                  {otpSent && (
                    <span className="text-[11px] text-emerald-400 font-mono font-medium">
                      Demo OTP: 123456
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP (e.g. 123456)"
                    maxLength={6}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password (min 6 characters)
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Sign Up & Continue'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
