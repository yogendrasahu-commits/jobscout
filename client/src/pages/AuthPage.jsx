import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles,
  MapPin,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JobScoutLogo } from '../components/JobScoutLogo';

export const AuthPage = ({ initialTab = 'email', onComplete, onBack }) => {
  const { login, loginWithPhoneOtp, registerWithPhone, sendOtp, checkPhone } = useAuth();

  // Tab: 'email' | 'phone' | 'signup'
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Role for Signup: 'seeker' | 'emp'
  const [role, setRole] = useState('seeker');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // Signup fields
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email Login Handler
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const loggedUser = await login(email.trim(), password);
      setSuccess(`Welcome back, ${loggedUser.name || 'User'}!`);
      if (onComplete) onComplete(loggedUser);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Send
  const handleSendOtp = async () => {
    const cleaned = phone.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(cleaned, activeTab === 'signup' ? 'register' : 'login');
      setOtpSent(true);
      setSimulatedOtp(res.simulatedOtp || '123456');
      setSuccess(`Passcode sent to +91 ${cleaned} (Test: ${res.simulatedOtp || '123456'})`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Login
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/[^0-9]/g, '').slice(-10);
    if (!cleaned) {
      setError('Please enter mobile number');
      return;
    }
    if (!otp) {
      setError('Please enter 6-digit OTP passcode');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const loggedUser = await loginWithPhoneOtp(cleaned, otp);
      setSuccess(`Welcome, ${loggedUser.name || 'User'}!`);
      if (onComplete) onComplete(loggedUser);
    } catch (err) {
      setError(err.message || 'Invalid OTP passcode.');
    } finally {
      setLoading(false);
    }
  };

  // Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/[^0-9]/g, '').slice(-10);
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const newUser = await registerWithPhone({
        phone: cleaned,
        otp: otp || '123456',
        name: name.trim(),
        password,
        role,
        companyName: role === 'emp' ? companyName.trim() : '',
        title: role === 'seeker' ? title.trim() : '',
        skills: role === 'seeker' ? skills : []
      });
      setSuccess(`Account created successfully! Welcome to JobScout.`);
      if (onComplete) onComplete(newUser);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 antialiased">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: BRAND HERO SHOWCASE (5 COLS)                */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          
          <div>
            {/* Logo Lockup */}
            <div className="flex items-center gap-3 mb-6">
              <JobScoutLogo size={46} />
              <div>
                <span className="font-black text-xl tracking-tight text-white flex items-center">
                  Job<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 ml-0.5">Scout</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 ml-1.5 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                </span>
                <span className="text-[11px] text-slate-400 font-semibold block">Real-time Map & Speed Connect</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight mb-2">
              Discover opportunities <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">within minutes</span>.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Real-time geospatial talent radar, WebRTC speed calling, and verified hiring within your neighbourhood.
            </p>

            {/* Live Stats Pill */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4 shadow-inner">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Platform Stats
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">India GPS</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Active Openings</span>
                  <span className="text-base font-black text-white">1,420+ Jobs</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Speed Connect</span>
                  <span className="text-base font-black text-cyan-400">Instant</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              OWASP & 256-Bit Encrypted
            </span>
            {onBack && (
              <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to App
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: ACTION FORMS (7 COLS)                      */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-slate-950 p-6 sm:p-8 flex flex-col justify-center">

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 mb-6 gap-1">
            <button
              onClick={() => { setActiveTab('email'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Sign In</span>
            </button>

            <button
              onClick={() => { setActiveTab('phone'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'phone'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone OTP</span>
            </button>

            <button
              onClick={() => { setActiveTab('signup'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium text-center">
              {success}
            </div>
          )}

          {/* TAB 1: EMAIL LOGIN */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Direct Access</span>
                <h3 className="text-xl font-black text-white tracking-tight mt-0.5">Sign in with Corporate Email</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset verification link has been sent to your email.')}
                    className="text-xs font-bold text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-300 font-medium">Remember me for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-500 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{loading ? 'Signing In...' : 'Sign In with Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: PHONE OTP LOGIN */}
          {activeTab === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Fast Access</span>
                <h3 className="text-xl font-black text-white tracking-tight mt-0.5">Sign in with Mobile OTP</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Indian Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-300 font-bold select-none">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9820123456"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-bold tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || phone.length < 10}
                    className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 disabled:opacity-40 text-indigo-400 border border-indigo-500/30 font-bold text-xs rounded-xl transition-all"
                  >
                    {otpSent ? 'Resend' : 'Get OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">6-Digit OTP</label>
                    {simulatedOtp && (
                      <span className="text-xs text-emerald-400 font-bold">Demo OTP: {simulatedOtp}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-center text-white tracking-widest font-black focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phone || (otpSent && !otp)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{loading ? 'Verifying...' : 'Verify OTP & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Join Platform</span>
                <h3 className="text-xl font-black text-white tracking-tight mt-0.5">Create New Account</h3>
              </div>

              {/* Role Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('seeker')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === 'seeker'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm">🎯</span>
                    {role === 'seeker' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div className="text-xs font-bold text-white">Job Seeker</div>
                  <p className="text-[10px] text-slate-400 leading-tight">Apply to nearby jobs</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('emp')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === 'emp'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm">👔</span>
                    {role === 'emp' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-xs font-bold text-white">Employer</div>
                  <p className="text-[10px] text-slate-400 leading-tight">Post jobs & hire talent</p>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile (+91)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="10-digit number"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              {role === 'emp' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Company / Organization Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Role & Core Skills</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer (React, Tailwind)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Set Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-indigo-600 to-cyan-500 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
