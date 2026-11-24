import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { UberJobMap } from './components/UberJobMap';
import { JobsList } from './pages/JobsList';
import { ConnectHub } from './pages/ConnectHub';
import { ApplicationsView } from './pages/ApplicationsView';
import { Feed } from './pages/Feed';
import { Network } from './pages/Network';
import { LinkedInProfileModal } from './components/LinkedInProfileModal';
import { PostJobModal } from './components/PostJobModal';
import { JobApplyModal } from './components/JobApplyModal';
import { SeekerProfileModal } from './components/SeekerProfileModal';
import { ChatDrawer } from './components/ChatDrawer';
import { VideoCallModal } from './components/VideoCallModal';
import { IncomingCallBanner } from './components/IncomingCallBanner';
import { AlertNotificationToast } from './components/AlertNotificationToast';
import { AuthModal } from './pages/AuthModal';
import { CompleteProfileModal } from './components/CompleteProfileModal';
import { ProfileCompletionAlert } from './components/ProfileCompletionAlert';
import { FullPageChat } from './pages/FullPageChat';
import { AnonDiscuss } from './pages/AnonDiscuss';
import { Welcome } from './pages/Welcome';
import { AdminDashboard } from './pages/AdminDashboard';
import { CommandPalette } from './components/CommandPalette';
import { MobileAppDownloadModal } from './components/MobileAppDownloadModal';
import { ServerConfigModal } from './components/ServerConfigModal';
import { AIMockInterviewModal } from './components/AIMockInterviewModal';
import { FloatingSpeedDial } from './components/FloatingSpeedDial';
import { LiveWalkinQueueModal } from './components/LiveWalkinQueueModal';
import { VideoPitchRecorderModal } from './components/VideoPitchRecorderModal';
import { JobReelsModal } from './components/JobReelsModal';
import { SkillBlitzModal } from './components/SkillBlitzModal';
import { JobOfferBattleModal } from './components/JobOfferBattleModal';
import { ReferralBountyModal } from './components/ReferralBountyModal';
import { CompanyPulseModal } from './components/CompanyPulseModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { THEMES, getThemeById, getNextTheme, applyThemeToDocument } from './utils/theme';
import { jobService } from './services/jobService';
import { userService } from './services/userService';
import { apiClient } from './services/apiClient';
import { 
  getOfflineData, 
  saveOfflineData, 
  syncOfflineOutbox, 
  getOfflineQueue 
} from './utils/offlineStorage';

