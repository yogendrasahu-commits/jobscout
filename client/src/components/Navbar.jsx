import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Radar, 
  Briefcase, 
  MapPin, 
  MessageSquare, 
  FileText, 
  PlusCircle, 
  LogOut, 
  User, 
  Radio, 
  ChevronDown, 
  Phone, 
  Sparkles, 
  Home, 
  Users, 
  ExternalLink, 
  Bell, 
  Search, 
  Menu, 
  X, 
  Flame,
  Check,
  Building2,
  ArrowRight,
  Mail,
  Edit3,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { JobScoutLogo } from './JobScoutLogo';
import { UpdateEmailModal } from './UpdateEmailModal';
import { EmailSenderConfigModal } from './EmailSenderConfigModal';

export const Navbar = ({ 
  currentTab, 
  setCurrentTab, 
  onOpenPostJob, 
  onOpenAuth, 
  onOpenSwitchAccount, 
  onOpenProfile,
  jobs = [],
  seekers = [],
  employers = [],
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
  onSelectJob,
  onSelectSeeker,
  jobsCount = 0,
  seekersCount = 0,
  employersCount = 0
}) => {
  const { user, isEmployer, isSeeker, demoSwitch, logout } = useAuth();
  const { setActiveChatUser } = useSocket();

  // Dropdown & Drawer states
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSenderConfigOpen, setIsSenderConfigOpen] = useState(false);
  
  // Search state (synced with App.jsx if provided)
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalSetSearchQuery || setInternalSearchQuery;

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'WebRTC Speed Call Ready',
      desc: 'Instant audio and video calling is live in your radar.',
      time: 'Just now',
      read: false,
      tab: 'connect',
      icon: 'video'
    },
    {
      id: 'notif_2',
      title: 'New Hot Job Posted in BKC',
      desc: 'TechPulse posted "Senior React Lead" within 5 km.',
      time: '12m ago',
      read: false,
      tab: 'jobs',
      icon: 'job'
    },
    {
      id: 'notif_3',
      title: 'New Connection Request',
      desc: 'Rahul Sharma sent you an invitation to connect.',
      time: '45m ago',
      read: false,
      tab: 'network',
      icon: 'user'
    },
    {
      id: 'notif_4',
      title: 'Radar Distance Calibrated',
      desc: 'GPS lock updated to Mumbai BKC tech corridor.',
      time: '2h ago',
      read: true,
      tab: 'map',
      icon: 'radar'
    }
  ]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Real-time search matches across jobs, seekers, and employers
  const cleanQ = (searchQuery || '').trim().toLowerCase();
  
  const matchingJobs = cleanQ
    ? jobs.filter(j => 
        j.title?.toLowerCase().includes(cleanQ) || 
        j.company?.toLowerCase().includes(cleanQ) || 
        j.address?.toLowerCase().includes(cleanQ) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(cleanQ)))
      ).slice(0, 4)
    : [];

  const matchingSeekers = cleanQ
    ? seekers.filter(s =>
        s.name?.toLowerCase().includes(cleanQ) ||
        s.title?.toLowerCase().includes(cleanQ) ||
        (s.skills && s.skills.some(sk => sk.toLowerCase().includes(cleanQ)))
      ).slice(0, 3)
    : [];

  const matchingEmployers = cleanQ
    ? employers.filter(e =>
        e.name?.toLowerCase().includes(cleanQ) ||
        e.companyName?.toLowerCase().includes(cleanQ) ||
        e.industry?.toLowerCase().includes(cleanQ)
      ).slice(0, 3)
    : [];

  const totalMatchesCount = matchingJobs.length + matchingSeekers.length + matchingEmployers.length;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile hamburger drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileDrawerOpen]);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setSearchFocused(false);
        setMobileSearchOpen(false);
        setProfileMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mark all notifications as read
  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item) => {
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.tab) {
      setCurrentTab(item.tab);
    }
    setNotificationsOpen(false);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setCurrentTab('jobs');
    setSearchFocused(false);
    setMobileSearchOpen(false);
    setMobileDrawerOpen(false);
  };

  const handleSelectJobResult = (job) => {
    if (onSelectJob) onSelectJob(job);
    setCurrentTab('jobs');
    setSearchFocused(false);
    setMobileSearchOpen(false);
    setMobileDrawerOpen(false);
  };

  const handleSelectProfileResult = (person) => {
    if (onOpenProfile) onOpenProfile(person);
    setSearchFocused(false);
    setMobileSearchOpen(false);
    setMobileDrawerOpen(false);
  };

  return (
    <header className="bg-[#07090e]/85 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-[800] select-none shadow-[0_4px_30px_rgba(0,0,0,0.6)] w-full max-w-full">
      <div className="w-full max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between h-[56px] sm:h-[60px] md:h-[68px] gap-1 sm:gap-4">
          
          {/* ========================================================== */}
          {/* 1. BRAND LOGO & LOCATION PILL & SEARCH BAR */}
          {/* ========================================================== */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-2.5 xl:gap-3 justify-start flex-shrink-0">
            {/* Logo with Hover Name Tooltip */}
            <div 
              className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group relative flex-shrink-0" 
              onClick={() => setCurrentTab('feed')}
              title="JobScout - Live Radar & Speed Connect"
            >
              <div className="relative group-hover:scale-105 transition-all duration-300 flex-shrink-0 drop-shadow-[0_0_20px_rgba(56,189,248,0.45)]">
                <JobScoutLogo size={38} className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="leading-none">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black text-base sm:text-lg lg:text-xl tracking-tight text-white flex items-center">
                    Job<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 ml-0.5">Scout</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1 shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse" />
                  </span>
                  <span className="hidden xl:inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
                    RADAR
                  </span>
                </div>
                <div className="hidden 2xl:flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="truncate max-w-[120px] font-medium text-slate-300">
                    {user?.address ? user.address.split(',')[0] : 'India • GPS Radar'}
                  </span>
                </div>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                JobScout Home
              </div>
            </div>

            {/* Quick Live Search Bar (Desktop / Laptop >= md) */}
            <div className="hidden md:block relative flex-shrink-0" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative group">
                <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-cyan-400 absolute left-3 top-2.5 transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  className="w-24 md:w-28 lg:w-36 xl:w-48 2xl:w-60 bg-[#0c121e]/80 border border-white/[0.08] hover:border-white/[0.16] rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/90 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  title="Search Jobs, Companies, Candidates"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchFocused(false);
                    }}
                    className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-white rounded-full"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Search Bar Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  Search Jobs & People
                </div>
              </form>

              {/* Live Search Suggestions & Results Dropdown */}
              {searchFocused && (
                <div className="absolute left-0 mt-2 w-80 lg:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[460px] overflow-y-auto">
                  
                  {/* When no query is entered: Trending Suggestions */}
                  {!cleanQ ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                        Trending Searches
                      </div>
                      <div 
                        onClick={() => { setSearchQuery('React Developer'); handleSearchSubmit(); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        <span>React Developer Jobs ({jobsCount})</span>
                      </div>
                      <div 
                        onClick={() => { setSearchQuery('India'); setCurrentTab('map'); setSearchFocused(false); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Explore India Live Radar Map</span>
                      </div>
                      <div 
                        onClick={() => { setSearchQuery('Engineer'); setCurrentTab('network'); setSearchFocused(false); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Find Software Engineers ({seekersCount + employersCount})</span>
                      </div>
                      <div 
                        onClick={() => { setCurrentTab('anon'); setSearchFocused(false); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                      >
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>Anon Talk Salary & Culture Discussions</span>
                      </div>
                    </div>
                  ) : (
                    /* Live Matching Results */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 border-b border-slate-800 pb-1.5">
                        <span>Search Results for "{searchQuery}"</span>
                        <span className="text-indigo-400">{totalMatchesCount} matches</span>
                      </div>

                      {/* Matching Jobs Section */}
                      {matchingJobs.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                            Jobs ({matchingJobs.length})
                          </span>
                          <div className="space-y-1">
                            {matchingJobs.map(j => (
                              <div
                                key={j.id}
                                onClick={() => handleSelectJobResult(j)}
                                className="p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer border border-transparent hover:border-slate-700 transition-all flex items-start justify-between gap-2"
                              >
                                <div className="truncate">
                                  <div className="text-xs font-bold text-white truncate">{j.title}</div>
                                  <div className="text-[11px] text-slate-400 truncate">{j.company} • {j.address}</div>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                                  {j.salary}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Candidates Section */}
                      {matchingSeekers.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                            Job Seekers ({matchingSeekers.length})
                          </span>
                          <div className="space-y-1">
                            {matchingSeekers.map(s => (
                              <div
                                key={s.id}
                                onClick={() => handleSelectProfileResult(s)}
                                className="p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer border border-transparent hover:border-slate-700 transition-all flex items-center gap-2"
                              >
                                <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                                <div className="truncate flex-1">
                                  <div className="text-xs font-bold text-white truncate">{s.name}</div>
                                  <div className="text-[11px] text-slate-400 truncate">{s.title || 'Candidate'}</div>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                                  Seeker
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Employers Section */}
                      {matchingEmployers.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                            Companies & Employers ({matchingEmployers.length})
                          </span>
                          <div className="space-y-1">
                            {matchingEmployers.map(e => (
                              <div
                                key={e.id}
                                onClick={() => handleSelectProfileResult(e)}
                                className="p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer border border-transparent hover:border-slate-700 transition-all flex items-center gap-2"
                              >
                                <Building2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div className="truncate flex-1">
                                  <div className="text-xs font-bold text-white truncate">{e.companyName || e.name}</div>
                                  <div className="text-[11px] text-slate-400 truncate">{e.industry || 'Hiring Company'}</div>
                                </div>
                                <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded">
                                  Employer
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {totalMatchesCount === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No direct matches found. Press Enter to search on Job Board.
                        </div>
                      )}

                      {/* Bottom view all in Job Board button */}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Filter Job Board for "{searchQuery}"</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

          {/* ========================================================== */}
          {/* 2. LAPTOP & DESKTOP NAVIGATION TABS (Centered in Header & Sized Up) */}
          {/* ========================================================== */}
          <div className="hidden md:flex justify-center items-center">
            <nav className="flex items-center gap-1 lg:gap-1.5 bg-[#0b101d]/90 p-1 lg:p-1.5 rounded-2xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
              
              {/* 1. Feed (Home) */}
              <button
                onClick={() => setCurrentTab('feed')}
                className={`group relative flex items-center gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-3.5 xl:px-4 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all ${
                  currentTab === 'feed'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/35 ring-1 ring-white/20 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Feed (Home)"
              >
                <Home className="w-4 h-4 lg:w-[18px] lg:h-[18px] flex-shrink-0" />
                <span>Feed</span>

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  Feed (Home)
                </div>
              </button>

              {/* 2. My Network */}
              <button
                onClick={() => setCurrentTab('network')}
                className={`group relative flex items-center gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-3.5 xl:px-4 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all ${
                  currentTab === 'network'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/35 ring-1 ring-white/20 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="My Professional Network"
              >
                <Users className="w-4 h-4 lg:w-[18px] lg:h-[18px] flex-shrink-0" />
                <span>Network</span>

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  My Network ({seekersCount + employersCount})
                </div>
              </button>

              {/* 3. Live Map Radar */}
              <button
                onClick={() => setCurrentTab('map')}
                className={`group relative flex items-center gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-3.5 xl:px-4 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all ${
                  currentTab === 'map'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/35 ring-1 ring-white/20 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Live Radar Map"
              >
                <MapPin className="w-4 h-4 lg:w-[18px] lg:h-[18px] text-cyan-300 flex-shrink-0" />
                <span>Radar</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-0.5 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  Live Radar Map
                </div>
              </button>

              {/* 4. Jobs & Applied */}
              <button
                onClick={() => setCurrentTab('jobs')}
                className={`group relative flex items-center gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-3.5 xl:px-4 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all ${
                  currentTab === 'jobs' || currentTab === 'applications'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/35 ring-1 ring-white/20 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Job Board & Applications"
              >
                <Briefcase className="w-4 h-4 lg:w-[18px] lg:h-[18px] flex-shrink-0" />
                <span>Jobs</span>
                {jobsCount > 0 && (
                  <span className="text-[10px] lg:text-[11px] bg-white/10 px-1.5 py-0.2 rounded-full text-indigo-200 border border-white/20 font-extrabold">
                    {jobsCount}
                  </span>
                )}

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  Jobs & Applications ({jobsCount} openings)
                </div>
              </button>

              {/* 5. Speed Connect Hub */}
              <button
                onClick={() => setCurrentTab('connect')}
                className={`group relative flex items-center gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-3.5 xl:px-4 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all ${
                  currentTab === 'connect'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/35 ring-1 ring-white/20 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Speed Connect Hub (Audio & Video Calls)"
              >
                <Radio className="w-4 h-4 lg:w-[18px] lg:h-[18px] text-emerald-400 animate-pulse flex-shrink-0" />
                <span>Connect</span>

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  Speed Connect (Calls & Chat)
                </div>
              </button>

              {/* 6. Anonymous Discussions */}
              <button
                onClick={() => setCurrentTab('anon')}
                className={`group relative flex items-center gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-3.5 xl:px-4 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all ${
                  currentTab === 'anon'
                    ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white shadow-lg shadow-orange-600/35 ring-1 ring-white/20 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="JobScout Anon Talk"
              >
                <div className="relative">
                  <Flame className={`w-4 h-4 lg:w-[18px] lg:h-[18px] flex-shrink-0 ${currentTab === 'anon' ? 'text-white' : 'text-orange-400'}`} />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" />
                </div>
                <span>
                  <span className="hidden xl:inline">Anon Talk</span>
                  <span className="xl:hidden">Anon</span>
                </span>

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  JobScout Anon Talk
                </div>
              </button>

              {/* 7. Full-Page Messaging */}
              <button
                onClick={() => setCurrentTab('messages')}
                className={`group relative flex items-center gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-3.5 xl:px-4 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all ${
                  currentTab === 'messages'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/35 ring-1 ring-white/20 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Full-Page Messaging (चैट)"
              >
                <div className="relative">
                  <MessageSquare className="w-4 h-4 lg:w-[18px] lg:h-[18px] flex-shrink-0" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <span>Messages</span>

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  Full-Page Messaging (चैट)
                </div>
              </button>
            </nav>
          </div>

          {/* ========================================================== */}
          {/* 3. RIGHT CONTROLS: MOBILE SEARCH, POST JOB, BELL, PROFILE, HAMBURGER */}
          {/* ========================================================== */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 justify-end flex-shrink-0">
            
            {/* Mobile Search Toggle Button (Phone Only) */}
            <div className="md:hidden relative" ref={mobileSearchRef}>
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className={`p-1.5 sm:p-2 rounded-xl border transition-colors ${
                  mobileSearchOpen 
                    ? 'bg-indigo-600 text-white border-indigo-500' 
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                }`}
                title="Search Jobs & People"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Mobile Search Dropdown Input */}
              {mobileSearchOpen && (
                <div className="fixed left-2 right-2 top-16 bg-slate-900 border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-[900] animate-in fade-in zoom-in-95 duration-150">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search jobs, skills, candidates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </form>

                  {/* Matching quick previews */}
                  {matchingJobs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 max-h-48 overflow-y-auto">
                      <span className="text-[10px] font-bold text-slate-400 block px-1">Top Matching Jobs:</span>
                      {matchingJobs.map(j => (
                        <div
                          key={j.id}
                          onClick={() => handleSelectJobResult(j)}
                          className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-xs flex items-center justify-between"
                        >
                          <span className="font-bold text-white truncate">{j.title}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">{j.salary}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleSearchSubmit}
                    className="w-full mt-2.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    View All Results in Job Board
                  </button>
                </div>
              )}
            </div>

            {/* Post Job Button (if Employer) with Hover Tooltip */}
            {user && isEmployer && (
              <div className="relative group">
                <button
                  onClick={onOpenPostJob}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/30 transition-all active:scale-95"
                  title="Post a New Job on Map"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Post Job</span>
                </button>

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#07090e]/95 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  Post a Job on Live Map
                </div>
              </div>
            )}

            {/* Notifications Bell Dropdown with Hover Tooltip */}
            <div className="relative group" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
                className="relative p-1.5 sm:p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white transition-all backdrop-blur-xl shadow-sm"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[8px] font-black text-white flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.7)] animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#07090e]/95 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                Notifications ({unreadNotifsCount} unread)
              </div>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="fixed left-2 right-2 top-16 sm:left-auto sm:right-0 sm:absolute sm:mt-2 sm:w-80 bg-[#0c121e]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[900] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-xs text-white">Notifications</span>
                      {unreadNotifsCount > 0 && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full font-bold">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                          n.read
                            ? 'bg-white/[0.02] hover:bg-white/[0.06] text-slate-400'
                            : 'bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/30 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white leading-tight">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                          {n.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/[0.08] mt-2 text-center">
                    <span className="text-[10px] text-slate-500">
                      Live events synced with Socket.IO & WebRTC
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill or Auth with Hover Tooltip */}
            {user ? (
              <div className="relative group flex-shrink-0" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-1.5 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition-all text-left flex-shrink-0 cursor-pointer shadow-sm backdrop-blur-xl"
                  title="Profile & Settings"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/20 object-cover bg-slate-900 ring-2 ring-indigo-500/20"
                    />
                    <span className={`absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-[#07090e] ${
                      isSeeker ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]'
                    }`} />
                  </div>

                  <div className="flex flex-col text-left min-w-0">
                    <div className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[42px] xs:max-w-[65px] sm:max-w-[95px] md:max-w-[110px] lg:max-w-[130px] xl:max-w-[150px] leading-tight">
                      {user.name}
                    </div>
                    <div className="hidden sm:flex text-[10px] text-slate-400 items-center gap-1 leading-tight mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isEmployer ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                      <span className="truncate">{isEmployer ? 'Recruiter' : 'Seeker'}</span>
                    </div>
                  </div>

                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0 ml-0.5" />
                </button>

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#07090e]/95 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  {user.name} ({isEmployer ? 'Employer' : 'Seeker'})
                </div>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="fixed left-2 right-2 top-16 sm:left-auto sm:right-0 sm:absolute sm:mt-2 sm:w-72 bg-[#0c121e]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[900] animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Profile Header Details */}
                    <div className="p-2 border-b border-white/[0.08] mb-2">
                      <div className="font-bold text-sm text-white truncate">{user.name}</div>
                      <div className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{user.phone || '9876543210'}</span>
                      </div>

                      {/* Official Email with 1-click Update */}
                      <div className="flex items-center justify-between gap-1 text-xs mt-1.5 pt-1.5 border-t border-white/[0.08]">
                        <div className="flex items-center gap-1.5 min-w-0" title={user.email || 'No email configured'}>
                          <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate max-w-[145px] text-[11px] text-slate-300 font-medium">
                            {user.email || <span className="text-amber-400 italic">No email linked</span>}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailModalOpen(true);
                            setProfileMenuOpen(false);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline whitespace-nowrap ml-1 flex items-center gap-0.5"
                          title="Update Email"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>{user.email ? 'Edit' : 'Add Email'}</span>
                        </button>
                      </div>

                      <div className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-white/[0.05] text-slate-300 border border-white/10">
                        {isEmployer ? '👔 Employer Account (#Hiring)' : '🔍 Seeker Account (#OpenToWork)'}
                      </div>
                    </div>

                    {/* View Full Professional Profile Button */}
                    <button
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile(user);
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all mb-2"
                    >
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>View My Full Profile</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {/* Direct Shortcut to My Applications / Candidate Resumes */}
                    <button
                      onClick={() => {
                        setCurrentTab('applications');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors mb-2"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isEmployer ? 'Candidate Applications' : 'My Job Applications'}</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>

                    {/* Email Sender Setup (for Real Gmail Delivery) */}
                    {isEmployer && (
                      <button
                        onClick={() => {
                          setIsSenderConfigOpen(true);
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors mb-2"
                        title="Configure Gmail App Password"
                      >
                        <span className="flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-amber-400" />
                          <span>Email Sender Setup (Gmail)</span>
                        </span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                      </button>
                    )}

                    {/* Location Info */}
                    <div className="px-2 py-1 text-xs text-slate-400 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{user.address || 'Active in India'}</span>
                    </div>

                    {/* Account Type Indicator */}
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.08] my-1.5 text-xs">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                        Account Type (1 Number = 1 Role)
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold flex items-center gap-1.5 ${isEmployer ? 'text-indigo-400' : 'text-emerald-400'}`}>
                          {isEmployer ? '👔 Registered Employer' : '🔍 Registered Job Seeker'}
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Switch Account (14 Demo Users) */}
                    {onOpenSwitchAccount && (
                      <button
                        onClick={() => { onOpenSwitchAccount(); setProfileMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/30 transition-colors mb-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Switch Account (14 Demo Users)</span>
                      </button>
                    )}

                    {/* Logout */}
                    <button
                      onClick={() => { logout(); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out (लॉग आउट)</span>
                    </button>

                  </div>
                )}
              </div>
            ) : (
              /* Guest Sign In Button */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/30 transition-all active:scale-95"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Hamburger Menu Button (Phone Only: md:hidden) */}
            <div className="relative group md:hidden">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                  mobileDrawerOpen 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400/50 shadow-md shadow-indigo-600/30' 
                    : 'bg-white/[0.04] text-slate-200 hover:text-white hover:bg-white/[0.08] border-white/[0.08] shadow-sm backdrop-blur-xl'
                }`}
                title="Navigation Menu & Options"
                aria-label="Toggle navigation menu"
              >
                {mobileDrawerOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 right-0 px-2 py-0.5 bg-[#07090e]/95 border border-white/10 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                Menu & Options
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================== */}
      {/* 4. FIXED HAMBURGER MENU DRAWER (Teleported to document.body via Portal) */}
      {/* ========================================================== */}
      {mobileDrawerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] md:hidden flex justify-end animate-in fade-in duration-200">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-[90vw] max-w-sm h-full max-h-[100dvh] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-4 sm:p-5 overflow-y-auto z-10 animate-in slide-in-from-right duration-250">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-1 text-xs font-bold active:scale-95"
                  title="Back"
                >
                  <ArrowRight className="w-4 h-4 text-indigo-400 rotate-180" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-2">
                  <JobScoutLogo size={28} />
                  <div className="leading-tight">
                    <span className="font-extrabold text-white text-sm block">JobScout</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Navigation Menu</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 transition-colors active:scale-90"
                title="Close Menu"
                aria-label="Close navigation menu"
              >
                <span className="text-[11px] font-semibold">Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. PRIMARY NAVIGATION OPTIONS (Placed at the TOP so user sees all nav options immediately!) */}
            <div className="my-3 space-y-1.5 flex-shrink-0">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  Pages & Navigation
                </span>
                <span className="text-[10px] text-indigo-400 font-bold">
                  Tap to open
                </span>
              </div>

              {/* Feed (Home) */}
              <button
                onClick={() => { setCurrentTab('feed'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'feed'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className={`w-4 h-4 flex-shrink-0 ${currentTab === 'feed' ? 'text-white' : 'text-indigo-400'}`} />
                  <span>Feed (Home)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Stories & Updates</span>
              </button>

              {/* Network */}
              <button
                onClick={() => { setCurrentTab('network'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'network'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 flex-shrink-0 ${currentTab === 'network' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>My Network</span>
                </div>
                <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[10px] text-slate-300 font-bold">
                  {seekersCount + employersCount}
                </span>
              </button>

              {/* Live Radar Map */}
              <button
                onClick={() => { setCurrentTab('map'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'map'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-4 h-4 flex-shrink-0 ${currentTab === 'map' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>Live Radar Map</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Live</span>
                </div>
              </button>

              {/* Job Board */}
              <button
                onClick={() => { setCurrentTab('jobs'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'jobs'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className={`w-4 h-4 flex-shrink-0 ${currentTab === 'jobs' ? 'text-white' : 'text-indigo-400'}`} />
                  <span>Job Board (Openings)</span>
                </div>
                {jobsCount > 0 && (
                  <span className="bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[10px] text-indigo-300 font-bold">
                    {jobsCount} jobs
                  </span>
                )}
              </button>

              {/* Applied Jobs / Candidate Applications */}
              <button
                onClick={() => { setCurrentTab('applications'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'applications'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 flex-shrink-0 ${currentTab === 'applications' ? 'text-white' : 'text-indigo-400'}`} />
                  <span>{isEmployer ? 'Candidate Applications' : 'Applied Jobs'}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold bg-slate-850 px-2 py-0.5 rounded-md">
                  Status & Review
                </span>
              </button>

              {/* Speed Connect Hub */}
              <button
                onClick={() => { setCurrentTab('connect'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'connect'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Radio className={`w-4 h-4 flex-shrink-0 ${currentTab === 'connect' ? 'text-white' : 'text-emerald-400 animate-pulse'}`} />
                  <span>Speed Connect</span>
                </div>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">
                  Calls
                </span>
              </button>

              {/* Anon Talk */}
              <button
                onClick={() => { setCurrentTab('anon'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'anon'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Flame className={`w-4 h-4 flex-shrink-0 ${currentTab === 'anon' ? 'text-white' : 'text-orange-400'}`} />
                  <span>Anon Talk (गुमनाम चर्चा)</span>
                </div>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                  Community
                </span>
              </button>

              {/* Full-Page Messaging */}
              <button
                onClick={() => { setCurrentTab('messages'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'messages'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentTab === 'messages' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>Full-Page Messaging</span>
                </div>
                <span className="text-[10px] bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  Chat
                </span>
              </button>
            </div>

            {/* 2. USER PROFILE & ROLE SWITCH SECTION */}
            {user ? (
              <div className="my-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-slate-700 object-cover bg-slate-800 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-white truncate">{user.name}</h4>
                    <p className="text-[11px] text-indigo-400 truncate">{user.phone || '9876543210'}</p>
                    <div className="flex items-center justify-between gap-1 text-[11px] text-slate-300 mt-0.5">
                      <span className="truncate max-w-[130px]">{user.email || 'No email set'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEmailModalOpen(true);
                          setMobileDrawerOpen(false);
                        }}
                        className="text-[10px] text-indigo-400 font-bold underline"
                      >
                        Edit
                      </button>
                    </div>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 mt-1">
                      {isEmployer ? '👔 Employer (#Hiring)' : '🔍 Seeker (#OpenToWork)'}
                    </span>
                  </div>
                </div>

                {/* 1-Tap Quick Role Switch */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">1-TAP ROLE SWITCH:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => demoSwitch('emp')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        isEmployer ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      👔 Employer
                    </button>
                    <button
                      onClick={() => demoSwitch('seeker')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        isSeeker ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🔍 Seeker
                    </button>
                  </div>
                </div>

                {/* View Full Profile */}
                <button
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile(user);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full mt-2 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>View Full Profile</span>
                </button>
              </div>
            ) : (
              <div className="my-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex-shrink-0 text-center">
                <p className="text-xs text-slate-400 mb-2">Sign in to apply for jobs and connect with candidates</p>
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Sign In to JobScout
                </button>
              </div>
            )}

            {/* 3. SEARCH & QUICK CHIPS */}
            <div className="my-2 flex-shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search jobs, skills, candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['React Developer', 'Mumbai BKC', 'Urgent Hiring'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setCurrentTab('jobs');
                      setMobileDrawerOpen(false);
                    }}
                    className="px-2 py-0.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-[10px] font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. FOOTER ACTIONS */}
            <div className="mt-auto pt-3 border-t border-slate-800 space-y-2 flex-shrink-0">
              {/* Employer Post Job */}
              {user && isEmployer && (
                <button
                  onClick={() => {
                    onOpenPostJob();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a New Job</span>
                </button>
              )}

              {/* Switch Demo Account */}
              {onOpenSwitchAccount && (
                <button
                  onClick={() => {
                    onOpenSwitchAccount();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-indigo-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Switch Demo Account (14 Profiles)</span>
                </button>
              )}

              {/* Sign Out */}
              {user && (
                <button
                  onClick={() => {
                    logout();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}

              {/* Close Menu Button */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/80 transition-colors active:scale-95"
              >
                <X className="w-4 h-4 text-slate-400" />
                <span>Close Menu (मेनू बंद करें)</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Update Email Modal */}
      {isEmailModalOpen && (
        <UpdateEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}

      {/* Email Sender Configuration Modal */}
      {isSenderConfigOpen && (
        <EmailSenderConfigModal
          isOpen={isSenderConfigOpen}
          onClose={() => setIsSenderConfigOpen(false)}
        />
      )}

    </header>
  );
};
