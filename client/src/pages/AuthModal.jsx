import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Building2, 
  Sparkles, 
  Briefcase,
  ShieldCheck,
  Award,
  DollarSign,
  Clock,
  Bike,
  Globe,
  MapPin,
  Layers,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JobScoutLogo } from '../components/JobScoutLogo';
import { LocationPickerInput } from '../components/LocationPickerInput';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', initialRole = 'seeker', onSuccess }) => {
  const { 
    sendOtp, 
    loginWithPhoneOtp, 
    loginWithPhonePassword, 
    registerWithPhone, 
    checkPhone
  } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(initialMode || 'login');
  
  // Login Sub-mode: 'otp' | 'password'
  const [loginMethod, setLoginMethod] = useState('otp');

  // Active Role for Registration: 'emp' | 'seeker'
  const [role, setRole] = useState(initialRole || 'seeker');

  useEffect(() => {
    if (isOpen) {
      if (initialMode) setMode(initialMode);
      if (initialRole) setRole(initialRole);
    }
  }, [isOpen, initialMode, initialRole]);

  // Common User fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Live Phone Check Result: { checking: boolean, exists: boolean, role: string, name: string, companyName: string, title: string }
  const [phoneCheck, setPhoneCheck] = useState(null);

  // -------------------------------------------------------------
  // DISTINCT EMPLOYER FIELDS (emp)
  // -------------------------------------------------------------
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology & IT');
  const [companySize, setCompanySize] = useState('1-10 Employees');
  const [hiringType, setHiringType] = useState('Full-time');
  const [officeAddress, setOfficeAddress] = useState('Bandra Kurla Complex (BKC), Mumbai');
  const [locationLat, setLocationLat] = useState(19.0760);
  const [locationLng, setLocationLng] = useState(72.8777);
  const [website, setWebsite] = useState('');

  // -------------------------------------------------------------
  // DISTINCT JOB SEEKER FIELDS (seeker)
  // -------------------------------------------------------------
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('1 - 3 Years');
  const [skills, setSkills] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [availability, setAvailability] = useState('Immediate (Ready Today)');
  const [hasVehicle, setHasVehicle] = useState(false);
  const [bio, setBio] = useState('');

  // OTP Verification state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [timer, setTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Live check phone registration whenever user types 10 digits
  useEffect(() => {
    let isMounted = true;
    if (phone.length === 10) {
      setPhoneCheck({ checking: true });
      checkPhone(phone).then(res => {
        if (isMounted) {
          setPhoneCheck({ checking: false, ...res });
        }
      });
    } else {
      setPhoneCheck(null);
    }
    return () => { isMounted = false; };
  }, [phone]);

  if (!isOpen) return null;

  // Clean 10-digit number
  const cleanNumber = (val) => val.replace(/[^0-9]/g, '').slice(0, 10);
  const isValidPhone = (num) => /^[6-9]\d{9}$/.test(num);

  // Switch to login with this existing number
  const handleSwitchToLogin = () => {
    setMode('login');
    setError('');
    setSuccessMsg(`Switched to login for +91 ${phone} (${phoneCheck?.name || ''})`);
  };

  // Send OTP
  const handleSendOtp = async (customPurpose = mode) => {
    setError('');
    setSuccessMsg('');
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)');
      return;
    }

    // In register mode: strictly block if already registered
    if (customPurpose === 'register' && phoneCheck?.exists) {
      const roleText = phoneCheck.role === 'emp' ? 'Employer (कंपनी/नियोक्ता)' : 'Job Seeker (उम्मीदवार)';
      setError(`यह मोबाइल नंबर (+91 ${phone}) पहले से ही ${roleText} के रूप में रजिस्टर्ड है। एक नंबर से केवल एक खाता बन सकता है।`);
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(phone, customPurpose);
      setOtpSent(true);
      setSimulatedOtp(res.otp || '123456');
      setTimer(45);
      setSuccessMsg(`OTP sent to +91 ${phone}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login via OTP
  const handleLoginOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpSent) {
      handleSendOtp('login');
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPhoneOtp(phone, otp);
      if (res && res.isNewUser) {
        setMode('register');
        setOtpVerified(true);
        setSuccessMsg('Phone verified! Please select your profile type and complete sign up.');
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login via Phone + Password
  const handleLoginPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await loginWithPhonePassword(phone, password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Handle Role-based Signup
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
      return;
    }
    if (phoneCheck?.exists) {
      const roleText = phoneCheck.role === 'emp' ? 'Employer (कंपनी/नियोक्ता)' : 'Job Seeker (उम्मीदवार)';
      setError(`यह मोबाइल नंबर पहले से ही ${roleText} के रूप में रजिस्टर्ड है। एक नंबर से केवल एक ही खाता बन सकता है। कृपया लॉगिन करें।`);
      return;
    }
    if (!otpSent) {
      setError('Please click "Send OTP" and verify your number first');
      return;
    }
    if (!otpVerified && !/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit OTP sent to your number');
      return;
    }
    if (name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Role-specific validation
    if (role === 'emp' && companyName.trim().length < 2) {
      setError('Please enter your Company / Organization name (at least 2 characters)');
      return;
    }

    if (role === 'seeker' && title.trim().length < 2) {
      setError('Please enter your Job Role / Profession (at least 2 characters)');
      return;
    }

    if (!officeAddress || !officeAddress.trim()) {
      setError('Please select or enter your city / location (स्थान / शहर)');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        phone,
        otp: otp || '123456',
        password,
        name: name.trim(),
        role,
        address: officeAddress.trim(),
        lat: locationLat || 19.0760,
        lng: locationLng || 72.8777,
        // Role-specific payload fields
        ...(role === 'emp' ? {
          companyName: companyName.trim(),
          industry,
          companySize,
          website: website.trim(),
          hiringType
        } : {
          title: title.trim(),
          experience,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          expectedSalary: expectedSalary.trim() || 'Negotiable',
          availability,
          vehicle: hasVehicle,
          bio: bio.trim()
        })
      };

      await registerWithPhone(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto my-auto text-slate-900">
        
        {/* Top-Left Back / Close Button */}
        {mode === 'register' ? (
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all shadow-sm active:scale-95"
            title="Go back to Sign In"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Back (लॉगिन)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all shadow-sm active:scale-95"
            title="Close dialog"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back / Close</span>
          </button>
        )}

        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all active:scale-95 shadow-sm"
          title="Close dialog"
        >
          <span className="text-[11px] font-semibold hidden sm:inline">Close (बंद करें)</span>
          <X className="w-4 h-4" />
        </button>

        {/* Brand / Title Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center mb-2 shadow-sm rounded-2xl">
            <JobScoutLogo size={46} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' ? 'JobScout Account Login' : 'Create Tailored Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'login'
              ? 'Sign in via Mobile OTP or Password'
              : 'Sign up with distinct Employer or Job Seeker options'}
          </p>
        </div>

        {/* Tab Toggle: Login vs Sign Up */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => { 
              setMode('login'); 
              setError(''); 
              setSuccessMsg(''); 
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In (लॉगिन)
          </button>
          <button
            type="button"
            onClick={() => { 
              setMode('register'); 
              setError(''); 
              setSuccessMsg(''); 
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign Up (नया खाता)
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        {/* ============================================================= */}
        {/* LOGIN VIEW                                                    */}
        {/* ============================================================= */}
        {mode === 'login' && (
          <div>
            <div className="flex items-center justify-center gap-4 mb-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setLoginMethod('otp'); setError(''); }}
                className={`pb-1 border-b-2 transition-all ${
                  loginMethod === 'otp'
                    ? 'border-indigo-600 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                📱 Login with OTP
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => { setLoginMethod('password'); setError(''); }}
                className={`pb-1 border-b-2 transition-all ${
                  loginMethod === 'password'
                    ? 'border-indigo-600 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                🔑 Login with Password
              </button>
            </div>

            {loginMethod === 'otp' ? (
              <form onSubmit={handleLoginOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 text-xs text-slate-700 font-bold select-none">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(cleanNumber(e.target.value))}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      disabled={loading || phone.length !== 10 || timer > 0}
                      onClick={() => handleSendOtp('login')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-indigo-700 font-bold text-xs border border-slate-200 whitespace-nowrap shadow-sm"
                    >
                      {timer > 0 ? `${timer}s` : otpSent ? 'Resend' : 'Get OTP'}
                    </button>
                  </div>

                  {/* Login Phone Feedback */}
                  {phoneCheck?.exists && (
                    <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">
                          खाता मिला: <strong className="text-slate-900">{phoneCheck.name}</strong> (
                          {phoneCheck.role === 'emp' ? '👔 Employer' : '🔍 Job Seeker'})
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex-shrink-0 border border-emerald-200">
                        Registered
                      </span>
                    </div>
                  )}

                  {phoneCheck && !phoneCheck.exists && !phoneCheck.checking && phone.length === 10 && (
                    <div className="mt-1.5 p-2 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-800 animate-in fade-in">
                      <span className="truncate">
                        ℹ️ यह नंबर रजिस्टर्ड नहीं है।
                      </span>
                      <button
                        type="button"
                        onClick={() => { setMode('register'); setError(''); }}
                        className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded-md font-bold transition-colors whitespace-nowrap ml-2 shadow-sm"
                      >
                        नया खाता बनाएं (Sign Up)
                      </button>
                    </div>
                  )}
                </div>

                {otpSent && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    {simulatedOtp && (
                      <div
                        onClick={() => setOtp(simulatedOtp)}
                        className="cursor-pointer p-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Test OTP: <strong className="text-slate-900 tracking-widest">{simulatedOtp}</strong>
                        </span>
                        <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded text-white font-bold shadow-sm">
                          Click to Fill
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Enter 6-Digit OTP
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-center text-slate-900 tracking-widest placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel (रद्द करें)</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {loading ? 'Verifying...' : otpSent ? 'Verify OTP & Enter' : 'Send OTP to Login'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 text-xs text-slate-700 font-bold select-none">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(cleanNumber(e.target.value))}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                  </div>

                  {/* Password Form Phone Feedback */}
                  {phoneCheck?.exists && (
                    <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">
                          खाता मिला: <strong className="text-slate-900">{phoneCheck.name}</strong> (
                          {phoneCheck.role === 'emp' ? '👔 Employer' : '🔍 Job Seeker'})
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex-shrink-0 border border-emerald-200">
                        Registered
                      </span>
                    </div>
                  )}

                  {phoneCheck && !phoneCheck.exists && !phoneCheck.checking && phone.length === 10 && (
                    <div className="mt-1.5 p-2 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-800 animate-in fade-in">
                      <span className="truncate">
                        ℹ️ यह नंबर रजिस्टर्ड नहीं है।
                      </span>
                      <button
                        type="button"
                        onClick={() => { setMode('register'); setError(''); }}
                        className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded-md font-bold transition-colors whitespace-nowrap ml-2 shadow-sm"
                      >
                        नया खाता बनाएं (Sign Up)
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel (रद्द करें)</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {loading ? 'Signing In...' : 'Sign In with Password'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* SIGNUP VIEW WITH DISTINCT EMPLOYER & SEEKER OPTIONS            */}
        {/* ============================================================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            
            {/* 1. Distinct Role Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Profile Type (प्रोफाइल प्रकार चुनें):
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                
                {/* Seeker Option Card */}
                <button
                  type="button"
                  onClick={() => setRole('seeker')}
                  className={`p-3 rounded-2xl border text-left transition-all shadow-sm ${
                    role === 'seeker'
                      ? 'bg-emerald-50/80 border-2 border-emerald-600'
                      : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">🔍</span>
                    {role === 'seeker' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className={`text-xs font-bold ${role === 'seeker' ? 'text-slate-900' : 'text-slate-700'}`}>
                    Job Seeker (उम्मीदवार)
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Nearby jobs dhoondhein aur spot-hiring ke liye apply karein
                  </p>
                </button>

                {/* Employer Option Card */}
                <button
                  type="button"
                  onClick={() => setRole('emp')}
                  className={`p-3 rounded-2xl border text-left transition-all shadow-sm ${
                    role === 'emp'
                      ? 'bg-indigo-50/80 border-2 border-indigo-600'
                      : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">👔</span>
                    {role === 'emp' && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <div className={`text-xs font-bold ${role === 'emp' ? 'text-slate-900' : 'text-slate-700'}`}>
                    Employer (नियोक्ता/कंपनी)
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Nayi opening post karein aur seekers ko call karein
                  </p>
                </button>

              </div>
            </div>

            {/* 2. Mobile Number & Verification */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <div className="flex gap-2">
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2.5 text-xs text-slate-700 font-bold select-none">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(cleanNumber(e.target.value))}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
                <button
                  type="button"
                  disabled={loading || phone.length !== 10 || timer > 0 || phoneCheck?.exists}
                  onClick={() => handleSendOtp('register')}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-indigo-700 font-bold text-xs border border-slate-200 whitespace-nowrap shadow-sm"
                >
                  {timer > 0 ? `${timer}s` : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>

              {/* Already Registered Warning & 1-Click Login Action */}
              {phoneCheck?.exists && (
                <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 animate-in fade-in space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">⚠️</span>
                    <div className="flex-1">
                      <div className="font-bold text-amber-900">
                        यह नंबर पहले से रजिस्टर्ड है! (Already Registered)
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                        यह मोबाइल नंबर <strong className="text-slate-900">+91 {phone}</strong> पहले से ही{' '}
                        <span className="font-bold underline text-indigo-700">
                          {phoneCheck.role === 'emp' ? '👔 Employer (कंपनी/नियोक्ता)' : '🔍 Job Seeker (उम्मीदवार)'}
                        </span>{' '}
                        के रूप में <strong>"{phoneCheck.name}"</strong> के नाम पर पंजीकृत है।
                      </p>
                      <p className="text-[10px] text-amber-700 mt-1">
                        🔒 नियम: 1 मोबाइल नंबर = केवल 1 खाता (Single Account Rule).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleSwitchToLogin}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>👉 इसी नंबर से लॉगिन करें (Login Now)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPhone(''); setPhoneCheck(null); }}
                      className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
                    >
                      दूसरा नंबर डालें
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* OTP Entry */}
            {otpSent && (
              <div className="animate-in fade-in duration-200">
                {simulatedOtp && (
                  <div
                    onClick={() => setOtp(simulatedOtp)}
                    className="cursor-pointer mb-2 p-1.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between text-[11px] text-indigo-700 shadow-sm"
                  >
                    <span>Test OTP: <strong className="text-slate-900">{simulatedOtp}</strong></span>
                    <span className="text-[9px] bg-indigo-600 px-1.5 py-0.5 rounded text-white font-bold">Auto-Fill</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP *"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 tracking-wider focus:outline-none focus:bg-white focus:border-indigo-500 font-mono"
                  />
                  <div className="flex items-center text-xs text-emerald-600 font-semibold px-2">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Ready
                  </div>
                </div>
              </div>
            )}

            {/* Basic Info: Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'emp' ? 'Contact Person / HR Name *' : 'Your Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder={role === 'emp' ? 'e.g. Vikram Singhania' : 'e.g. Rahul Sharma'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            {/* ========================================================= */}
            {/* CASE A: DISTINCT EMPLOYER PROFILE OPTIONS                 */}
            {/* ========================================================= */}
            {role === 'emp' && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-2.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Company & Hiring Profile (कंपनी विवरण)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Company / Firm Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TechPulse Solutions Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Technology & IT">Technology & IT</option>
                      <option value="Logistics & Delivery">Logistics & Delivery</option>
                      <option value="Retail & E-commerce">Retail & Commerce</option>
                      <option value="Hospitality & Restaurant">Hospitality</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Construction & Field">Construction & Field</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Team Size
                    </label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1-10 Employees">1-10 Employees</option>
                      <option value="11-50 Employees">11-50 Employees</option>
                      <option value="50-200 Employees">50-200 Employees</option>
                      <option value="200+ Employees">200+ Employees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Hiring Model
                  </label>
                  <select
                    value={hiringType}
                    onChange={(e) => setHiringType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Immediate Spot Hiring">Immediate Spot Hiring</option>
                    <option value="Full-time Permanent">Full-time Permanent</option>
                    <option value="Part-time / Gigs">Part-time / Gigs</option>
                  </select>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* CASE B: DISTINCT JOB SEEKER PROFILE OPTIONS               */}
            {/* ========================================================= */}
            {role === 'seeker' && (
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Job Seeker Candidate Profile (कार्य विवरण)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Primary Profession / Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React Developer, Delivery Executive, Graphic Designer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Experience Level
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Fresher / Entry Level">Fresher / 0-1 yr</option>
                      <option value="1 - 3 Years">1 - 3 Years</option>
                      <option value="3 - 5 Years">3 - 5 Years</option>
                      <option value="5+ Years">5+ Years Senior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Expected Salary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹25,000/mo or ₹1,500/day"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Top Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Leaflet, Driving License"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="hasBike"
                      checked={hasVehicle}
                      onChange={(e) => setHasVehicle(e.target.checked)}
                      className="w-4 h-4 rounded bg-white border-slate-300 text-emerald-600 focus:ring-0"
                    />
                    <label htmlFor="hasBike" className="text-[11px] text-slate-700 cursor-pointer flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Has Bike / Two Wheeler (Field/Delivery)</span>
                    </label>
                  </div>

                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    Immediate
                  </span>
                </div>
              </div>
            )}

            {/* Location Field with GPS detection & Indian Hubs */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <LocationPickerInput
                value={officeAddress}
                onChange={(addr, lat, lng) => {
                  setOfficeAddress(addr);
                  if (lat && lng) {
                    setLocationLat(lat);
                    setLocationLng(lng);
                  }
                }}
                theme={role === 'seeker' ? 'emerald' : 'indigo'}
                label={role === 'seeker' ? 'Preferred Job Location / City (स्थान / शहर)' : 'Company / Office Location (कंपनी का स्थान / शहर)'}
                placeholder="e.g. Bandra Kurla Complex (BKC), Mumbai or Koramangala, Bengaluru"
              />
            </div>

            {/* Create Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Set your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit & Back Action Buttons */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className="py-2.5 px-3 sm:px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 shadow-sm"
                title="Go back to Sign In"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
                <span>Back (लॉगिन)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 shadow-sm"
                title="Cancel & close modal"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button
                type="submit"
                disabled={loading || phoneCheck?.exists}
                className={`flex-1 py-2.5 px-3.5 sm:px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                  role === 'emp'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/20'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                }`}
              >
                <span className="truncate">
                  {loading
                    ? 'Creating...'
                    : role === 'emp'
                    ? 'Complete Employer Registration'
                    : 'Complete Seeker Registration'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
