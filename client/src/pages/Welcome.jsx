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
  Loader2
} from 'lucide-react';
import { JobScoutLogo } from '../components/JobScoutLogo';
import { useAuth } from '../context/AuthContext';
import { LocationPickerInput } from '../components/LocationPickerInput';

export const Welcome = ({
  onNavigateToMap,
  onNavigateToJobs,
  onNavigateToNetwork,
  onNavigateToFeed,
  onNavigateToAnon,
  onOpenSwitchAccount,
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
    demoSwitch, 
    loginWithPhonePassword, 
    loginWithPhoneOtp, 
    sendOtp, 
    registerWithPhone 
  } = useAuth();

  const [activeFaq, setActiveFaq] = useState(null);
  const authCardRef = useRef(null);

  // Unified Auth State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [role, setRole] = useState('seeker'); // 'seeker' | 'emp'
  
  // Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology & IT');
  const [locationAddress, setLocationAddress] = useState('Bandra Kurla Complex (BKC), Mumbai');
  const [locationLat, setLocationLat] = useState(19.0760);
  const [locationLng, setLocationLng] = useState(72.8777);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const toggleFaq = (idx) => {
    setActiveFaq(prev => prev === idx ? null : idx);
  };

  const scrollToAuth = (mode = 'login', chosenRole = 'seeker') => {
    setAuthMode(mode);
    if (chosenRole) setRole(chosenRole);
    setError('');
    setSuccessMsg('');
    if (authCardRef.current) {
      authCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = authCardRef.current.querySelector('input[type="tel"]');
      if (input) input.focus();
    }
  };

  // 1-Tap Demo Switch
  const handle1TapDemo = async (roleType) => {
    setLoading(true);
    setError('');
    try {
      if (demoSwitch) {
        await demoSwitch(roleType);
        onNavigateToFeed();
      } else if (onOpenSwitchAccount) {
        onOpenSwitchAccount();
      }
    } catch (err) {
      setError(err.message || 'Demo switch failed');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('कृपया एक मान्य 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendOtp(phone);
      setOtpSent(true);
      setSuccessMsg('OTP भेज दिया गया है! टेस्टिंग के लिए 123456 दर्ज करें।');
    } catch (err) {
      setError(err.message || 'OTP भेजने में विफल');
    } finally {
      setLoading(false);
    }
  };

  // Submit Unified Auth Form
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('कृपया एक मान्य 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'login') {
        // LOGIN FLOW
        if (loginMethod === 'otp') {
          if (!otp || otp.length < 6) {
            setError('कृपया 6-अंकों का OTP दर्ज करें (डिफ़ॉल्ट: 123456)');
            setLoading(false);
            return;
          }
          await loginWithPhoneOtp(cleanPhone, otp);
        } else {
          if (!password) {
            setError('कृपया अपना पासवर्ड दर्ज करें');
            setLoading(false);
            return;
          }
          await loginWithPhonePassword(cleanPhone, password);
        }
        // Success -> Enter Dashboard
        onNavigateToFeed();
      } else {
        // REGISTRATION FLOW
        if (!name.trim() || name.trim().length < 2) {
          setError('कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर)');
          setLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          setError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए');
          setLoading(false);
          return;
        }

        if (role === 'seeker') {
          if (!title.trim()) {
            setError('कृपया अपनी जॉब प्रोफाइल / पद दर्ज करें (उदा. React Developer)');
            setLoading(false);
            return;
          }
        } else {
          if (!companyName.trim()) {
            setError('कृपया अपनी कंपनी या संस्थान का नाम दर्ज करें');
            setLoading(false);
            return;
          }
        }

        if (!locationAddress.trim()) {
          setError('कृपया अपना शहर या इलाका (Location) चुनें या दर्ज करें');
          setLoading(false);
          return;
        }

        const payload = {
          phone: cleanPhone,
          otp: '123456',
          password,
          name: name.trim(),
          role,
          address: locationAddress.trim(),
          lat: locationLat || 19.0760,
          lng: locationLng || 72.8777,
          ...(role === 'emp' ? {
            companyName: companyName.trim(),
            industry: industry || 'Technology & IT',
            companySize: '1-10 Employees',
            hiringType: 'Full-time'
          } : {
            title: title.trim(),
            experience: '1 - 3 Years',
            skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : ['JavaScript', 'React'],
            expectedSalary: 'Competitive',
            availability: 'Immediate (Ready Today)'
          })
        };

        await registerWithPhone(payload);
        // Success -> Enter Dashboard
        onNavigateToFeed();
      }
    } catch (err) {
      setError(err.message || 'प्रमाणीकरण विफल। कृपया पुनः प्रयास करें।');
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
      q: "Can I try JobScout without creating a new account?",
      a: "Yes! JobScout comes with 14 pre-configured demo profiles including 7 Job Seekers (React, Python, DevOps, Cloud Architects) and 7 Top Employers (Nexus Cloud, Fintech Labs, etc.). Use the 1-Tap Demo buttons to experience both roles instantly."
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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
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
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
            <button onClick={onNavigateToMap} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>Live Map</span>
            </button>
            <button onClick={onNavigateToJobs} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Job Board ({jobs.length > 0 ? jobs.length : '35+'})</span>
            </button>
            <button onClick={onNavigateToNetwork} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Network</span>
            </button>
            <button onClick={onNavigateToAnon} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
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
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>Go to App Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onExploreAsGuest ? onExploreAsGuest('feed') : onNavigateToFeed()}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
                  title="Browse without logging in"
                >
                  <span>Explore as Guest</span>
                </button>

                <button
                  onClick={() => scrollToAuth('login')}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Log In (लॉगिन)</span>
                </button>

                <button
                  onClick={() => scrollToAuth('register', 'seeker')}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition-all flex items-center gap-1.5 active:scale-95"
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
                onClick={() => onExploreAsGuest ? onExploreAsGuest('feed') : onNavigateToFeed()}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Guest Preview (बिना लॉगिन देखें)</span>
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

          {/* Right Column: THE ONE UNIFIED AUTHENTICATION CARD */}
          <div className="lg:col-span-5" ref={authCardRef} id="auth-card">
            <div className="bg-white border-2 border-indigo-100 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent pointer-events-none rounded-bl-full" />
              
              {/* Tabs: Log In vs Sign Up */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      authMode === 'login'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In (लॉगिन)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      authMode === 'register'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up (नया खाता)</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alerts */}
              {error && (
                <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ============================================== */}
              {/* TAB 1: UNIFIED LOGIN FORM */}
              {/* ============================================== */}
              {authMode === 'login' && (
                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  
                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (मोबाइल नंबर) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        required
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Login Method Toggle: Password vs OTP */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-500 font-medium">लॉगिन विधि (Method):</span>
                    <button
                      type="button"
                      onClick={() => setLoginMethod(prev => prev === 'password' ? 'otp' : 'password')}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      {loginMethod === 'password' ? 'Log in with OTP instead' : 'Log in with Password instead'}
                    </button>
                  </div>

                  {/* Password Field */}
                  {loginMethod === 'password' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password (पासवर्ड) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-3 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Enter 6-Digit OTP <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          {otpSent ? 'Resend OTP' : 'Get OTP'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="123456"
                        required
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm tracking-widest font-mono font-bold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Log In to JobScout (लॉगिन करें)</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ============================================== */}
              {/* TAB 2: UNIFIED SIGN UP FORM */}
              {/* ============================================== */}
              {authMode === 'register' && (
                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  
                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Your Profile Type (खाता प्रकार) <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('seeker')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                          role === 'seeker'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <UserCheck className="w-4 h-4 text-indigo-600" />
                        <span>Job Seeker</span>
                        <span className="text-[9px] font-normal text-slate-500">(#OpenToWork)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('emp')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                          role === 'emp'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>Employer</span>
                        <span className="text-[9px] font-normal text-slate-500">(#Hiring Talent)</span>
                      </button>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name (आपका पूरा नाम) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="उदा. अमित कुमार / Priya Sharma"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (मोबाइल नंबर) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        required
                        className="w-full pl-12 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Password (पासवर्ड) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="कम से कम 6 अक्षर"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Role Specific Fields */}
                  {role === 'seeker' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Job Role / Profession (पद) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="उदा. Senior React Developer / UI Designer"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Company Name (कंपनी का नाम) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="उदा. TechPulse India / Apex Cloud Labs"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {/* Location Field with GPS detection & Indian Hubs */}
                  <LocationPickerInput
                    value={locationAddress}
                    onChange={(addr, lat, lng) => {
                      setLocationAddress(addr);
                      if (lat && lng) {
                        setLocationLat(lat);
                        setLocationLng(lng);
                      }
                    }}
                    theme={role === 'seeker' ? 'indigo' : 'emerald'}
                    label={role === 'seeker' ? 'Preferred Job Location / City (स्थान / शहर)' : 'Office / Hiring Location (कंपनी का स्थान / शहर)'}
                    placeholder="उदा. BKC, Mumbai या Koramangala, Bengaluru"
                  />

                  {/* Submit Register Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Create {role === 'seeker' ? 'Candidate' : 'Employer'} Account (रजिस्टर करें)</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Instant 1-Tap Demo Logins */}
              <div className="mt-4 pt-3.5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Instant 1-Click Demo Login:
                  </span>
                  {onOpenSwitchAccount && (
                    <button
                      type="button"
                      onClick={onOpenSwitchAccount}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      All 14 Demo Profiles →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handle1TapDemo('seeker')}
                    disabled={loading}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1">
                      <span>Rahul Sharma</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">React Dev (Seeker)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handle1TapDemo('emp')}
                    disabled={loading}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1">
                      <span>Nexus Cloud</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Tech Lead (Employer)</div>
                  </button>
                </div>

                {/* Continue as Guest Button */}
                <button
                  type="button"
                  onClick={() => onExploreAsGuest ? onExploreAsGuest('feed') : onNavigateToFeed()}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-98"
                >
                  <span>Continue without account: <strong>Explore as Guest →</strong></span>
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
              onClick={onNavigateToMap}
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
                onClick={() => onExploreAsGuest ? onExploreAsGuest('feed') : onNavigateToFeed()}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Explore as Guest</span>
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