function MainApp() {
  const { user, isEmployer } = useAuth();
  const { socket } = useSocket();
  const [currentTab, setCurrentTab] = useState(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '').toLowerCase().trim() : '';
    const validTabs = ['welcome', 'feed', 'network', 'map', 'jobs', 'connect', 'anon', 'applications', 'messages', 'admin'];
    if (validTabs.includes(hash)) return hash;
    if (localStorage.getItem('jobradar_token')) return 'feed';

    // Auto-direct standalone installed PWA and Native APK directly into Feed
    const isStandalone = typeof window !== 'undefined' && Boolean(
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      window.location.search.includes('source=pwa') ||
      document.referrer.includes('android-app://') ||
      (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())
    );
    if (isStandalone) return 'feed';

    return 'welcome';
  }); // 'welcome' | 'feed' | 'network' | 'map' | 'jobs' | 'connect' | 'anon' | 'applications' | 'messages' | 'admin'
  const [pendingTabAfterAuth, setPendingTabAfterAuth] = useState(null);
  const [jobsSubTab, setJobsSubTab] = useState('browse'); // 'browse' | 'applied'

  const [jobs, setJobs] = useState(() => getOfflineData('jobs', []));
  const [seekers, setSeekers] = useState(() => getOfflineData('seekers', []));
  const [employers, setEmployers] = useState(() => getOfflineData('employers', []));
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [postJobCoords, setPostJobCoords] = useState(null);
  const [authConfig, setAuthConfig] = useState(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '').toLowerCase().trim() : '';
    if (['login', 'signin'].includes(hash)) {
      return { isOpen: true, mode: 'login', role: 'seeker' };
    }
    if (['signup', 'register'].includes(hash)) {
      return { isOpen: true, mode: 'register', role: 'seeker' };
    }
    return { isOpen: false, mode: 'login', role: 'seeker' };
  });

  const handleCloseAuthModal = () => {
    setAuthConfig(prev => ({ ...prev, isOpen: false }));
    setPendingTabAfterAuth(null);
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
      if (['login', 'signin', 'signup', 'register'].includes(hash)) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  };
  const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobsQuickFilter, setJobsQuickFilter] = useState('all');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileAppModalOpen, setIsMobileAppModalOpen] = useState(false);
  const [isServerConfigOpen, setIsServerConfigOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('✓ Back online! Real-time sync restored.');

  // Persistent 2026 Multi-Aesthetic Theme Engine (Obsidian, Emerald, Ceramic, Sunset)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jobscout_theme');
      if (saved) return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'ceramic';
      }
    }
    return 'ceramic';
  });

  useEffect(() => {
    applyThemeToDocument(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobscout_theme', theme);
    }
  }, [theme]);

  const toggleTheme = (targetTheme) => {
    if (targetTheme && typeof targetTheme === 'string') {
      setTheme(targetTheme);
    } else {
      setTheme(prev => getNextTheme(prev));
    }
  };

  // AI Voice Mock Interviewer Modal Job Target
  const [interviewJob, setInterviewJob] = useState(null);

  // 2026 Next-Gen Engagement Modals State (Categories A, B, C)
  const [walkinJob, setWalkinJob] = useState(null);
  const [isPitchRecorderOpen, setIsPitchRecorderOpen] = useState(false);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [isSkillBlitzOpen, setIsSkillBlitzOpen] = useState(false);
  const [isOfferBattleOpen, setIsOfferBattleOpen] = useState(false);
  const [bountyJob, setBountyJob] = useState(null);
  const [pulseCompanyName, setPulseCompanyName] = useState(null);

  // Network connection listener & offline Outbox background sync
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      try {
        const result = await syncOfflineOutbox(apiClient);
        if (result && result.synced > 0) {
          setSyncStatusMsg(`✓ Back online! Auto-synchronized ${result.synced} offline actions.`);
          fetchJobs();
          fetchSeekers();
          fetchEmployers();
        } else {
          setSyncStatusMsg('✓ Back online! Real-time sync restored.');
        }
      } catch {
        setSyncStatusMsg('✓ Back online! Real-time sync restored.');
      }
      setTimeout(() => setShowReconnectedToast(false), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedToast(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global Spotlight Keyboard Shortcut: Ctrl + K or Cmd + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Socket.IO listeners for real-time synchronization across dual windows/devices
  useEffect(() => {
    if (!socket) return;

    const handleJobCreatedEvent = (newJob) => {
      setJobs(prev => {
        if (prev.some(j => j.id === newJob.id)) return prev;
        return [newJob, ...prev];
      });
    };

    const handleJobDeletedEvent = ({ id }) => {
      setJobs(prev => prev.filter(j => j.id !== id));
    };

    const handleUserRegisteredEvent = (newUser) => {
      fetchSeekers();
      fetchEmployers();
    };

    const handleUserUpdatedEvent = (updatedUser) => {
      fetchSeekers();
      fetchEmployers();
    };

    const handleSystemBroadcast = (payload) => {
      alert(`📢 [SYSTEM BROADCAST from ${payload.sender || 'Administrator'}]\n\n${payload.title || 'Platform Notice'}\n${payload.message}`);
    };

    socket.on('job:created', handleJobCreatedEvent);
    socket.on('job:deleted', handleJobDeletedEvent);
    socket.on('user:registered', handleUserRegisteredEvent);
    socket.on('user:updated', handleUserUpdatedEvent);
    socket.on('system:broadcast', handleSystemBroadcast);

    return () => {
      socket.off('job:created', handleJobCreatedEvent);
      socket.off('job:deleted', handleJobDeletedEvent);
      socket.off('user:registered', handleUserRegisteredEvent);
      socket.off('user:updated', handleUserUpdatedEvent);
      socket.off('system:broadcast', handleSystemBroadcast);
    };
  }, [socket]);

  // Handle open LinkedIn full profile
  const handleOpenProfile = (target) => {
    if (!target) {
      if (user) setSelectedProfileUser(user);
      return;
    }
    // If target is already a user object
    if (typeof target === 'object' && target !== null) {
      setSelectedProfileUser(target);
      return;
    }
    // If target is an ID string
    const targetId = String(target);
    if (user && String(user.id) === targetId) {
      setSelectedProfileUser(user);
      return;
    }
    const found = [...seekers, ...employers].find(u => String(u.id) === targetId);
    if (found) {
      setSelectedProfileUser(found);
      return;
    }
    // Fetch profile dynamically from API if not loaded in local cache
    fetch(`/api/auth/user/${targetId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          setSelectedProfileUser(data.user);
        } else if (user) {
          setSelectedProfileUser(user);
        }
      })
      .catch(() => {
        if (user) setSelectedProfileUser(user);
      });
  };

  // Fetch jobs via JobService with offline cache persistence
  const fetchJobs = async () => {
    try {
      const data = await jobService.getAllJobs(
        user?.lat && user?.lng ? { userLat: user.lat, userLng: user.lng } : {}
      );
      if (Array.isArray(data) && data.length > 0) {
        setJobs(data);
        saveOfflineData('jobs', data);
      } else {
        const cached = getOfflineData('jobs', []);
        if (cached && cached.length > 0) setJobs(cached);
      }
    } catch (err) {
      console.warn('Failed to fetch jobs online, falling back to offline cache:', err);
      const cached = getOfflineData('jobs', []);
      if (cached && cached.length > 0) setJobs(cached);
    }
  };

  // Fetch seekers via UserService with offline cache persistence
  const fetchSeekers = async () => {
    try {
      const data = await userService.getSeekers();
      if (Array.isArray(data) && data.length > 0) {
        setSeekers(data);
        saveOfflineData('seekers', data);
      } else {
        const cached = getOfflineData('seekers', []);
        if (cached && cached.length > 0) setSeekers(cached);
      }
    } catch (err) {
      console.warn('Failed to fetch seekers online, falling back to offline cache:', err);
      const cached = getOfflineData('seekers', []);
      if (cached && cached.length > 0) setSeekers(cached);
    }
  };

  // Fetch employers via UserService with offline cache persistence
  const fetchEmployers = async () => {
    try {
      const data = await userService.getEmployers();
      if (Array.isArray(data) && data.length > 0) {
        setEmployers(data);
        saveOfflineData('employers', data);
      } else {
        const cached = getOfflineData('employers', []);
        if (cached && cached.length > 0) setEmployers(cached);
      }
    } catch (err) {
      console.warn('Failed to fetch employers online, falling back to offline cache:', err);
      const cached = getOfflineData('employers', []);
      if (cached && cached.length > 0) setEmployers(cached);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchSeekers();
    fetchEmployers();
    setLoading(false);
  }, [user]);

  // Synchronize seekers & employers whenever user switches to relevant tabs
  useEffect(() => {
    if (['network', 'connect', 'map', 'feed'].includes(currentTab)) {
      fetchSeekers();
      fetchEmployers();
    }
  }, [currentTab]);

  // Background synchronization for multiple windows/browsers (pauses when tab is hidden)
  useEffect(() => {
    const sync = () => {
      if (!document.hidden) {
        fetchSeekers();
        fetchEmployers();
      }
    };
    const timer = setInterval(sync, 15000);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  // Handle posting job from map pin
  const handlePostJobAtCoords = (coords) => {
    setPostJobCoords(coords);
    setIsPostJobOpen(true);
  };

  const handleJobCreated = (newJob) => {
    setJobs(prev => {
      if (prev.some(j => j.id === newJob.id)) return prev;
      return [newJob, ...prev];
    });
  };

  // Ensure viewport scrolls to top when switching tabs (prevents navbar being scrolled out of view on map tab)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentTab]);

  // Once logged in, bypass the welcome onboarding view
  useEffect(() => {
    if (user && currentTab === 'welcome') {
      if (user.role === 'admin') {
        setCurrentTab('admin');
        window.history.replaceState(null, '', '#/admin');
      } else {
        setCurrentTab('feed');
        window.history.replaceState(null, '', '#/feed');
      }
    }
  }, [user, currentTab]);

  // Centralized tab navigation with Admin privilege enforcement
  const handleNavigateTab = (tab) => {
    if (tab === 'login' || tab === 'signin') {
      setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' });
      return;
    }
    if (tab === 'signup' || tab === 'register') {
      setAuthConfig({ isOpen: true, mode: 'register', role: 'seeker' });
      return;
    }

    const publicTabs = ['welcome', 'feed', 'network', 'jobs', 'map', 'connect', 'anon'];
    if (tab === 'admin') {
      if (!user || user.role !== 'admin') {
        setPendingTabAfterAuth('admin');
        setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' });
        return;
      }
    } else if (!user && !publicTabs.includes(tab)) {
      setPendingTabAfterAuth(tab);
      setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' });
      return;
    }

    setCurrentTab(tab);
    if (tab && tab !== 'welcome') {
      if (window.location.hash.replace(/^#\/?/, '') !== tab) {
        window.history.pushState(null, '', `#/${tab}`);
      }
    } else {
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  };

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
      if (['login', 'signin'].includes(hash)) {
        setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' });
        return;
      }
      if (['signup', 'register'].includes(hash)) {
        setAuthConfig({ isOpen: true, mode: 'register', role: 'seeker' });
        return;
      }

      const validTabs = ['welcome', 'feed', 'network', 'map', 'jobs', 'connect', 'anon', 'applications', 'messages', 'admin'];
      if (validTabs.includes(hash)) {
        const publicTabs = ['welcome', 'feed', 'network', 'jobs', 'map', 'connect', 'anon'];
        if (hash === 'admin' && (!user || user.role !== 'admin')) {
          setCurrentTab('feed');
        } else if (!user && !publicTabs.includes(hash)) {
          setCurrentTab('feed');
        } else {
          setCurrentTab(hash);
        }
      } else if (!hash) {
        if (!user) {
          setCurrentTab('welcome');
        } else {
          setCurrentTab(user.role === 'admin' ? 'admin' : 'feed');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // Route guard: without login allow public exploratory tabs (Feed, Network, Jobs, Map, Connect, Anon)
  useEffect(() => {
    const publicTabs = ['welcome', 'feed', 'network', 'jobs', 'map', 'connect', 'anon'];
    if (!user && !publicTabs.includes(currentTab)) {
      setCurrentTab('welcome');
      setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' });
    } else if (currentTab === 'admin' && user && user.role !== 'admin') {
      setCurrentTab('feed');
    }
  }, [user, currentTab]);

  // STANDALONE WELCOME / ONBOARDING LANDING VIEW (Unauthenticated only)
  if (currentTab === 'welcome' && !user) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
        {!isOnline && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold py-2 px-4 shadow-md transition-all z-[1200] border-b border-amber-400/40 text-xs text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>📡 Offline Mode Active • Viewing cached job listings & talent radar</span>
          </div>
        )}
        <Welcome
          onNavigateToMap={() => handleNavigateTab('map')}
          onNavigateToJobs={() => handleNavigateTab('jobs')}
          onNavigateToNetwork={() => handleNavigateTab('network')}
          onNavigateToFeed={() => handleNavigateTab('feed')}
          onNavigateToConnect={() => handleNavigateTab('connect')}
          onNavigateToAnon={() => handleNavigateTab('anon')}
          onOpenLogin={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
          onOpenSignup={(role) => setAuthConfig({ isOpen: true, mode: 'register', role: role || 'seeker' })}
          onCompleteSignup={(loggedUser) => {
            setIsCompleteProfileOpen(true);
            handleNavigateTab('feed');
          }}
          onSelectJob={(job) => { setSelectedJob(job); handleNavigateTab('jobs'); }}
          onSelectSeeker={(seeker) => { handleOpenProfile(seeker); handleNavigateTab('feed'); }}
          onOpenMobileAppModal={() => setIsMobileAppModalOpen(true)}
          jobs={jobs}
          seekers={seekers}
          employers={employers}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Global Auth Modal for Welcome Page Login / Register */}
        <AuthModal
          isOpen={authConfig.isOpen}
          initialMode={authConfig.mode}
          initialRole={authConfig.role}
          onClose={handleCloseAuthModal}
          onSuccess={(loggedUser, meta) => {
            setAuthConfig(prev => ({ ...prev, isOpen: false }));
            if (loggedUser?.role === 'admin') {
              handleNavigateTab('admin');
            } else if (meta?.isNewSignup) {
              setIsCompleteProfileOpen(true);
              if (pendingTabAfterAuth) {
                handleNavigateTab(pendingTabAfterAuth);
                setPendingTabAfterAuth(null);
              } else {
                handleNavigateTab('feed');
              }
            } else if (pendingTabAfterAuth) {
              handleNavigateTab(pendingTabAfterAuth);
              setPendingTabAfterAuth(null);
            } else {
              handleNavigateTab('feed');
            }
          }}
        />

        {/* Global Mobile App Download Modal */}
        <MobileAppDownloadModal
          isOpen={isMobileAppModalOpen}
          onClose={() => setIsMobileAppModalOpen(false)}
        />

        {/* Server Connection Config Modal */}
        <ServerConfigModal
          isOpen={isServerConfigOpen}
          onClose={() => setIsServerConfigOpen(false)}
        />

        {/* Native App-Style Mobile Bottom Navigation Bar on Mobile Welcome */}
        <MobileBottomNav
          currentTab="welcome"
          setCurrentTab={handleNavigateTab}
          onOpenPostJob={() => setAuthConfig({ isOpen: true, mode: 'register', role: 'emp' })}
          onOpenAuth={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
          jobsCount={jobs.length}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      
      {/* Luxury Glassmorphic Offline Status Capsule */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-medium py-2 px-4 shadow-md transition-all z-[1200] border-b border-amber-400/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
              </span>
              <span>📡 Offline Mode Active • Viewing cached jobs, candidate radar & local profiles (Actions auto-queue & sync on reconnect)</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsServerConfigOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-black/15 hover:bg-black/25 text-slate-950 font-extrabold text-[11px] transition-colors border border-black/10 cursor-pointer"
              >
                ⚙️ Server Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Back Online Auto-Sync Toast */}
      {showReconnectedToast && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-medium py-2 px-4 shadow-lg transition-all z-[1200] border-b border-emerald-400/40 animate-in fade-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping"></span>
            <span>{syncStatusMsg}</span>
          </div>
        </div>
      )}


      {/* Top Desktop/Tablet Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        jobs={jobs}
        seekers={seekers}
        employers={employers}
        onSelectJob={(job) => setSelectedJob(job)}
        onSelectSeeker={(seeker) => handleOpenProfile(seeker)}
        onOpenPostJob={() => {
          setPostJobCoords(null);
          setIsPostJobOpen(true);
        }}
        onOpenAuth={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
        onOpenProfile={handleOpenProfile}
        jobsCount={jobs.length}
        seekersCount={seekers.length}
        employersCount={employers.length}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Persistent Profile Incomplete Alert Banner */}
      <ProfileCompletionAlert onOpenCompleteProfile={() => setIsCompleteProfileOpen(true)} />

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-full relative ${currentTab === 'map' || currentTab === 'messages' ? 'overflow-hidden' : 'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 overflow-x-clip'}`}>

        {currentTab === 'feed' && (
          <Feed
            jobs={jobs}
            seekers={seekers}
            employers={employers}
            onSelectSeeker={(seeker) => setSelectedSeeker(seeker)}
            onSelectJob={(job) => setSelectedJob(job)}
            onNavigateToMap={() => handleNavigateTab('map')}
            onNavigateToJobs={() => handleNavigateTab('jobs')}
            onNavigateToNetwork={() => handleNavigateTab('network')}
            onNavigateToConnect={() => handleNavigateTab('connect')}
            onNavigateToAnon={() => handleNavigateTab('anon')}
            onNavigateToApplications={() => {
              handleNavigateTab('applications');
              setJobsSubTab('applied');
            }}
            onNavigateToSavedJobs={() => {
              handleNavigateTab('jobs');
              setJobsSubTab('browse');
              setJobsQuickFilter('saved');
            }}
            onOpenProfile={handleOpenProfile}
            onOpenAuth={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
            onOpenPostJob={() => setIsPostJobOpen(true)}
          />
        )}

        {currentTab === 'network' && (
          <Network
            seekers={seekers}
            employers={employers}
            onSelectSeeker={(seeker) => setSelectedSeeker(seeker)}
            onSelectJob={(job) => setSelectedJob(job)}
            onNavigateToMap={() => handleNavigateTab('map')}
            onNavigateToJobs={() => handleNavigateTab('jobs')}
            onOpenProfile={handleOpenProfile}
            onOpenAuth={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
          />
        )}

        {currentTab === 'map' && (
          <UberJobMap
            jobs={jobs}
            seekers={seekers}
            employers={employers}
            onSelectJob={(job) => setSelectedJob(job)}
            onSelectSeeker={(seeker) => handleOpenProfile(seeker)}
            onPostJobAtCoords={handlePostJobAtCoords}
            theme={theme}
            onStartMockInterview={(job) => setInterviewJob(job)}
            onOpenWalkin={(job) => setWalkinJob(job)}
            onOpenBounty={(job) => setBountyJob(job)}
            onOpenPulse={(comp) => setPulseCompanyName(comp)}
            onOpenOfferBattle={() => setIsOfferBattleOpen(true)}
            onOpenReels={() => setIsReelsOpen(true)}
            onOpenSkillBlitz={() => setIsSkillBlitzOpen(true)}
            onOpenPitchRecorder={() => setIsPitchRecorderOpen(true)}
          />
        )}

        {(currentTab === 'jobs' || currentTab === 'applications') && (
          <JobsList
            jobs={jobs}
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
            onSelectJob={(job) => setSelectedJob(job)}
            onOpenPostJob={() => setIsPostJobOpen(true)}
            onOpenProfile={handleOpenProfile}
            onOpenAuth={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
            activeSubTab={currentTab === 'applications' ? 'applied' : jobsSubTab}
            setActiveSubTab={(subTab) => {
              setJobsSubTab(subTab);
              if (currentTab === 'applications') {
                setCurrentTab('jobs');
              }
            }}
            initialQuickFilter={jobsQuickFilter}
            onQuickFilterChange={(filter) => setJobsQuickFilter(filter)}
            theme={theme}
            onStartMockInterview={(job) => setInterviewJob(job)}
            onOpenWalkin={(job) => setWalkinJob(job)}
            onOpenBounty={(job) => setBountyJob(job)}
            onOpenPulse={(comp) => setPulseCompanyName(comp)}
            onOpenOfferBattle={() => setIsOfferBattleOpen(true)}
            onOpenReels={() => setIsReelsOpen(true)}
            onOpenSkillBlitz={() => setIsSkillBlitzOpen(true)}
            onOpenPitchRecorder={() => setIsPitchRecorderOpen(true)}
          />
        )}

        {currentTab === 'connect' && (
          <ConnectHub
            seekers={seekers}
            employers={employers}
            jobs={jobs}
            onSelectSeeker={(seeker) => setSelectedSeeker(seeker)}
            onSelectJob={(job) => setSelectedJob(job)}
            onOpenProfile={handleOpenProfile}
          />
        )}

        {currentTab === 'anon' && (
          <AnonDiscuss />
        )}

        {currentTab === 'messages' && (
          <FullPageChat onOpenProfile={handleOpenProfile} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard onNavigateTab={handleNavigateTab} />
        )}
      </main>

      {/* Native App-Style Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        onOpenPostJob={() => {
          setPostJobCoords(null);
          setIsPostJobOpen(true);
        }}
        onOpenAuth={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
        jobsCount={jobs.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Global Realtime Components */}
      <AlertNotificationToast />
      <IncomingCallBanner />
      <VideoCallModal />
      <ChatDrawer 
        onOpenFullPageChat={() => handleNavigateTab('messages')}
        currentTab={currentTab}
      />

      {/* Modals */}
      <LinkedInProfileModal
        profileUser={selectedProfileUser}
        isOpen={Boolean(selectedProfileUser)}
        onClose={() => setSelectedProfileUser(null)}
      />

      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        onJobCreated={handleJobCreated}
        defaultCoords={postJobCoords}
      />

      <JobApplyModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        onApplied={() => {
          fetchJobs();
        }}
        theme={theme}
        onStartMockInterview={(j) => setInterviewJob(j)}
      />

      {/* Voice AI Mock Interviewer Modal */}
      <AIMockInterviewModal
        job={interviewJob}
        isOpen={Boolean(interviewJob)}
        onClose={() => setInterviewJob(null)}
      />

      <SeekerProfileModal
        seeker={selectedSeeker}
        isOpen={Boolean(selectedSeeker)}
        onClose={() => setSelectedSeeker(null)}
      />

      <AuthModal
        isOpen={authConfig.isOpen}
        initialMode={authConfig.mode}
        initialRole={authConfig.role}
        onClose={handleCloseAuthModal}
        onSuccess={(loggedUser, meta) => {
          setAuthConfig(prev => ({ ...prev, isOpen: false }));
          if (loggedUser?.role === 'admin') {
            handleNavigateTab('admin');
          } else if (meta?.isNewSignup) {
            setIsCompleteProfileOpen(true);
            if (pendingTabAfterAuth) {
              handleNavigateTab(pendingTabAfterAuth);
              setPendingTabAfterAuth(null);
            } else {
              handleNavigateTab('feed');
            }
          } else if (pendingTabAfterAuth) {
            handleNavigateTab(pendingTabAfterAuth);
            setPendingTabAfterAuth(null);
          } else if (currentTab === 'welcome') {
            handleNavigateTab('feed');
          }
        }}
      />

      {/* Profile Completion Modal */}
      <CompleteProfileModal
        isOpen={isCompleteProfileOpen}
        onClose={() => setIsCompleteProfileOpen(false)}
        onCompleted={() => {
          fetchSeekers();
          fetchEmployers();
        }}
      />

      {/* Global Spotlight Search & Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        jobs={jobs}
        seekers={seekers}
        onNavigateTab={(tab) => handleNavigateTab(tab)}
        onSelectJob={(job) => setSelectedJob(job)}
        onSelectSeeker={(seeker) => handleOpenProfile(seeker)}
        onOpenPostJob={() => {
          setPostJobCoords(null);
          setIsPostJobOpen(true);
        }}
      />

      {/* Global Mobile App Download Modal */}
      <MobileAppDownloadModal
        isOpen={isMobileAppModalOpen}
        onClose={() => setIsMobileAppModalOpen(false)}
      />

      {/* Server Connection Config Modal */}
      <ServerConfigModal
        isOpen={isServerConfigOpen}
        onClose={() => setIsServerConfigOpen(false)}
      />

      {/* 2026 Mobile Floating Radial Speed-Dial FAB */}
      <FloatingSpeedDial
        onOpenPostJob={() => {
          setPostJobCoords(null);
          setIsPostJobOpen(true);
        }}
        onToggleTheme={toggleTheme}
        theme={theme}
        onInstantShift={() => {
          setJobsQuickFilter('instant_shift');
          handleNavigateTab('jobs');
        }}
        onStartMockInterview={() => setInterviewJob(jobs[0] || null)}
        onOpenReels={() => setIsReelsOpen(true)}
        onOpenSkillBlitz={() => setIsSkillBlitzOpen(true)}
        onOpenOfferBattle={() => setIsOfferBattleOpen(true)}
        onOpenPitchRecorder={() => setIsPitchRecorderOpen(true)}
      />

      {/* 2026 Next-Gen Live Walk-in Queue Modal */}
      <LiveWalkinQueueModal
        isOpen={Boolean(walkinJob)}
        onClose={() => setWalkinJob(null)}
        job={walkinJob}
        employerName={walkinJob?.company}
        user={user}
        onStartVideoCall={({ targetUserId, targetName }) => {
          setActiveVideoCallUser({ id: targetUserId, name: targetName });
        }}
      />

      {/* 2026 Video Pitch Recorder Modal */}
      <VideoPitchRecorderModal
        isOpen={isPitchRecorderOpen}
        onClose={() => setIsPitchRecorderOpen(false)}
        onSavePitch={(url) => {
          if (user) {
            user.videoPitchUrl = url;
          }
        }}
      />

      {/* 2026 Job Reels Modal */}
      <JobReelsModal
        isOpen={isReelsOpen}
        onClose={() => setIsReelsOpen(false)}
        seekers={seekers}
        jobs={jobs}
        onStartVideoCall={({ targetUserId, targetName }) => {
          setActiveVideoCallUser({ id: targetUserId, name: targetName });
        }}
        onOpenChat={(target) => {
          setActiveChatUser(target);
          setIsChatDrawerOpen(true);
        }}
        onSelectSeeker={(s) => handleOpenProfile(s)}
      />

      {/* 2026 AI Skill Blitz Modal */}
      <SkillBlitzModal
        isOpen={isSkillBlitzOpen}
        onClose={() => setIsSkillBlitzOpen(false)}
        user={user}
        onAwardBadge={(badge) => {
          if (user) {
            user.verifiedBadges = [...(user.verifiedBadges || []), badge];
          }
        }}
      />

      {/* 2026 Job Offer Battle Modal */}
      <JobOfferBattleModal
        isOpen={isOfferBattleOpen}
        onClose={() => setIsOfferBattleOpen(false)}
        jobs={jobs}
      />

      {/* 2026 Referral Bounty Modal */}
      <ReferralBountyModal
        isOpen={Boolean(bountyJob)}
        onClose={() => setBountyJob(null)}
        job={bountyJob}
        user={user}
      />

      {/* 2026 Company Pulse Modal */}
      <CompanyPulseModal
        isOpen={Boolean(pulseCompanyName)}
        onClose={() => setPulseCompanyName(null)}
        companyName={pulseCompanyName}
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <MainApp />
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
