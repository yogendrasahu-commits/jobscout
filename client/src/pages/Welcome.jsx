import React, { useState, useRef } from 'react';
import { 
  MapPin, 
  Sparkles, 
  Video, 
  Phone, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Zap, 
  Compass, 
  Building2, 
  FileText, 
  MessageSquare, 
  Play, 
  Globe, 
  Award, 
  TrendingUp, 
  ChevronRight,
  UserCheck,
  Check,
  Flame,
  Search,
  Lock,
  LogIn,
  UserPlus,
  ArrowUpRight,
  LogOut,
  Smartphone,
  KeyRound,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Mail,
  Eye,
  EyeOff,
  Maximize2,
  ChevronDown,
  User,
  ArrowLeft
} from 'lucide-react';
import { JobScoutLogo } from '../components/JobScoutLogo';
import { useAuth } from '../context/AuthContext';

export const Welcome = ({
  onNavigateToMap,
  onNavigateToJobs,
  onNavigateToNetwork,
  onNavigateToFeed,
  onNavigateToConnect,
  onNavigateToAnon,
  onOpenLogin,
  onOpenSignup,
  onCompleteSignup,
  onSelectJob,
  onSelectSeeker,
  onExploreAsGuest,
  jobs = [],
  seekers = [],
  employers = []
}) => {
  const { 
    user, 
    logout, 
    login,
    loginWithPhonePassword, 
    loginWithPhoneOtp, 
    sendOtp, 
    registerWithPhone,
    register
  } = useAuth();

  const [activeFaq, setActiveFaq] = useState(null);
  const authCardRef = useRef(null);

  // Unified Auth State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'
  const [role, setRole] = useState('seeker'); // 'seeker' | 'emp'
  
  // Login Fields
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phonePasswordMode, setPhonePasswordMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Signup Fields (Both Phone and Email required)
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupOtp, setSignupOtp] = useState('');
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupSimulatedOtp, setSignupSimulatedOtp] = useState('');
  const [signupSendingOtp, setSignupSendingOtp] = useState(false);
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Real-time password validations matching uploaded design
  const reqLength = signupPassword.length >= 8;
  const reqNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(signupPassword);
  const reqUpperLower = /[a-z]/.test(signupPassword) && /[A-Z]/.test(signupPassword);

  const isSignupNameValid = signupName.trim().length >= 2;
  const cleanSignupPhoneDigits = signupPhone.replace(/[^0-9]/g, '').slice(-10);
  const isSignupPhoneValid = /^[6-9]\d{9}$/.test(cleanSignupPhoneDigits);
  const isSignupEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim());
  const isSignupConfirmValid = signupConfirmPassword.length > 0 && signupConfirmPassword === signupPassword;

  const toggleFaq = (idx) => {
    setActiveFaq(prev => prev === idx ? null : idx);
  };

  // Trigger Auth: Prefer opening the updated popup modal directly!
  const scrollToAuth = (mode = 'login', chosenRole = 'seeker') => {
    if (mode === 'login' && onOpenLogin) {
      onOpenLogin();
      return;
    }
    if (mode === 'register' && onOpenSignup) {
      onOpenSignup(chosenRole);
      return;
    }
    setAuthMode(mode);
    if (chosenRole) setRole(chosenRole);
    setError('');
    setSuccessMsg('');
    if (authCardRef.current) {
      authCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = authCardRef.current.querySelector('input');
      if (input) input.focus();
    }
  };

  // Phone Send OTP for Login
  const handlePhoneSendOtp = async () => {
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('कृपया एक मान्य 10-अंकों का मोबाइल नंबर दर्ज करें (6-9 से शुरू)');
      return;
    }
    setError('');
    setSendingOtp(true);
    try {
      const res = await sendOtp(cleanPhone, 'login');
      setOtpSent(true);
      const code = res?.otp || '123456';
      setSimulatedOtp(code);
      setOtp(code);
      setSuccessMsg(`OTP भेज दिया गया है! (+91 ${cleanPhone}) डेमो कोड: ${code}`);
    } catch (err) {
      setError(err.message || 'OTP भेजने में विफल');
    } finally {
      setSendingOtp(false);
    }
  };

  // Phone + OTP Login
  const handlePhoneOtpLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('कृपया एक मान्य 10-अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    if (!otp || otp.trim().length < 4) {
      setError('कृपया 6-अंकों का OTP कोड दर्ज करें');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginWithPhoneOtp(cleanPhone, otp.trim());
      if (res?.isNewUser) {
        setSuccessMsg('मोबाइल सत्यापित! कृपया अपना खाता पूर्ण करें।');
        setSignupPhone(cleanPhone);
        setAuthMode('register');
        setSignupOtp(otp);
        return;
      }
      setSuccessMsg(`स्वागत है, ${res.name || 'User'}!`);
      if (res.role === 'admin') {
        window.location.hash = '#/admin';
      } else {
        onNavigateToFeed();
      }
    } catch (err) {
      setError(err.message || 'OTP सत्यापन विफल। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  // Phone + Password Login
  const handlePhonePasswordLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('कृपया एक मान्य 10-अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    if (!password) {
      setError('कृपया अपना पासवर्ड दर्ज करें');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginWithPhonePassword(cleanPhone, password);
      setSuccessMsg(`स्वागत है, ${res.name || 'User'}!`);
      if (res.role === 'admin') {
        window.location.hash = '#/admin';
      } else {
        onNavigateToFeed();
      }
    } catch (err) {
      setError(err.message || 'अमान्य मोबाइल या पासवर्ड');
    } finally {
      setLoading(false);
    }
  };

  // Email + Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('कृपया एक मान्य ईमेल पता दर्ज करें');
      return;
    }
    if (!password) {
      setError('कृपया अपना पासवर्ड दर्ज करें');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(cleanEmail, password);
      setSuccessMsg(`स्वागत है, ${res.name || 'User'}!`);
      if (res.role === 'admin') {
        window.location.hash = '#/admin';
      } else {
        onNavigateToFeed();
      }
    } catch (err) {
      setError(err.message || 'अमान्य ईमेल या पासवर्ड');
    } finally {
      setLoading(false);
    }
  };

  // Fast 1-Click Demo Login
  const handleQuickDemo = async (demoId, demoPass) => {
    setError('');
    setLoading(true);
    try {
      const res = await login(demoId, demoPass);
      setSuccessMsg(`लॉगिन सफल: ${res.name}`);
      if (res.role === 'admin') {
        window.location.hash = '#/admin';
      } else {
        onNavigateToFeed();
      }
    } catch (err) {
      setError(err.message || 'डेमो लॉगिन विफल');
    } finally {
      setLoading(false);
    }
  };

  // Signup Send OTP
  const handleSignupSendOtp = async () => {
    const cleanPhone = signupPhone.replace(/[^0-9]/g, '').slice(-10);
    const cleanEmail = signupEmail.trim().toLowerCase();

    const target = cleanPhone && /^[6-9]\d{9}$/.test(cleanPhone)
      ? cleanPhone 
      : (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ? cleanEmail : '');

    if (!target) {
      setError('Please enter your 10-digit mobile number to receive OTP');
      return;
    }

    setError('');
    setSignupSendingOtp(true);
    try {
      const res = await sendOtp(target, 'register');
      setSignupOtpSent(true);
      const code = res?.otp || '123456';
      setSignupSimulatedOtp(code);
      setSignupOtp(code);
      const targetLabel = target.includes('@') ? target : `+91 ${target}`;
      setSuccessMsg(`OTP sent to ${targetLabel} (Passcode: ${code})`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setSignupSendingOtp(false);
    }
  };

  // Sign Up Handler (Requires Name, Mobile Number, Email, OTP, and Password)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = signupPhone.replace(/[^0-9]/g, '').slice(-10);
    const cleanEmail = signupEmail.trim().toLowerCase();

    if (!signupName.trim() || signupName.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters)');
      return;
    }
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!signupOtp || signupOtp.length < 4) {
      setError('Please enter the 6-digit OTP passcode received');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (signupConfirmPassword && signupConfirmPassword !== signupPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = {
        name: signupName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        otp: signupOtp.trim(),
        password: signupPassword,
        role
      };

      const newUser = await register(payload);
      setSuccessMsg(`Account created! Let's complete your profile.`);
      if (onCompleteSignup) {
        onCompleteSignup(newUser);
      } else {
        onNavigateToFeed();
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please verify your OTP and details.');
    } finally {
      setLoading(false);
    }
  };

  const featuredJobs = jobs.slice(0, 3);

  const faqs = [
    {
      q: "How does the live interactive job map work?",
      a: "JobScout uses geospatial GPS mapping to pinpoint job openings and verified candidates across India. You can pan, zoom, click on any company hub or candidate beacon, view required skills and salary, and apply or connect with a single tap."
    },
    {
      q: "What is 1-Tap Speed Connect (Video & Voice calling)?",
      a: "Speed Connect is built on WebRTC peer-to-peer technology. Recruiters and job candidates can start instant high-definition video or voice screening calls directly inside the browser without downloading extra software or exchanging personal phone numbers."
    },
    {
      q: "Can I explore JobScout without creating a new account?",
      a: "Yes! You can explore the live Feed, Job Board, Employers, and Candidate profiles freely in Guest Mode without logging in. You only need to sign in when you want to apply or post jobs."
    },
    {
      q: "How does the professional resume and offer letter generator work?",
      a: "Every registered job seeker gets an auto-formatted, ATS-ready digital CV (बायोडाटा) that can be previewed and printed. Employers can also generate and email official appointment offer letters directly to candidates with joined status tracking."
    },
    {
      q: "Is my personal data and email safe on JobScout?",
      a: "Yes. All accounts require phone OTP verification, and emails are securely stored. You can update your profile details anytime via Edit Profile, and participate in anonymous tech discussions without revealing your identity."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600/20 selection:text-indigo-900">
      
      {/* ========================================================== */}
      {/* 1. STANDALONE HEADER */}
      {/* ========================================================== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="drop-shadow-[0_2px_10px_rgba(79,70,229,0.2)]">
              <JobScoutLogo size={36} />
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 flex items-center">
                Job<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-500 ml-0.5">Scout</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 ml-1 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
              </span>
              <span className="text-[10px] text-slate-400 font-semibold hidden sm:block -mt-0.5">
                Real-time Map & Speed Connect
              </span>
            </div>
          </div>

          {/* Center Quick Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 backdrop-blur-md p-1 rounded-full border border-slate-200/60 text-xs font-semibold text-slate-600 flex-nowrap flex-shrink-0">
            <button onClick={onNavigateToFeed} className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white/60 whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Feed</span>
            </button>
            <button onClick={onNavigateToNetwork} className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white/60 whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Emp & Seeker</span>
            </button>
            <button onClick={onNavigateToMap} className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white/60 whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>Live Map</span>
            </button>
            <button onClick={onNavigateToJobs} className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white/60 whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Jobs ({jobs.length > 0 ? jobs.length : '35+'})</span>
            </button>
            <button onClick={onNavigateToConnect} className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white/60 whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              <span>Speed Connect</span>
            </button>
            <button onClick={onNavigateToAnon} className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white/60 whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Anon Salon</span>
            </button>
          </nav>

          {/* Right Action Header Buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateToFeed}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>Go to App Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenLogin ? onOpenLogin() : (window.location.hash = '#/admin')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/80 transition-all active:scale-95 shadow-xs"
                  title="Master Admin Portal"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Admin Portal (एडमिन)</span>
                </button>

                <button
                  onClick={() => onOpenLogin ? onOpenLogin() : scrollToAuth('login')}
                  className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Log In (लॉगिन)</span>
                </button>

                <button
                  onClick={() => onOpenSignup ? onOpenSignup('seeker') : scrollToAuth('register', 'seeker')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up Free</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================== */}
      {/* 2. HERO: VALUE NARRATIVE (LEFT) + UNIFIED AUTH CARD (RIGHT) */}
      {/* ========================================================== */}
      <section className="relative pt-6 pb-16 md:pt-12 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Narrative */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 shadow-xs text-xs font-bold text-indigo-700">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span>India's 1st Live Geospatial Hiring Platform</span>
              <span className="bg-white px-2 py-0.5 rounded-full text-[10px] text-slate-600 border border-indigo-100">
                GPS Verified
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Find Local Jobs & Hire Tech Talent on a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-500">
                Live Interactive Map
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              Skip the resume blackhole. Connect in real time with nearby tech employers and candidates through visual GPS discovery, 1-tap WebRTC audio/video speed calling, and verified digital CVs.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onNavigateToMap}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95"
              >
                <Compass className="w-4 h-4 text-cyan-200" />
                <span>Explore Live Job Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateToJobs}
                className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-sm transition-all flex items-center gap-2 active:scale-95"
              >
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Browse {jobs.length > 0 ? `${jobs.length}+ Jobs` : 'Hot Jobs'}</span>
              </button>

              <button
                onClick={() => onOpenLogin ? onOpenLogin() : null}
                className="px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm border border-rose-200 transition-all flex items-center gap-2 active:scale-95"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Admin Access (एडमिन लॉगिन)</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-indigo-600">{jobs.length > 0 ? jobs.length : '35'}+</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Tech Jobs</div>
              </div>
              <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-emerald-600">{seekers.length > 0 ? `${seekers.length * 25}+` : '500+'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Talent</div>
              </div>
              <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-cyan-600">{employers.length > 0 ? employers.length : '18'}+</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Companies & Hubs</div>
              </div>
              <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-black text-amber-600">&lt; 60s</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Screening Call</div>
              </div>
            </div>

          </div>

          {/* Right Column: MODERN AUTHENTICATION CARD (Matches Uploaded Design) */}
          <div className="lg:col-span-5" ref={authCardRef} id="auth-card">
            <div className="bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.18)] border border-slate-100 relative overflow-hidden text-slate-800">
              
              {/* Top Navigation Row: Circular Back/Reset + Already Member Link */}
              <div className="flex items-center justify-between pb-2">
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccessMsg(''); }}
                  className="w-9 h-9 rounded-full border border-slate-200 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition shadow-xs active:scale-95"
                  title="Reset"
                >
                  <ArrowLeft size={16} />
                </button>

                <div className="text-xs text-slate-500 font-medium">
                  {authMode === 'register' ? (
                    <>
                      Already member?{' '}
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
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
                        onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
                        className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition hover:underline"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Header Title with Playful Curved Doodle Arrow */}
              <div className="mt-3 mb-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {authMode === 'register' ? 'Sign Up' : 'Sign In'}
                  </h1>
                  {/* Playful curved doodle arrow pointing down towards input fields */}
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
                  {authMode === 'register' 
                    ? 'Secure Your Communications with JobScout' 
                    : 'Secure Your Career & Hiring with JobScout'}
                </p>
              </div>

              {/* Feedback Alerts */}
              {error && (
                <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: LOGIN FORM */}
              {authMode === 'login' && (
                <div className="space-y-3.5">
                  {/* Method Switcher Pills */}
                  <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full w-fit">
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('phone'); setError(''); setSuccessMsg(''); }}
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
                      onClick={() => { setLoginMethod('email'); setError(''); setSuccessMsg(''); }}
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

                  {loginMethod === 'phone' && (
                    <form onSubmit={phonePasswordMode ? handlePhonePasswordLogin : handlePhoneOtpLogin} className="space-y-3.5">
                      <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">+91</span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="9876543210"
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

                  {loginMethod === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-3.5">
                      <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                        <div className="flex items-center gap-3">
                          <Mail size={18} className="text-slate-400 shrink-0" />
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="admin@jobscout.io or user@example.com"
                            required
                            className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                          />
                        </div>
                      </div>

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

                  {/* Quick 1-Click Fast Login Shortcuts */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      ⚡ 1-Click Demo Login
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickDemo('9123456789', 'password123')}
                        disabled={loading}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-center gap-1.5"
                      >
                        <User size={14} className="text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-slate-700 block truncate">Seeker</span>
                          <span className="text-[9px] text-slate-400 block truncate">Rahul S.</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDemo('9876543210', 'password123')}
                        disabled={loading}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-center gap-1.5"
                      >
                        <Building2 size={14} className="text-indigo-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-slate-700 block truncate">Employer</span>
                          <span className="text-[9px] text-slate-400 block truncate">TechPulse</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDemo('admin@jobscout.io', 'admin123')}
                        disabled={loading}
                        className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition flex items-center gap-1.5"
                      >
                        <ShieldCheck size={14} className="text-rose-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-rose-700 block truncate">Admin</span>
                          <span className="text-[9px] text-rose-400 block truncate">Portal</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SIGN UP FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  {/* Role Toggle Pill */}
                  <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full w-fit">
                    <button
                      type="button"
                      onClick={() => setRole('seeker')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
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
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                        role === 'emp'
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Building2 size={12} />
                      <span>Employer</span>
                    </button>
                  </div>

                  {/* 1. Full Name Underline Field */}
                  <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Daniel Ahmadi"
                        required
                        className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                      />
                      {isSignupNameValid && (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* 2. Mobile Number Underline Field */}
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
                          setSignupOtpSent(false);
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
                        onClick={handleSignupSendOtp}
                        disabled={signupSendingOtp || signupPhone.length < 10}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-bold rounded-full transition whitespace-nowrap disabled:opacity-50 shrink-0"
                      >
                        {signupSendingOtp ? 'Sending...' : signupOtpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {/* 3. Email Address Underline Field */}
                  <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-slate-400 shrink-0" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="11Danielahmadi@gmail.com"
                        required
                        className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                      />
                      {isSignupEmailValid && (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* 4. OTP Passcode Underline Field */}
                  <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                    <div className="flex items-center gap-3">
                      <KeyRound size={18} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        maxLength={6}
                        value={signupOtp}
                        onChange={(e) => setSignupOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="6-Digit OTP Passcode"
                        required
                        className="w-full bg-transparent text-sm font-mono tracking-widest text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                      />
                      {signupOtp.length === 6 && (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      )}
                      {signupSimulatedOtp && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          Code: {signupSimulatedOtp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5. Password Underline Field */}
                  <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-slate-400 shrink-0" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2 tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="text-slate-400 hover:text-slate-600 transition"
                      >
                        {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Checklist (Exactly as shown in reference image!) */}
                  <div className="space-y-1 text-xs pt-1 pb-1">
                    <div className={`flex items-center gap-2 transition-colors ${reqLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                      {reqLength ? (
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5 shrink-0" />
                      )}
                      <span>Least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 transition-colors ${reqNumberOrSymbol ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                      {reqNumberOrSymbol ? (
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5 shrink-0" />
                      )}
                      <span>Least one number (0-9) or a symbol</span>
                    </div>
                    <div className={`flex items-center gap-2 transition-colors ${reqUpperLower ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                      {reqUpperLower ? (
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5 shrink-0" />
                      )}
                      <span>Lowercase (a-z) and uppercase (A-Z)</span>
                    </div>
                  </div>

                  {/* 6. Re-Type Password Underline Field */}
                  <div className="relative border-b border-slate-200 focus-within:border-indigo-600 transition-colors pb-0.5">
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-slate-400 shrink-0" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Re-Type Password"
                        required
                        className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-2 tracking-wider"
                      />
                      {isSignupConfirmValid && (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading || !signupPhone.trim() || !signupEmail.trim() || !signupOtp.trim() || !signupPassword}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-bold rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <span>{loading ? 'Creating...' : 'Sign Up'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Language Selector Pill */}
              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold cursor-pointer hover:text-slate-800 transition select-none">
                  <span className="text-sm">🇬🇧</span>
                  <span>ENG</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>

                <button
                  type="button"
                  onClick={() => onOpenLogin ? onOpenLogin() : null}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Maximize2 size={12} />
                  <span>Open Full Screen View</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* 3. THE 4 PILLARS */}
      {/* ========================================================== */}
      <section className="py-14 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              Modern Hiring Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Everything You Need to Connect & Get Hired Faster
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Built specifically for modern developers, engineering leaders, and agile tech recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Pillar 1 */}
            <div 
              onClick={onNavigateToMap}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                Live Geospatial Job Map
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Explore real-time visual job pins across BKC Mumbai, Koramangala Bengaluru, Cyber City Gurugram, and more. Filter by distance radius and apply immediately.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:gap-2 transition-all">
                <span>View Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div 
              onClick={onNavigateToConnect || onNavigateToMap}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                1-Tap WebRTC Speed Connect
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Connect directly between hiring leads and candidates in seconds with crystal-clear in-browser video and voice calls. No external links or phone numbers needed.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:gap-2 transition-all">
                <span>Try Live Calling</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div 
              onClick={onNavigateToFeed}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-cyan-700 transition-colors">
                Professional Feed & Network
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Share updates, showcase GitHub projects with #OpenToWork, like and comment on community announcements, and build direct 1-to-1 connections.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-cyan-700 group-hover:gap-2 transition-all">
                <span>Open Feed</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 4 */}
            <div 
              onClick={onNavigateToAnon}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                Anonymous Tech Salons
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Discuss compensation packages, workplace culture, and interview questions with full cryptographic pseudonymity and zero risk of career fallout.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:gap-2 transition-all">
                <span>Join Discussion</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* 4. DUAL PERSPECTIVE */}
      {/* ========================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* For Candidates */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 border border-indigo-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs mb-4">
                <UserCheck className="w-3.5 h-3.5" />
                <span>FOR JOB SEEKERS (#OPENTOWORK)</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Land High-Paying Roles Without Waiting for Weeks
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Stand out with an interactive beacon on the map and connect with tech companies looking for talent in your exact neighborhood.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Interactive Map Beacon showing your verified skills and availability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Instant 1-Click Professional ATS-ready CV generator & print ready</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Receive direct audio & video calls from verified founders and HR leads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Real-time tracking of submitted applications and formal offer letters</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-indigo-100 flex items-center justify-between">
              <button
                onClick={() => scrollToAuth('register', 'seeker')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Register as Candidate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-500 font-semibold">100% Free for Candidates</span>
            </div>
          </div>

          {/* For Employers */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 border border-emerald-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs mb-4">
                <Building2 className="w-3.5 h-3.5" />
                <span>FOR EMPLOYERS & HIRING MANAGERS</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Pin Jobs on the Map & Hire Top Talent in Record Time
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Eliminate slow recruiter back-and-forth. Locate active candidates nearby, start a video screen on the spot, and issue instant formal offers.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pin new job postings directly to coordinates with live radar discovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>1-Tap direct candidate calling without booking calendars or scheduling links</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Issue formal offer letters with compensation, join date, & digital stamp</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Real SMTP email delivery for candidates to receive offer letters in Gmail</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-100 flex items-center justify-between">
              <button
                onClick={() => scrollToAuth('register', 'emp')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Register as Employer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-500 font-semibold">Zero Commission Fees</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* 5. LIVE PREVIEW */}
      {/* ========================================================== */}
      {featuredJobs.length > 0 && (
        <section className="py-12 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  Live Platform Activity
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  Hot Tech Openings Ready for Spot Calling
                </h2>
              </div>
              <button
                onClick={onNavigateToJobs}
                className="self-start sm:self-auto text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View all {jobs.length} jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredJobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => onSelectJob ? onSelectJob(job) : onNavigateToJobs()}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {job.type || 'Full-time'}
                      </span>
                      <span className="text-xs font-black text-indigo-600">{job.salary || 'Competitive'}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{job.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.company}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{job.location || 'India'}</span>
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>View Opening Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ========================================================== */}
      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeFaq === idx ? 'rotate-90 text-indigo-600' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 7. BOTTOM CTA */}
      {/* ========================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 shadow-2xl overflow-hidden text-center">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 font-bold text-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Started in 30 Seconds</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Experience the Future of Job Discovery?
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Join hundreds of engineers, architects, and hiring leaders discovering nearby opportunities in real time.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => scrollToAuth('register', 'seeker')}
                className="px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-extrabold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Free Account</span>
              </button>

              <button
                onClick={onNavigateToMap}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Compass className="w-4 h-4 text-cyan-300" />
                <span>Launch Live Map</span>
              </button>

              <button
                onClick={() => scrollToAuth('login')}
                className="px-5 py-3 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/40 text-cyan-200 font-bold text-xs sm:text-sm border border-cyan-400/30 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Log In Directly</span>
              </button>

              <button
                onClick={() => onOpenLogin ? onOpenLogin() : null}
                className="px-5 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-xs sm:text-sm border border-rose-400/30 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* 8. STANDALONE FOOTER */}
      {/* ========================================================== */}
      <footer className="py-8 bg-white border-t border-slate-200/80 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <JobScoutLogo size={24} />
            <span className="font-extrabold text-sm text-slate-800">JobScout</span>
            <span className="text-slate-400">• Real-time Map & Speed Connect</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-medium text-xs">
            <button onClick={onNavigateToMap} className="hover:text-indigo-600 transition-colors">Map</button>
            <button onClick={onNavigateToJobs} className="hover:text-indigo-600 transition-colors">Jobs</button>
            <button onClick={onNavigateToFeed} className="hover:text-indigo-600 transition-colors">Feed</button>
            <button onClick={onNavigateToAnon} className="hover:text-indigo-600 transition-colors">Anon Salon</button>
            <button onClick={() => scrollToAuth('login')} className="hover:text-indigo-600 transition-colors">Log In</button>
            <button onClick={() => scrollToAuth('register', 'seeker')} className="hover:text-indigo-600 transition-colors">Sign Up</button>
          </div>
          <p className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} JobScout Platform. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
