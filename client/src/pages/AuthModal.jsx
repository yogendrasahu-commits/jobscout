import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  MapPin,
  Briefcase,
  Sparkles,
  Video,
  Zap,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  // Role for Signup: 'seeker' | 'emp'
  const [role, setRole] = useState(initialRole || 'seeker');

  // Login Method: 'phone' | 'email'
  const [loginMethod, setLoginMethod] = useState('phone');

  // Signup Method: 'phone' | 'email' (Switching toggle for signup)
  const [signupMethod, setSignupMethod] = useState('phone');
  const [showSecondaryField, setShowSecondaryField] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phoneInput, setPhoneInput] = useState(''); // for phone login
  const [emailInput, setEmailInput] = useState(''); // for email login
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phonePasswordMode, setPhonePasswordMode] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setRole(initialRole || 'seeker');
      setSignupMethod('phone');
      setShowSecondaryField(false);
      setError('');
      setSuccess('');
      setOtpSent(false);
      setOtp('');
      setSimulatedOtp('');
      setPhonePasswordMode(false);
      setName('');
      setSignupPhone('');
      setSignupEmail('');
      setPhoneInput('');
      setEmailInput('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  // Real-time password validations matching the uploaded design
  const reqLength = password.length >= 8;
  const reqNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const reqUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);

  // Field validation checks for green checkmarks
  const isNameValid = name.trim().length >= 2;
  const cleanSignupPhoneDigits = signupPhone.replace(/[^0-9]/g, '').slice(-10);
  const isSignupPhoneValid = /^[6-9]\d{9}$/.test(cleanSignupPhoneDigits);
  const isSignupEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim());
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;

  // Send OTP for Phone Login
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
      setOtp(code);
      setSuccess(`OTP sent to +91 ${cleanPhone} (Passcode: ${code})`);
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
      setError('Please enter the OTP passcode received');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await loginWithPhoneOtp(cleanPhone, otp.trim());
      if (res?.isNewUser) {
        setSuccess('Mobile verified! Complete your signup details.');
        setSignupPhone(cleanPhone);
        setMode('register');
        return;
      }

      setSuccess(`Welcome back, ${res.name || 'User'}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(res, { isNewSignup: false });
        onClose();
      }, 400);
    } catch (err) {
      setError(err.message || 'OTP verification failed');
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
      setError(err.message || 'Invalid mobile number or password');
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
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for Register (Handles both Phone and Email via Switching)
  const handleRegisterSendOtp = async () => {
    if (signupMethod === 'phone') {
      const cleanPhone = signupPhone.replace(/[^0-9]/g, '').slice(-10);
      if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit Indian mobile number');
        return;
      }
      setError('');
      setSendingOtp(true);
      try {
        const res = await sendOtp(cleanPhone, 'register');
        setOtpSent(true);
        const code = res?.otp || '123456';
        setSimulatedOtp(code);
        setOtp(code);
        setSuccess(`OTP sent to +91 ${cleanPhone} (Passcode: ${code})`);
      } catch (err) {
        setError(err.message || 'Failed to send OTP to mobile');
      } finally {
        setSendingOtp(false);
      }
    } else {
      const cleanEmail = signupEmail.trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Please enter a valid email address');
        return;
      }
      setError('');
      setSendingOtp(true);
      try {
        const res = await sendOtp(cleanEmail, 'register');
        setOtpSent(true);
        const code = res?.otp || '123456';
        setSimulatedOtp(code);
        setOtp(code);
        setSuccess(`OTP sent to ${cleanEmail} (Passcode: ${code})`);
      } catch (err) {
        setError(err.message || 'Failed to send OTP to email');
      } finally {
        setSendingOtp(false);
      }
    }
  };

  // Sign Up Handler (Validates Primary Method Selected via Switcher)
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters)');
      return;
    }

    const cleanPhone = signupPhone.replace(/[^0-9]/g, '').slice(-10);
    const cleanEmail = signupEmail.trim().toLowerCase();

    if (signupMethod === 'phone') {
      if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit Indian mobile number');
        return;
      }
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Please enter a valid email address');
        return;
      }
    } else {
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Please enter a valid email address');
        return;
      }
      if (cleanPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit Indian mobile number');
        return;
      }
    }

    if (!otp || otp.length < 4) {
      setError('Please enter the OTP passcode received');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (confirmPassword && confirmPassword !== password) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        otp: otp.trim(),
        password,
        role
      };

      const newUser = await register(payload);
      setSuccess(`Account created! Let's complete your profile.`);
      setTimeout(() => {
        if (onSuccess) onSuccess(newUser, { isNewSignup: true });
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Signup failed. Please verify your OTP and details.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Fast Login
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#D8E2FB]/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Split Card Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_25px_60px_-15px_rgba(59,102,245,0.25)] overflow-hidden my-auto grid grid-cols-1 md:grid-cols-12 border border-slate-100/80 z-10">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Clean Minimalist Form                      */}
        {/* ======================================================== */}
        <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white text-slate-800">
          
          {/* Top Bar: Back Button & Already Member Link */}
          <div className="flex items-center justify-between pb-2">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-slate-200 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition shadow-xs active:scale-95"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>

            <div className="text-xs text-slate-500 font-medium">
              {mode === 'register' ? (
                <>
                  Already member?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Not a member?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                    className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Header Title with Curved Doodle Arrow */}
          <div className="mt-3 mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {mode === 'register' ? 'Sign Up' : 'Sign In'}
              </h1>
              {/* Playful curved doodle arrow pointing down towards the input fields */}
              <svg 
                className="w-10 h-10 text-slate-800 -rotate-12 translate-y-1 shrink-0" 
                viewBox="0 0 48 48" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M10 12 C 22 6, 38 8, 35 24 C 33 32, 28 35, 23 38" 
                  stroke="currentColor" 
                  strokeWidth="2.4" 
                  strokeLinecap="round"
                />
                <path 
                  d="M20 32 L 23 38 L 29 35" 
                  stroke="currentColor" 
                  strokeWidth="2.4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'register' 
                ? 'Secure Your Communications with JobScout' 
                : 'Secure Your Career & Hiring with JobScout'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* SIGN UP FORM (Matches Uploaded Image Style with Switching) */}
          {/* ======================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* Top Controls: Role Toggle Pill & Method Switcher Pill */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                {/* 1. Role Toggle Pill */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full w-fit">
                  <button
                    type="button"
                    onClick={() => setRole('seeker')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      role === 'seeker'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <User size={12} />
                    <span>Job Seeker</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('emp')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      role === 'emp'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Building2 size={12} />
                    <span>Employer</span>
                  </button>
                </div>

                {/* 2. Method Switcher Pill: Phone vs Email */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setSignupMethod('phone');
                      setError('');
                      setSuccess('');
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      signupMethod === 'phone'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Phone size={12} />
                    <span>Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignupMethod('email');
                      setError('');
                      setSuccess('');
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      signupMethod === 'email'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Mail size={12} />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              {/* 1. Full Name Underline Field */}
              <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Daniel Ahmadi"
                    required
                    className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                  />
                  {isNameValid && (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* 2. PRIMARY CONTACT FIELD (SWITCHING BASED ON METHOD) */}
              {signupMethod === 'phone' ? (
                /* Mobile Number Field */
                <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                  <div className="flex items-center gap-2.5">
                    <Phone size={18} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-500 shrink-0">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={signupPhone}
                      onChange={(e) => {
                        setSignupPhone(e.target.value.replace(/[^0-9]/g, ''));
                        setOtpSent(false);
                      }}
                      placeholder="9876543210"
                      required
                      className="w-full bg-transparent text-sm font-mono tracking-wider text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                    />
                    {isSignupPhoneValid && (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={handleRegisterSendOtp}
                      disabled={sendingOtp || signupPhone.length < 10}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-bold rounded-full transition whitespace-nowrap disabled:opacity-50 shrink-0"
                    >
                      {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Email Address Field */
                <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-slate-400 shrink-0" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => {
                        setSignupEmail(e.target.value);
                        setOtpSent(false);
                      }}
                      placeholder="11Danielahmadi@gmail.com"
                      required
                      className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                    />
                    {isSignupEmailValid && (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={handleRegisterSendOtp}
                      disabled={sendingOtp || !signupEmail.trim()}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-bold rounded-full transition whitespace-nowrap disabled:opacity-50 shrink-0"
                    >
                      {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. OTP Passcode Underline Field */}
              <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                <div className="flex items-center gap-3">
                  <KeyRound size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="6-Digit OTP Passcode"
                    required
                    className="w-full bg-transparent text-sm font-mono tracking-widest text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                  />
                  {otp.length === 6 && (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  )}
                  {simulatedOtp && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      Code: {simulatedOtp}
                    </span>
                  )}
                </div>
              </div>

              {/* Optional Secondary Field Toggle (+ Add Email or + Add Phone) */}
              {!showSecondaryField ? (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowSecondaryField(true)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                  >
                    {signupMethod === 'phone' ? '+ Also add email address (Optional)' : '+ Also add mobile number (Optional)'}
                  </button>
                </div>
              ) : (
                <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5 animate-fadeIn">
                  {signupMethod === 'phone' ? (
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-slate-400 shrink-0" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="Email Address (Optional)"
                        className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                      />
                      {isSignupEmailValid && (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <Phone size={18} className="text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-500 shrink-0">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Mobile Number (Optional)"
                        className="w-full bg-transparent text-sm font-mono tracking-wider text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                      />
                      {isSignupPhoneValid && (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Password Underline Field */}
              <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-slate-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    required
                    className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist (Single Line) */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] pt-1 pb-0.5">
                <span className={`inline-flex items-center gap-1 transition-colors ${reqLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {reqLength ? (
                    <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span>Least 8 characters</span>
                </span>
                <span className="text-slate-300 select-none">•</span>
                <span className={`inline-flex items-center gap-1 transition-colors ${reqNumberOrSymbol ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {reqNumberOrSymbol ? (
                    <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span>Number or symbol</span>
                </span>
                <span className="text-slate-300 select-none">•</span>
                <span className={`inline-flex items-center gap-1 transition-colors ${reqUpperLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {reqUpperLower ? (
                    <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span>a-z & A-Z</span>
                </span>
              </div>

              {/* 5. Re-Type Password Underline Field */}
              <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-slate-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-Type Password"
                    className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2 tracking-wider"
                  />
                  {isConfirmPasswordValid && (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Submit Row: Pill Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !name.trim() ||
                    (signupMethod === 'phone' ? !isSignupPhoneValid : !isSignupEmailValid) ||
                    !otp.trim() ||
                    !password
                  }
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-bold rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <span>{loading ? 'Creating...' : 'Sign Up'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SIGN IN FORM (Matches Uploaded Image Style)               */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <div className="space-y-3.5">
              {/* Method Switcher Pills: Mobile OTP vs Email & Password */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full w-fit">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setError(''); setSuccess(''); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                    loginMethod === 'phone'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Phone size={12} />
                  <span>Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setError(''); setSuccess(''); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                    loginMethod === 'email'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail size={12} />
                  <span>Email & Password</span>
                </button>
              </div>

              {/* METHOD A: PHONE NUMBER + OTP */}
              {loginMethod === 'phone' && (
                <form onSubmit={phonePasswordMode ? handlePhonePasswordLogin : handlePhoneOtpLogin} className="space-y-3.5">
                  {/* Mobile Input */}
                  <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="9876543210"
                        autoFocus
                        required
                        className="w-full bg-transparent text-sm font-mono tracking-wider text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                      />
                      {!phonePasswordMode && (
                        <button
                          type="button"
                          onClick={handlePhoneSendOtp}
                          disabled={sendingOtp || phoneInput.length < 10}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-bold rounded-full transition whitespace-nowrap disabled:opacity-50 shrink-0"
                        >
                          {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* OTP Input */}
                  {!phonePasswordMode && (
                    <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                      <div className="flex items-center gap-3">
                        <KeyRound size={18} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="6-Digit OTP Passcode"
                          required
                          className="w-full bg-transparent text-sm font-mono tracking-widest text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                        />
                        {otp.length === 6 && (
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        )}
                        {simulatedOtp && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                            Code: {simulatedOtp}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Password Input (if user toggled password mode) */}
                  {phonePasswordMode && (
                    <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                      <div className="flex items-center gap-3">
                        <Lock size={18} className="text-slate-400 shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Account Password"
                          required
                          className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 transition"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-bold rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <span>{loading ? 'Verifying...' : 'Sign In'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setPhonePasswordMode(!phonePasswordMode)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      {phonePasswordMode ? '← Sign In with OTP passcode' : 'Have a password? Sign in with password'}
                    </button>
                  </div>
                </form>
              )}

              {/* METHOD B: EMAIL + PASSWORD */}
              {loginMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-3.5">
                  {/* Email Underline */}
                  <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-slate-400 shrink-0" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="admin@jobscout.io or user@example.com"
                        autoFocus
                        required
                        className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                      />
                    </div>
                  </div>

                  {/* Password Underline */}
                  <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-slate-400 shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-bold rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* Fast 1-Click Demo Logins for Seeker, Employer & Admin */}
              <div className="pt-2.5 border-t border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  ⚡ 1-Click Demo Login
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('9123456789', 'password123')}
                    disabled={loading}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-center gap-1.5 group"
                  >
                    <User size={14} className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-700 block truncate">Seeker</span>
                      <span className="text-[9px] text-slate-400 block truncate">Rahul S.</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('9876543210', 'password123')}
                    disabled={loading}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-center gap-1.5 group"
                  >
                    <Building2 size={14} className="text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-700 block truncate">Employer</span>
                      <span className="text-[9px] text-slate-400 block truncate">TechPulse</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin@jobscout.io', 'admin123')}
                    disabled={loading}
                    className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition flex items-center gap-1.5 group"
                  >
                    <ShieldCheck size={14} className="text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-rose-700 block truncate">Admin</span>
                      <span className="text-[9px] text-rose-400 block truncate">Portal</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Language Selector Pill */}
          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold cursor-pointer hover:text-slate-800 transition select-none">
              <span className="text-sm">🇬🇧</span>
              <span>ENG</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            <span className="text-[10px] text-slate-400 font-medium">
              JobScout v2.4 • End-to-End Encrypted
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Creative Visual Illustration Panel         */}
        {/* ======================================================== */}
        <div className="hidden md:flex md:col-span-5 relative bg-gradient-to-br from-[#3B66F5] via-[#4361EE] to-[#2563EB] overflow-hidden p-6 sm:p-8 flex-col justify-between text-white select-none min-h-[560px]">
          
          {/* Layered Organic Wave Vectors in Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Top Organic Midnight Blue Curve (protruding into the top dividing edge) */}
            <svg 
              className="absolute -top-10 -left-12 w-80 h-80 text-[#1E3A8A]/50" 
              viewBox="0 0 200 200" 
              fill="currentColor"
            >
              <path d="M42.7,-72.8C54.6,-66.4,63.1,-54.3,69.5,-41.4C75.9,-28.5,80.2,-14.2,79.5,-0.4C78.8,13.4,73.1,26.8,65.3,38.8C57.6,50.8,47.8,61.4,35.8,68.4C23.8,75.4,9.6,78.8,-4.2,79.2C-18,79.6,-31.6,77.1,-43.8,70.3C-56,63.5,-66.8,52.4,-73.4,39.3C-80,26.2,-82.4,11.1,-80.7,-3.3C-79,-17.7,-73.2,-31.4,-64.1,-42.6C-55,-53.8,-42.6,-62.5,-29.7,-68.3C-16.8,-74.1,-3.4,-77,10.6,-76.3C24.6,-75.6,30.8,-79.2,42.7,-72.8Z" transform="translate(100 100)" />
            </svg>

            {/* Middle Cyan Wave Crest */}
            <svg 
              className="absolute top-1/4 -right-16 w-80 h-80 text-[#60A5FA]/30" 
              viewBox="0 0 200 200" 
              fill="currentColor"
            >
              <path d="M37.8,-63.3C49.1,-57.4,58.5,-47.4,65.8,-35.6C73.1,-23.8,78.3,-10.2,77.2,3.1C76.1,16.4,68.7,29.4,59.8,40.6C50.9,51.8,40.5,61.2,28.2,67.1C15.9,73,-0.3,75.4,-15.7,72.7C-31.1,70,-45.7,62.2,-56.3,50.7C-66.9,39.2,-73.5,24,-74.6,8.5C-75.7,-7,-71.3,-22.8,-62.9,-35.5C-54.5,-48.2,-42.1,-57.8,-29.4,-62.8C-16.7,-67.8,-3.7,-68.2,9.3,-68.3C22.3,-68.4,26.5,-69.2,37.8,-63.3Z" transform="translate(100 100)" />
            </svg>

            {/* Bottom Swoop Wave Curve */}
            <svg 
              className="absolute -bottom-16 -left-12 w-96 h-96 text-[#2563EB]/60" 
              viewBox="0 0 200 200" 
              fill="currentColor"
            >
              <path d="M47.2,-78.9C60.3,-73.2,69.5,-59.8,75.3,-45.3C81.1,-30.8,83.5,-15.4,81.4,-0.8C79.3,13.8,72.7,27.6,64.6,40.1C56.5,52.6,46.9,63.8,34.8,70.9C22.7,78,8.1,81,-6.6,81.2C-21.3,81.4,-36.1,78.8,-48.3,71.7C-60.5,64.6,-70.1,53,-76.3,39.7C-82.5,26.4,-85.3,11.4,-83.4,-2.9C-81.5,-17.2,-74.9,-30.8,-65.7,-42.2C-56.5,-53.6,-44.7,-62.8,-31.8,-68.6C-18.9,-74.4,-5,-76.8,9.7,-77.8C24.4,-78.8,34.1,-84.6,47.2,-78.9Z" transform="translate(100 100)" />
            </svg>
          </div>

          {/* Close Button on Top Right */}
          <div className="relative z-20 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 shadow-sm"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Canvas Floating Elements */}
          <div className="relative z-10 flex-1 flex flex-col justify-around py-2">
            
            {/* 1. JobScout Live Radar Metric Card (Upper Area) */}
            <div className="relative self-start ml-1 sm:ml-2">
              <div className="bg-white rounded-2xl p-4 shadow-2xl w-48 relative border border-white/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Jobs Radar
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                    <MapPin size={10} className="text-rose-500" />
                    5km
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  2,840+
                </div>
                <div className="text-[10px] text-slate-400 font-medium -mt-0.5">
                  Open Roles in Mumbai
                </div>

                {/* Multi-color Radar Signal / Wave Chart */}
                <div className="relative mt-2 h-10 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 140 40" fill="none">
                    {/* Emerald Bezier Wave */}
                    <path
                      d="M 5 28 C 20 8, 35 34, 50 20 C 65 6, 80 34, 95 18 C 110 2, 125 32, 135 22"
                      stroke="#10B981"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    {/* Indigo Bezier Wave */}
                    <path
                      d="M 5 22 C 20 32, 35 12, 55 24 C 70 32, 85 10, 105 26 C 120 36, 130 16, 135 20"
                      stroke="#4F46E5"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                  </svg>

                  {/* Center AI Match Score Badge (Replaces the generic "45") */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-lg border-2 border-white">
                    <Sparkles size={9} className="text-amber-400 fill-amber-400" />
                    <span>98%</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Hyperlocal Map Radar Pin (Replaces Instagram badge) */}
              <div className="absolute -top-3 -right-16 sm:-right-20 w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xl border-2 border-white/80 animate-pulse">
                <MapPin size={22} className="text-white stroke-[2.5]" />
              </div>

              {/* Floating Badge 2: WebRTC Speed Interview (Replaces TikTok badge) */}
              <div className="absolute top-14 -right-12 sm:-right-14 w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shadow-xl border-2 border-white/80">
                <Video size={18} className="text-cyan-400 stroke-[2.5]" />
              </div>
            </div>

            {/* 2. Floating JobScout Verified Match Card (Lower Area) */}
            <div className="relative self-end mr-1 mt-6">
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl w-60 sm:w-72 relative border border-white/60">
                <div className="flex items-start justify-between">
                  {/* Job Title & Details Preview */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-800 tracking-tight">Full-Stack Engineer</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 block">TechPulse • ₹12-18 LPA</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      <Navigation size={9} /> 2.4 km away • BKC
                    </span>
                  </div>

                  {/* Briefcase Brand Icon Badge */}
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Briefcase size={20} className="stroke-[2.5]" />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <h4 className="text-slate-900 font-bold text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                    <span>Hyperlocal Career Radar</span>
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  </h4>
                  <p className="text-slate-500 text-[10px] sm:text-[11px] leading-relaxed mt-1">
                    Connect directly with verified local hiring managers with real-time video calls & instant WhatsApp alerts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="relative z-10 flex items-center justify-between text-xs text-white/80 border-t border-white/10 pt-4">
            <span className="font-semibold tracking-wide flex items-center gap-1.5">
              <Zap size={14} className="text-amber-300 fill-amber-300" />
              JobScout Radar v2.4
            </span>
            <span className="text-white/60 font-medium">Hyperlocal Hiring</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
