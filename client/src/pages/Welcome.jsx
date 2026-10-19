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
  Lock
} from 'lucide-react';
import { JobScoutLogo } from '../components/JobScoutLogo';
import { useAuth } from '../context/AuthContext';

export const Welcome = ({
  onNavigateToMap,
  onNavigateToJobs,
  onNavigateToNetwork,
  onNavigateToFeed,
  onNavigateToAnon,
  onOpenAuth,
  onOpenSwitchAccount,
  onSelectJob,
  onSelectSeeker,
  jobs = [],
  seekers = [],
  employers = []
}) => {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (idx) => {
    setActiveFaq(prev => prev === idx ? null : idx);
  };

  // Preview featured jobs
  const featuredJobs = jobs.slice(0, 3);
  // Preview top candidates
  const featuredSeekers = seekers.slice(0, 3);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      
      {/* ========================================================== */}
      {/* 1. HERO SECTION */}
      {/* ========================================================== */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-tr from-indigo-500/10 via-cyan-500/10 to-teal-400/5 blur-3xl -z-10 pointer-events-none rounded-full" />
        
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Top Live Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/80 shadow-xs text-xs font-bold text-indigo-700 animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span>India's 1st Live Geospatial Job & Talent Discovery Platform</span>
            <span className="hidden sm:inline bg-white px-2 py-0.5 rounded-full text-[10px] text-slate-600 border border-indigo-100">
              Live GPS
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
            Find Local Jobs & Hire Talent on a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-500">
              Live Interactive Map
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Skip the endless resume blackhole. Connect in real time with nearby tech employers and candidates through visual GPS discovery, 1-tap WebRTC audio/video speed calling, and verified professional profiles.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onNavigateToMap}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center gap-2 active:scale-95"
            >
              <Compass className="w-4 h-4 text-cyan-300 animate-spin-slow" />
              <span>Explore Live Job Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToJobs}
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex items-center gap-2 active:scale-95"
            >
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Browse {jobs.length > 0 ? `${jobs.length}+ Openings` : 'Hot Jobs'}</span>
            </button>

            {onOpenSwitchAccount && (
              <button
                onClick={onOpenSwitchAccount}
                className="px-4 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs sm:text-sm border border-amber-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                title="Switch between 14 demo accounts"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Try Demo (14 Profiles)</span>
              </button>
            )}

            {!user && onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-slate-300" />
                <span>Log In / Register</span>
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
            <div className="p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-indigo-600">{jobs.length > 0 ? jobs.length : '35'}+</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Active Tech Jobs</div>
            </div>
            <div className="p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">{seekers.length > 0 ? `${seekers.length * 25}+` : '500+'}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Verified Talent</div>
            </div>
            <div className="p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-cyan-600">{employers.length > 0 ? employers.length : '18'}+</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Tech Companies</div>
            </div>
            <div className="p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-600">&lt; 60s</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Speed Call Connect</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. THE 4 PILLARS OF JOBSCOUT */}
      {/* ========================================================== */}
      <section className="py-12 bg-white border-y border-slate-200/80">
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
                onClick={onNavigateToJobs}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Find Jobs Near Me</span>
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
                onClick={onNavigateToMap}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Discover Candidates on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-500 font-semibold">Zero Commission Fees</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* 4. LIVE FEATURED SNEAK PEEK */}
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
                onClick={onNavigateToMap}
                className="px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-extrabold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Launch Live Map</span>
              </button>

              <button
                onClick={onNavigateToJobs}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Briefcase className="w-4 h-4 text-cyan-300" />
                <span>Explore All Jobs</span>
              </button>

              {onOpenSwitchAccount && (
                <button
                  onClick={onOpenSwitchAccount}
                  className="px-5 py-3 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/40 text-cyan-200 font-bold text-xs sm:text-sm border border-cyan-400/30 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Try 14 Demo Profiles</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================== */}
      {/* 7. FOOTER */}
      {/* ========================================================== */}
      <footer className="py-8 bg-white border-t border-slate-200/80 text-center text-xs text-slate-500">
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
            {onOpenAuth && <button onClick={onOpenAuth} className="hover:text-indigo-600 transition-colors">Sign In</button>}
          </div>
          <p className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} JobScout Platform. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
