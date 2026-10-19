import React, { useState } from 'react';
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
  Smartphone
} from 'lucide-react';
import { JobScoutLogo } from '../components/JobScoutLogo';
import { useAuth } from '../context/AuthContext';

export const Welcome = ({
  onNavigateToMap,
  onNavigateToJobs,
  onNavigateToNetwork,
  onNavigateToFeed,
  onNavigateToAnon,
  onOpenLogin,
  onOpenSignup,
  onOpenSwitchAccount,
  onSelectJob,
  onSelectSeeker,
  jobs = [],
  seekers = [],
  employers = []
}) => {
  const { user, logout, demoSwitch } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Hero Auth Card mode: 'login' | 'register'
  const [authCardTab, setAuthCardTab] = useState('login');
  const [signupRole, setSignupRole] = useState('seeker'); // 'seeker' | 'emp'
  const [quickPhone, setQuickPhone] = useState('');

  const toggleFaq = (idx) => {
    setActiveFaq(prev => prev === idx ? null : idx);
  };

  const featuredJobs = jobs.slice(0, 3);
  const featuredSeekers = seekers.slice(0, 3);

  const handleQuickAuthSubmit = (e) => {
    e.preventDefault();
    if (authCardTab === 'login') {
      onOpenLogin(quickPhone);
    } else {
      onOpenSignup(signupRole, quickPhone);
    }
  };

  const handle1TapDemo = async (roleType) => {
    if (demoSwitch) {
      await demoSwitch(roleType);
      onNavigateToFeed();
    } else {
      onOpenSwitchAccount();
    }
  };

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
      a: "Yes! JobScout comes with 14 pre-configured demo profiles including 7 Job Seekers (React, Python, DevOps, Cloud Architects) and 7 Top Employers (Nexus Cloud, Fintech Labs, etc.). Use the 'Switch Demo Account' button to experience both roles instantly."
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
      {/* STANDALONE WELCOME HEADER BAR */}
      {/* ========================================================== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
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

          {/* Center Quick Jump Links */}
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

          {/* Right Action Buttons */}
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
                  onClick={onNavigateToFeed}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  title="Browse without logging in"
                >
                  <span>Explore as Guest</span>
                </button>

                <button
                  onClick={() => onOpenLogin()}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Log In (लॉगिन)</span>
                </button>

                <button
                  onClick={() => onOpenSignup('seeker')}
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
      {/* 1. HERO WITH DIRECT LOGIN & SIGNUP CARD */}
      {/* ========================================================== */}
      <section className="relative pt-6 pb-16 md:pt-12 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero Narrative */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 shadow-xs text-xs font-bold text-indigo-700">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span>India's 1st Live Geospatial Hiring Platform</span>
              <span className="bg-white px-2 py-0.5 rounded-full text-[10px] text-slate-600 border border-indigo-100">
                GPS Verified
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Find Local Jobs & Hire Tech Talent on a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-500">
                Live Interactive Map
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              Skip the resume blackhole. Connect in real time with nearby tech employers and candidates through visual GPS discovery, 1-tap WebRTC audio/video speed calling, and verified digital CVs.
            </p>

            {/* Action Buttons for Quick Browsing */}
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
                onClick={onNavigateToFeed}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5"
              >
                <span>Guest Preview (बिना लॉगिन देखें)</span>
              </button>
            </div>

            {/* Quick Metrics Cards */}
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

          {/* Right Column: Integrated Auth & Quick Start Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent pointer-events-none rounded-bl-full" />
              
              {/* Card Header & Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {authCardTab === 'login' ? 'Welcome Back!' : 'Join JobScout Today'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {authCardTab === 'login' ? 'Sign in to access your dashboard' : 'Create your free candidate or recruiter profile'}
                  </p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setAuthCardTab('login')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authCardTab === 'login' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setAuthCardTab('register')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authCardTab === 'register' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Form / Quick Start Action */}
              <form onSubmit={handleQuickAuthSubmit} className="space-y-4">
                
                {/* Role Toggle when signing up */}
                {authCardTab === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      I am signing up as:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole('seeker')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          signupRole === 'seeker'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <UserCheck className="w-4 h-4 text-indigo-600" />
                        <span>Job Seeker</span>
                        <span className="text-[10px] font-normal text-slate-400">(#OpenToWork)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignupRole('emp')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          signupRole === 'emp'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>Employer</span>
                        <span className="text-[10px] font-normal text-slate-400">(#Hiring Talent)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Number Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Number (मोबाइल नंबर)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {authCardTab === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Continue to Log In (लॉगिन करें)</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Continue to Register as {signupRole === 'seeker' ? 'Candidate' : 'Employer'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* 1-Tap Instant Demo Access Section */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Instant Demo Login (No Setup Required)
                  </span>
                  <button
                    onClick={onOpenSwitchAccount}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    View All 14
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handle1TapDemo('seeker')}
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
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1">
                      <span>Nexus Cloud</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Tech Lead (Employer)</div>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. THE 4 PILLARS OF JOBSCOUT */}
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
      {/* 3. DUAL PERSPECTIVE: CANDIDATES VS RECRUITERS */}
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
                onClick={() => onOpenSignup('seeker')}
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
                onClick={() => onOpenSignup('emp')}
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
      {/* 4. LIVE FEATURED PREVIEWS */}
      {/* ========================================================== */}
      {(featuredJobs.length > 0 || featuredSeekers.length > 0) && (
        <section className="py-12 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  Live Platform Activity
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  Hot Tech Openings & Verified Talent
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
      {/* 5. FREQUENTLY ASKED QUESTIONS */}
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
      {/* 6. BOTTOM CALL TO ACTION */}
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
                onClick={() => onOpenSignup('seeker')}
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
                onClick={onOpenSwitchAccount}
                className="px-5 py-3 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/40 text-cyan-200 font-bold text-xs sm:text-sm border border-cyan-400/30 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Try 14 Demo Profiles</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* 7. STANDALONE FOOTER */}
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
            <button onClick={() => onOpenLogin()} className="hover:text-indigo-600 transition-colors">Log In</button>
            <button onClick={() => onOpenSignup('seeker')} className="hover:text-indigo-600 transition-colors">Sign Up</button>
          </div>
          <p className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} JobScout Platform. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
