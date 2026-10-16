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
import { 
  NavFeedIcon, 
  NavNetworkIcon, 
  NavRadarIcon, 
  NavJobsIcon, 
  NavConnectIcon, 
  NavAnonIcon, 
  NavMessagesIcon 
} from './NavIcons';
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
  const { setActiveChatUser, socket } = useSocket();

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

  // Real-time socket events syncing into Notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewJob = (newJob) => {
      setNotifications(prev => [
        {
          id: `notif_job_${Date.now()}`,
          title: `New Hot Job: ${newJob.title}`,
          desc: `${newJob.company} is hiring near ${newJob.address || 'you'} (${newJob.salary})`,
          time: 'Just now',
          read: false,
          tab: 'jobs'
        },
        ...prev
      ]);
    };

    const handleNewMsg = (msg) => {
      setNotifications(prev => [
        {
          id: `notif_msg_${Date.now()}`,
          title: `New message from ${msg.senderName || 'Peer'}`,
          desc: msg.content?.slice(0, 60) + '...',
          time: 'Just now',
          read: false,
          tab: 'messages'
        },
        ...prev
      ]);
    };

    const handleAppUpdate = (app) => {
      setNotifications(prev => [
        {
          id: `notif_app_${Date.now()}`,
          title: `Application Status: ${app.jobTitle}`,
          desc: `Status updated to ${app.status?.toUpperCase()}`,
          time: 'Just now',
          read: false,
          tab: 'jobs'
        },
        ...prev
      ]);
    };

    socket.on('job:new', handleNewJob);
    socket.on('message:receive', handleNewMsg);
    socket.on('application:updated', handleAppUpdate);

    return () => {
      socket.off('job:new', handleNewJob);
      socket.off('message:receive', handleNewMsg);
      socket.off('application:updated', handleAppUpdate);
    };
  }, [socket]);

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
    <header className="bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 sticky top-0 z-[800] select-none shadow-sm w-full max-w-full overflow-x-clip">
      <div className="w-full max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-[56px] sm:h-[60px] md:h-[68px] gap-2 lg:gap-4 w-full min-w-0">
          
          {/* ========================================================== */}
          {/* 1. BRAND LOGO & LOCATION PILL & SEARCH BAR */}
          {/* ========================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 justify-start min-w-0 flex-shrink-0">
            {/* Logo */}
            <div 
              className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group flex-shrink-0" 
              onClick={() => setCurrentTab('feed')}
              title="JobScout - Live Radar & Speed Connect"
            >
              <div className="relative group-hover:scale-105 transition-all duration-300 flex-shrink-0 drop-shadow-[0_2px_10px_rgba(79,70,229,0.2)]">
                <JobScoutLogo size={38} className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="leading-none">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black text-base sm:text-lg lg:text-xl tracking-tight text-slate-900 flex items-center">
                    Job<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-500 ml-0.5">Scout</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 ml-1 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
                  </span>
                </div>
                <div className="hidden 2xl:flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                  <span className="truncate max-w-[120px] font-medium text-slate-600">
                    {user?.address ? user.address.split(',')[0] : 'India • GPS Live'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Live Search Bar (Desktop / Laptop >= md) */}
            <div className="hidden md:block relative flex-shrink-0" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative group">
                <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-600 absolute left-3 top-2.5 transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  className="w-20 md:w-24 lg:w-32 xl:w-44 2xl:w-60 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
                  title="Search Jobs, Companies, Candidates"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchFocused(false);
                    }}
                    className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-700 rounded-full"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </form>

              {/* Live Search Suggestions & Results Dropdown */}
              {searchFocused && (
                <div className="absolute left-0 mt-2 w-80 lg:w-96 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[460px] overflow-y-auto">
                  
                  {/* When no query is entered: Trending Suggestions */}
                  {!cleanQ ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                        Trending Searches
                      </div>
                      <div 
                        onClick={() => { setSearchQuery('React Developer'); handleSearchSubmit(); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl cursor-pointer transition-colors"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                        <span>React Developer Jobs ({jobsCount})</span>
                      </div>
                      <div 
                        onClick={() => { setSearchQuery('India'); setCurrentTab('map'); setSearchFocused(false); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-600 rounded-xl cursor-pointer transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Explore India Live Radar Map</span>
                      </div>
                      <div 
                        onClick={() => { setSearchQuery('Engineer'); setCurrentTab('network'); setSearchFocused(false); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-amber-600 rounded-xl cursor-pointer transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        <span>Find Software Engineers ({seekersCount + employersCount})</span>
                      </div>
                      <div 
                        onClick={() => { setCurrentTab('anon'); setSearchFocused(false); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl cursor-pointer transition-colors"
                      >
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>Anon Talk Salary & Culture Discussions</span>
                      </div>
                    </div>
                  ) : (
                    /* Live Matching Results */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 border-b border-slate-100 pb-1.5">
                        <span>Search Results for "{searchQuery}"</span>
                        <span className="text-indigo-600">{totalMatchesCount} matches</span>
                      </div>

                      {/* Matching Jobs Section */}
                      {matchingJobs.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                            Jobs ({matchingJobs.length})
                          </span>
                          <div className="space-y-1">
                            {matchingJobs.map(j => (
                              <div
                                key={j.id}
                                onClick={() => handleSelectJobResult(j)}
                                className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all flex items-start justify-between gap-2"
                              >
                                <div className="truncate">
                                  <div className="text-xs font-bold text-slate-900 truncate">{j.title}</div>
                                  <div className="text-[11px] text-slate-500 truncate">{j.company} • {j.address}</div>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
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
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                            Job Seekers ({matchingSeekers.length})
                          </span>
                          <div className="space-y-1">
                            {matchingSeekers.map(s => (
                              <div
                                key={s.id}
                                onClick={() => handleSelectProfileResult(s)}
                                className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all flex items-center gap-2"
                              >
                                <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                                <div className="truncate flex-1">
                                  <div className="text-xs font-bold text-slate-900 truncate">{s.name}</div>
                                  <div className="text-[11px] text-slate-500 truncate">{s.title || 'Candidate'}</div>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
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
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                            Companies & Employers ({matchingEmployers.length})
                          </span>
                          <div className="space-y-1">
                            {matchingEmployers.map(e => (
                              <div
                                key={e.id}
                                onClick={() => handleSelectProfileResult(e)}
                                className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all flex items-center gap-2"
                              >
                                <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                <div className="truncate flex-1">
                                  <div className="text-xs font-bold text-slate-900 truncate">{e.companyName || e.name}</div>
                                  <div className="text-[11px] text-slate-500 truncate">{e.industry || 'Hiring Company'}</div>
                                </div>
                                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                  Employer
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {totalMatchesCount === 0 && (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No direct matches found. Press Enter to search on Job Board.
                        </div>
                      )}

                      {/* Bottom view all in Job Board button */}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
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
          {/* 2. LAPTOP & DESKTOP NAVIGATION TABS (Centered in Header) */}
          {/* ========================================================== */}
          <div className="hidden md:flex justify-center items-center flex-1 min-w-0 px-1">
            <nav className="flex items-center gap-0.5 lg:gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/90 shadow-xs max-w-full overflow-x-auto no-scrollbar">
              
              {/* 1. Feed (Home) */}
              <button
                onClick={() => setCurrentTab('feed')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs transition-all duration-150 ${
                  currentTab === 'feed'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/90 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-semibold'
                }`}
                title="Feed (Home)"
              >
                <NavFeedIcon active={currentTab === 'feed'} className="w-4 h-4 flex-shrink-0" />
                <span>Feed</span>
              </button>

              {/* 2. My Network */}
              <button
                onClick={() => setCurrentTab('network')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs transition-all duration-150 ${
                  currentTab === 'network'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/90 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-semibold'
                }`}
                title={`My Professional Network (${seekersCount + employersCount})`}
              >
                <NavNetworkIcon active={currentTab === 'network'} className="w-4 h-4 flex-shrink-0" />
                <span>Network</span>
              </button>

              {/* 3. Live Map */}
              <button
                onClick={() => setCurrentTab('map')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs transition-all duration-150 ${
                  currentTab === 'map'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/90 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-semibold'
                }`}
                title="Live Map"
              >
                <NavRadarIcon active={currentTab === 'map'} className="w-4 h-4 flex-shrink-0" />
                <span>Map</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse ml-0.5 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              </button>

              {/* 4. Jobs & Applied */}
              <button
                onClick={() => setCurrentTab('jobs')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs transition-all duration-150 ${
                  currentTab === 'jobs' || currentTab === 'applications'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/90 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-semibold'
                }`}
                title={`Job Board & Applications (${jobsCount} openings)`}
              >
                <NavJobsIcon active={currentTab === 'jobs' || currentTab === 'applications'} className="w-4 h-4 flex-shrink-0" />
                <span>Jobs</span>
                {jobsCount > 0 && (
                  <span className="text-[10px] bg-indigo-50 px-1.5 py-0.2 rounded-full text-indigo-700 border border-indigo-200 font-extrabold">
                    {jobsCount}
                  </span>
                )}
              </button>

              {/* 5. Speed Connect Hub */}
              <button
                onClick={() => setCurrentTab('connect')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs transition-all duration-150 ${
                  currentTab === 'connect'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/90 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-semibold'
                }`}
                title="Speed Connect Hub (Audio & Video Calls)"
              >
                <NavConnectIcon active={currentTab === 'connect'} className="w-4 h-4 flex-shrink-0" />
                <span>Connect</span>
              </button>

              {/* 6. Anonymous Discussions */}
              <button
                onClick={() => setCurrentTab('anon')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs transition-all duration-150 ${
                  currentTab === 'anon'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/90 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-semibold'
                }`}
                title="JobScout Anon Talk"
              >
                <div className="relative">
                  <NavAnonIcon active={currentTab === 'anon'} className="w-4 h-4 flex-shrink-0" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                </div>
                <span>Anon</span>
              </button>

              {/* 7. Full-Page Messaging */}
              <button
                onClick={() => setCurrentTab('messages')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs transition-all duration-150 ${
                  currentTab === 'messages'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/90 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-semibold'
                }`}
                title="Full-Page Messaging (चैट)"
              >
                <div className="relative">
                  <NavMessagesIcon active={currentTab === 'messages'} className="w-4 h-4 flex-shrink-0" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                </div>
                <span className="hidden xl:inline">Messages</span>
                <span className="xl:hidden">Chat</span>
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
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="Search Jobs & People"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Mobile Search Dropdown Input */}
              {mobileSearchOpen && (
                <div className="fixed left-2 right-2 top-16 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl z-[900] animate-in fade-in zoom-in-95 duration-150">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search jobs, skills, candidates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </form>

                  {/* Matching quick previews */}
                  {matchingJobs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 max-h-48 overflow-y-auto">
                      <span className="text-[10px] font-bold text-slate-500 block px-1">Top Matching Jobs:</span>
                      {matchingJobs.map(j => (
                        <div
                          key={j.id}
                          onClick={() => handleSelectJobResult(j)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs flex items-center justify-between"
                        >
                          <span className="font-bold text-slate-900 truncate">{j.title}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">{j.salary}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleSearchSubmit}
                    className="w-full mt-2.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    View All Results in Job Board
                  </button>
                </div>
              )}
            </div>

            {/* Post Job Button (if Employer) */}
            {user && isEmployer && (
              <button
                onClick={onOpenPostJob}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-600/20 border border-emerald-500/30 transition-all active:scale-95 flex-shrink-0"
                title="Post a New Job on Map"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden md:inline">Post Job</span>
              </button>
            )}

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title={`Notifications (${unreadNotifsCount} unread)`}
                className="relative p-1.5 sm:p-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/90 text-slate-700 hover:text-slate-900 transition-all shadow-xs flex-shrink-0"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[8px] font-black text-white flex items-center justify-center shadow-xs animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="fixed left-2 right-2 top-16 sm:left-auto sm:right-0 sm:absolute sm:mt-2 sm:w-80 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl p-3 shadow-xl z-[900] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">Notifications</span>
                      {unreadNotifsCount > 0 && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-full font-bold">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={markAllNotifsRead}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Mark read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={() => setNotifications([])}
                          className="text-[10px] text-slate-400 hover:text-slate-700 font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No notifications right now
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                            n.read
                              ? 'bg-slate-50/70 hover:bg-slate-100/80 text-slate-600'
                              : 'bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-200/70 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 leading-tight">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                            {n.desc}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 mt-2 text-center">
                    <span className="text-[10px] text-slate-400">
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
                  className="flex items-center gap-1 sm:gap-2 px-1.5 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/90 transition-all text-left flex-shrink-0 cursor-pointer shadow-xs"
                  title="Profile & Settings"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-200 object-cover bg-slate-100 ring-2 ring-indigo-500/20"
                    />
                    <span className={`absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-white ${
                      isSeeker ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]' : 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.7)]'
                    }`} />
                  </div>

                  <div className="flex flex-col text-left min-w-0">
                    <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate max-w-[42px] xs:max-w-[65px] sm:max-w-[95px] md:max-w-[110px] lg:max-w-[130px] xl:max-w-[150px] leading-tight">
                      {user.name}
                    </div>
                    <div className="hidden sm:flex text-[10px] text-slate-500 items-center gap-1 leading-tight mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isEmployer ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                      <span className="truncate">{isEmployer ? 'Recruiter' : 'Seeker'}</span>
                    </div>
                  </div>

                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0 ml-0.5" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="fixed left-2 right-2 top-16 sm:left-auto sm:right-0 sm:absolute sm:mt-2 sm:w-72 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl p-3 shadow-xl z-[900] animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Profile Header Details */}
                    <div className="p-2 border-b border-slate-100 mb-2">
                      <div className="font-bold text-sm text-slate-900 truncate">{user.name}</div>
                      <div className="text-xs text-indigo-600 flex items-center gap-1 mt-0.5 font-medium">
                        <Phone className="w-3 h-3" />
                        <span>{user.phone || '9876543210'}</span>
                      </div>

                      {/* Official Email with 1-click Update */}
                      <div className="flex items-center justify-between gap-1 text-xs mt-1.5 pt-1.5 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 min-w-0" title={user.email || 'No email configured'}>
                          <Mail className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span className="truncate max-w-[145px] text-[11px] text-slate-600 font-medium">
                            {user.email || <span className="text-amber-600 italic">No email linked</span>}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailModalOpen(true);
                            setProfileMenuOpen(false);
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline whitespace-nowrap ml-1 flex items-center gap-0.5"
                          title="Update Email"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>{user.email ? 'Edit' : 'Add Email'}</span>
                        </button>
                      </div>

                      <div className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {isEmployer ? '👔 Employer Account (#Hiring)' : '🔍 Seeker Account (#OpenToWork)'}
                      </div>
                    </div>

                    {/* View Full Professional Profile Button */}
                    <button
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile(user);
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200/80 transition-all mb-2"
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
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors mb-2"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{isEmployer ? 'Candidate Applications' : 'My Job Applications'}</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Email Sender Setup (for Real Gmail Delivery) */}
                    {isEmployer && (
                      <button
                        onClick={() => {
                          setIsSenderConfigOpen(true);
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 transition-colors mb-2"
                        title="Configure Gmail App Password"
                      >
                        <span className="flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-amber-600" />
                          <span>Email Sender Setup (Gmail)</span>
                        </span>
                        <ArrowRight className="w-3 h-3 text-amber-600" />
                      </button>
                    )}

                    {/* Location Info */}
                    <div className="px-2 py-1 text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{user.address || 'Active in India'}</span>
                    </div>

                    {/* Account Type Indicator */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 my-1.5 text-xs">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        Account Type (1 Number = 1 Role)
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold flex items-center gap-1.5 ${isEmployer ? 'text-indigo-600' : 'text-emerald-600'}`}>
                          {isEmployer ? '👔 Registered Employer' : '🔍 Registered Job Seeker'}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Switch Account (14 Demo Users) */}
                    {onOpenSwitchAccount && (
                      <button
                        onClick={() => { onOpenSwitchAccount(); setProfileMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-50 border border-indigo-200/80 transition-colors mb-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Switch Account (14 Demo Users)</span>
                      </button>
                    )}

                    {/* Logout */}
                    <button
                      onClick={() => { logout(); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
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
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition-all active:scale-95"
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
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 shadow-xs'
                }`}
                title="Navigation Menu & Options"
                aria-label="Toggle navigation menu"
              >
                {mobileDrawerOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-8 right-0 px-2 py-0.5 bg-slate-900 border border-slate-800 text-white text-[10px] font-bold rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
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
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-[90vw] max-w-sm h-full max-h-[100dvh] bg-white border-l border-slate-200 shadow-2xl flex flex-col p-4 sm:p-5 overflow-y-auto z-10 animate-in slide-in-from-right duration-250 text-slate-900">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 text-xs font-bold active:scale-95"
                  title="Back"
                >
                  <ArrowRight className="w-4 h-4 text-indigo-600 rotate-180" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-2">
                  <JobScoutLogo size={28} />
                  <div className="leading-tight">
                    <span className="font-extrabold text-slate-900 text-sm block">JobScout</span>
                    <span className="text-[9px] text-slate-500 font-semibold">Navigation Menu</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors active:scale-90"
                title="Close Menu"
                aria-label="Close navigation menu"
              >
                <span className="text-[11px] font-semibold">Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. PRIMARY NAVIGATION OPTIONS */}
            <div className="my-3 space-y-1.5 flex-shrink-0">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  Pages & Navigation
                </span>
                <span className="text-[10px] text-indigo-600 font-bold">
                  Tap to open
                </span>
              </div>

              {/* Feed (Home) */}
              <button
                onClick={() => { setCurrentTab('feed'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'feed'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <NavFeedIcon active={currentTab === 'feed'} className="w-4 h-4 flex-shrink-0" />
                  <span>Feed (Home)</span>
                </div>
                <span className={`text-[10px] font-medium ${currentTab === 'feed' ? 'text-indigo-100' : 'text-slate-400'}`}>Stories & Updates</span>
              </button>

              {/* Network */}
              <button
                onClick={() => { setCurrentTab('network'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'network'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <NavNetworkIcon active={currentTab === 'network'} className="w-4 h-4 flex-shrink-0" />
                  <span>My Network</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentTab === 'network' ? 'bg-white/20 border-white/30 text-white' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {seekersCount + employersCount}
                </span>
              </button>

              {/* Live Radar Map */}
              <button
                onClick={() => { setCurrentTab('map'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'map'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <NavRadarIcon active={currentTab === 'map'} className="w-4 h-4 flex-shrink-0" />
                  <span>Live Map</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className={`text-[10px] font-extrabold uppercase ${currentTab === 'map' ? 'text-cyan-200' : 'text-cyan-600'}`}>Live</span>
                </div>
              </button>

              {/* Job Board */}
              <button
                onClick={() => { setCurrentTab('jobs'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'jobs'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <NavJobsIcon active={currentTab === 'jobs'} className="w-4 h-4 flex-shrink-0" />
                  <span>Job Board (Openings)</span>
                </div>
                {jobsCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentTab === 'jobs' ? 'bg-white/20 border-white/30 text-white' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
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
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 flex-shrink-0 ${currentTab === 'applications' ? 'text-white' : 'text-indigo-600'}`} />
                  <span>{isEmployer ? 'Candidate Applications' : 'Applied Jobs'}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${currentTab === 'applications' ? 'bg-white/20 border-white/30 text-white' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  Status & Review
                </span>
              </button>

              {/* Speed Connect Hub */}
              <button
                onClick={() => { setCurrentTab('connect'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'connect'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <NavConnectIcon active={currentTab === 'connect'} className="w-4 h-4 flex-shrink-0" />
                  <span>Speed Connect</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${currentTab === 'connect' ? 'bg-white/20 border-white/30 text-white' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  Calls
                </span>
              </button>

              {/* Anon Talk */}
              <button
                onClick={() => { setCurrentTab('anon'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'anon'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <NavAnonIcon active={currentTab === 'anon'} className="w-4 h-4 flex-shrink-0" />
                  <span>Anon Talk (गुमनाम चर्चा)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${currentTab === 'anon' ? 'bg-white/20 border-white/30 text-white' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                  Community
                </span>
              </button>

              {/* Full-Page Messaging */}
              <button
                onClick={() => { setCurrentTab('messages'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  currentTab === 'messages'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <NavMessagesIcon active={currentTab === 'messages'} className="w-4 h-4 flex-shrink-0" />
                  <span>Full-Page Messaging</span>
                </div>
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  Chat
                </span>
              </button>
            </div>

            {/* 2. USER PROFILE & ROLE SWITCH SECTION */}
            {user ? (
              <div className="my-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{user.name}</h4>
                    <p className="text-[11px] text-indigo-600 font-medium truncate">{user.phone || '9876543210'}</p>
                    <div className="flex items-center justify-between gap-1 text-[11px] text-slate-600 mt-0.5">
                      <span className="truncate max-w-[130px]">{user.email || 'No email set'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEmailModalOpen(true);
                          setMobileDrawerOpen(false);
                        }}
                        className="text-[10px] text-indigo-600 font-bold underline"
                      >
                        Edit
                      </button>
                    </div>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 mt-1">
                      {isEmployer ? '👔 Employer (#Hiring)' : '🔍 Seeker (#OpenToWork)'}
                    </span>
                  </div>
                </div>

                {/* 1-Tap Quick Role Switch */}
                <div className="mt-2.5 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">1-TAP ROLE SWITCH:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => demoSwitch('emp')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        isEmployer ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      👔 Employer
                    </button>
                    <button
                      onClick={() => demoSwitch('seeker')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        isSeeker ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
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
                  className="w-full mt-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>View Full Profile</span>
                </button>
              </div>
            ) : (
              <div className="my-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex-shrink-0 text-center">
                <p className="text-xs text-slate-600 mb-2">Sign in to apply for jobs and connect with candidates</p>
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
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
                    className="px-2 py-0.5 bg-slate-100 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-lg text-[10px] font-semibold text-slate-700 hover:text-indigo-700 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. FOOTER ACTIONS */}
            <div className="mt-auto pt-3 border-t border-slate-100 space-y-2 flex-shrink-0">
              {/* Employer Post Job */}
              {user && isEmployer && (
                <button
                  onClick={() => {
                    onOpenPostJob();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-sm"
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
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-700 text-xs font-semibold border border-slate-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
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
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}

              {/* Close Menu Button */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors active:scale-95"
              >
                <X className="w-4 h-4 text-slate-500" />
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
