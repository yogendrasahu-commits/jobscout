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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { JobScoutLogo } from './JobScoutLogo';

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
    <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/90 sticky top-0 z-[800] select-none shadow-xl w-full max-w-full">
      <div className="w-full max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-1 sm:gap-2 lg:gap-3">
          
          {/* ========================================================== */}
          {/* 1. BRAND LOGO & LOCATION PILL & SEARCH BAR */}
          {/* ========================================================== */}
          <div className="flex items-center gap-2 lg:gap-2.5 xl:gap-3 flex-shrink-0">
            {/* Logo with Hover Name Tooltip */}
            <div 
              className="flex items-center gap-2 cursor-pointer group relative flex-shrink-0" 
              onClick={() => setCurrentTab('feed')}
              title="JobScout - Jobs + discovery"
            >
              <div className="relative group-hover:scale-105 transition-transform flex-shrink-0 shadow-lg shadow-indigo-950/40">
                <JobScoutLogo size={38} className="w-9 h-9 sm:w-10 sm:h-10" />
              </div>

              <div className="leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                    JobScout
                  </span>
                  <span className="hidden 2xl:inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 tracking-normal">
                    Jobs + discovery
                  </span>
                </div>
                <div className="hidden 2xl:flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="truncate max-w-[110px]">
                    {user?.address ? user.address.split(',')[0] : 'Mumbai BKC • GPS'}
                  </span>
                </div>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                JobScout Home
              </div>
            </div>

            {/* Quick Live Search Bar (Desktop / Laptop >= md) */}
            <div className="hidden md:block relative flex-shrink-0" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative group">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  className="w-24 md:w-28 lg:w-36 xl:w-48 2xl:w-60 bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition-all"
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
                        onClick={() => { setSearchQuery('Mumbai'); setCurrentTab('map'); setSearchFocused(false); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Explore Mumbai BKC Radar Map</span>
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
          {/* 2. LAPTOP & DESKTOP NAVIGATION TABS (All options visible on laptop/desktop) */}
          {/* ========================================================== */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-slate-950/80 p-0.5 lg:p-1 rounded-2xl border border-slate-800/90 shadow-inner flex-shrink-0">
            
            {/* 1. Feed (Home) */}
            <button
              onClick={() => setCurrentTab('feed')}
              className={`group relative flex items-center gap-1 lg:gap-1.5 px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-semibold transition-all ${
                currentTab === 'feed'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Feed (Home)"
            >
              <Home className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
              <span>Feed</span>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                Feed (Home)
              </div>
            </button>

            {/* 2. My Network */}
            <button
              onClick={() => setCurrentTab('network')}
              className={`group relative flex items-center gap-1 lg:gap-1.5 px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-semibold transition-all ${
                currentTab === 'network'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="My Professional Network"
            >
              <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
              <span>Network</span>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                My Network ({seekersCount + employersCount})
              </div>
            </button>

            {/* 3. Live Map Radar */}
            <button
              onClick={() => setCurrentTab('map')}
              className={`group relative flex items-center gap-1 lg:gap-1.5 px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-semibold transition-all ${
                currentTab === 'map'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Live Radar Map"
            >
              <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-400 flex-shrink-0" />
              <span>Radar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                Live Radar Map
              </div>
            </button>

            {/* 4. Jobs & Applied */}
            <button
              onClick={() => setCurrentTab('jobs')}
              className={`group relative flex items-center gap-1 lg:gap-1.5 px-2 md:px-2.5 lg:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-semibold transition-all ${
                currentTab === 'jobs' || currentTab === 'applications'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Job Board & Applications"
            >
              <Briefcase className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
              <span>Jobs</span>
              {jobsCount > 0 && (
                <span className="text-[9px] lg:text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full text-indigo-300 border border-slate-700">
                  {jobsCount}
                </span>
              )}

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                Jobs & Applications ({jobsCount} openings)
              </div>
            </button>

            {/* 5. Speed Connect Hub */}
            <button
              onClick={() => setCurrentTab('connect')}
              className={`group relative flex items-center gap-1 lg:gap-1.5 px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-semibold transition-all ${
                currentTab === 'connect'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Speed Connect Hub (Audio & Video Calls)"
            >
              <Radio className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-400 animate-pulse flex-shrink-0" />
              <span>Connect</span>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                Speed Connect (Calls & Chat)
              </div>
            </button>

            {/* 6. Anonymous Discussions */}
            <button
              onClick={() => setCurrentTab('anon')}
              className={`group relative flex items-center gap-1 lg:gap-1.5 px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-semibold transition-all ${
                currentTab === 'anon'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="JobScout Anon Talk"
            >
              <div className="relative">
                <Flame className={`w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0 ${currentTab === 'anon' ? 'text-white' : 'text-orange-400'}`} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
              </div>
              <span>
                <span className="hidden xl:inline">Anon Talk</span>
                <span className="xl:hidden">Anon</span>
              </span>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                JobScout Anon Talk
              </div>
            </button>

            {/* 8. Full-Page Messaging */}
            <button
              onClick={() => setCurrentTab('messages')}
              className={`group relative flex items-center gap-1 lg:gap-1.5 px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-semibold transition-all ${
                currentTab === 'messages'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Full-Page Messaging (चैट)"
            >
              <div className="relative">
                <MessageSquare className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              </div>
              <span>Messages</span>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                Full-Page Messaging (चैट)
              </div>
            </button>
          </nav>

          {/* ========================================================== */}
          {/* 3. RIGHT CONTROLS: MOBILE SEARCH, POST JOB, BELL, PROFILE, HAMBURGER */}
          {/* ========================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Mobile Search Toggle Button (Phone Only) */}
            <div className="md:hidden relative" ref={mobileSearchRef}>
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className={`p-2 rounded-xl border transition-colors ${
                  mobileSearchOpen 
                    ? 'bg-indigo-600 text-white border-indigo-500' 
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                }`}
                title="Search Jobs & People"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Mobile Search Dropdown Input */}
              {mobileSearchOpen && (
                <div className="fixed left-2 right-2 top-16 bg-slate-900 border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
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
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 transition-all active:scale-95"
                  title="Post a New Job on Map"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Post Job</span>
                </button>

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  Post a Job on Live Map
                </div>
              </div>
            )}

            {/* Notifications Bell Dropdown with Hover Tooltip */}
            <div className="relative group" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
                className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                Notifications ({unreadNotifsCount} unread)
              </div>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="fixed left-3 right-3 top-16 sm:left-auto sm:right-0 sm:absolute sm:mt-2 sm:w-80 bg-slate-900 border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-xs text-white">Notifications</span>
                      {unreadNotifsCount > 0 && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full font-bold">
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
                            ? 'bg-slate-950/40 hover:bg-slate-800/60 opacity-80'
                            : 'bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/20'
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

                  <div className="pt-2 border-t border-slate-800 mt-2 text-center">
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
                  className="flex items-center gap-1.5 p-1 xl:px-2.5 xl:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all text-left flex-shrink-0"
                  title="Profile & Settings"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-600 object-cover bg-slate-900"
                    />
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                      isSeeker ? 'bg-emerald-400' : 'bg-indigo-400'
                    }`} />
                  </div>

                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-white truncate max-w-[95px] 2xl:max-w-[120px] leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isEmployer ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                      <span>{isEmployer ? 'Recruiter' : 'Seeker'}</span>
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>

                {/* Hover Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  {user.name} ({isEmployer ? 'Employer' : 'Seeker'})
                </div>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="fixed left-3 right-3 top-16 sm:left-auto sm:right-0 sm:absolute sm:mt-2 sm:w-72 bg-slate-900 border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Profile Header Details */}
                    <div className="p-2 border-b border-slate-800 mb-2">
                      <div className="font-bold text-sm text-white truncate">{user.name}</div>
                      <div className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{user.phone || '9876543210'}</span>
                      </div>
                      <div className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {isEmployer ? '👔 Employer Account (#Hiring)' : '🔍 Seeker Account (#OpenToWork)'}
                      </div>
                    </div>

                    {/* View Full Professional Profile Button */}
                    <button
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile(user);
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all mb-2"
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
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors mb-2"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isEmployer ? 'Candidate Applications' : 'My Job Applications'}</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>

                    {/* Location Info */}
                    <div className="px-2 py-1 text-xs text-slate-400 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{user.address || 'Active in Mumbai BKC'}</span>
                    </div>

                    {/* Account Type Indicator */}
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 my-1.5 text-xs">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                        Account Type (1 Number = 1 Role)
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold flex items-center gap-1.5 ${isEmployer ? 'text-indigo-400' : 'text-emerald-400'}`}>
                          {isEmployer ? '👔 Registered Employer' : '🔍 Registered Job Seeker'}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
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
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
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
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
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
                className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                  mobileDrawerOpen 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30' 
                    : 'bg-slate-800/90 text-slate-200 hover:text-white hover:bg-slate-700/90 border-slate-700 shadow-sm'
                }`}
                title="Navigation Menu & Options"
                aria-label="Toggle navigation menu"
              >
                {mobileDrawerOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 right-0 px-2 py-0.5 bg-slate-950 border border-slate-700/80 text-white text-[10px] font-bold rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                Menu & Options
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================== */}
      {/* 4. FIXED HAMBURGER MENU DRAWER (Phone Only: md:hidden) */}
      {/* ========================================================== */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[999] md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-[88vw] max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-4 sm:p-5 overflow-y-auto animate-in slide-in-from-right duration-200 z-10">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <JobScoutLogo size={28} />
                <span className="font-extrabold text-white text-base">JobScout Navigation</span>
              </div>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input inside Hamburger Menu */}
            <div className="my-4">
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
                {['React Developer', 'Mumbai BKC', 'Urgent Hiring', 'Full Stack'].map((tag) => (
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

            {/* Profile Info & 1-Tap Role Switch in Drawer */}
            {user && (
              <div className="mb-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-11 h-11 rounded-full border border-slate-700 object-cover bg-slate-800 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
                    <p className="text-xs text-indigo-400 truncate">{user.phone || '9876543210'}</p>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 mt-1">
                      {isEmployer ? '👔 Employer (#Hiring)' : '🔍 Seeker (#OpenToWork)'}
                    </span>
                  </div>
                </div>

                {/* 1-Tap Quick Role Switch */}
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">QUICK ROLE SWITCH:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => demoSwitch('emp')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        isEmployer ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      👔 Employer
                    </button>
                    <button
                      onClick={() => demoSwitch('seeker')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        isSeeker ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
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
                  className="w-full mt-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>View Full Profile</span>
                </button>
              </div>
            )}

            {/* Navigation Routes in Drawer */}
            <div className="space-y-1 my-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-2 mb-1">
                Pages & Portals
              </span>

              {/* Feed */}
              <button
                onClick={() => { setCurrentTab('feed'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  currentTab === 'feed' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4 text-indigo-400" />
                <span>JobScout Feed</span>
              </button>

              {/* Network */}
              <button
                onClick={() => { setCurrentTab('network'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  currentTab === 'network' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>My Network</span>
                </div>
                <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[10px] text-slate-300">
                  {seekersCount + employersCount}
                </span>
              </button>

              {/* Live Radar Map */}
              <button
                onClick={() => { setCurrentTab('map'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  currentTab === 'map' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Live Radar Map</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </button>

              {/* Jobs */}
              <button
                onClick={() => { setCurrentTab('jobs'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  currentTab === 'jobs' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <span>Job Board</span>
                </div>
                {jobsCount > 0 && (
                  <span className="bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[10px] text-indigo-300 font-bold">
                    {jobsCount} jobs
                  </span>
                )}
              </button>

              {/* Speed Connect Hub */}
              <button
                onClick={() => { setCurrentTab('connect'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  currentTab === 'connect' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Speed Connect (Calls & Chat)</span>
                </div>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">
                  Live
                </span>
              </button>

              {/* Anon Talk */}
              <button
                onClick={() => { setCurrentTab('anon'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  currentTab === 'anon' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Anon Talk (गुमनाम चर्चा)</span>
                </div>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                  Community
                </span>
              </button>

              {/* Full-Page Messaging */}
              <button
                onClick={() => { setCurrentTab('messages'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  currentTab === 'messages' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Full-Page Messaging (चैट)</span>
                </div>
                <span className="text-[10px] bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </button>

              {/* Applications / Resumes */}
              {user && (
                <button
                  onClick={() => { setCurrentTab('applications'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    currentTab === 'applications' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>{isEmployer ? 'Candidates & Resumes' : 'My Applications'}</span>
                </button>
              )}
            </div>

            {/* Bottom Drawer Actions */}
            <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-bold"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Switch Demo Account (14 Profiles)</span>
                </button>
              )}

              {/* Sign In or Sign Out */}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out (लॉग आउट)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Sign In (साइन इन)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
