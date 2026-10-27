import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { LanguageProvider } from './context/LanguageContext';
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
import { AuthModal } from './pages/AuthModal';
import { FullPageChat } from './pages/FullPageChat';
import { AnonDiscuss } from './pages/AnonDiscuss';
import { Welcome } from './pages/Welcome';
import { CommandPalette } from './components/CommandPalette';
import { ErrorBoundary } from './components/ErrorBoundary';
import { jobService } from './services/jobService';
import { userService } from './services/userService';

function MainApp() {
  const { user, isEmployer } = useAuth();
  const { socket } = useSocket();
  const [isGuestMode, setIsGuestMode] = useState(() => {
    return localStorage.getItem('jobradar_guest_mode') === 'true';
  });
  const [currentTab, setCurrentTab] = useState(() => {
    if (localStorage.getItem('jobradar_token')) return 'feed';
    if (localStorage.getItem('jobradar_guest_mode') === 'true') return 'feed';
    return 'welcome';
  }); // 'welcome' | 'feed' | 'network' | 'map' | 'jobs' | 'connect' | 'anon' | 'applications' | 'messages'
  const [jobsSubTab, setJobsSubTab] = useState('browse'); // 'browse' | 'applied'

  const [jobs, setJobs] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [postJobCoords, setPostJobCoords] = useState(null);
  const [authConfig, setAuthConfig] = useState({
    isOpen: false,
    mode: 'login',
    role: 'seeker'
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobsQuickFilter, setJobsQuickFilter] = useState('all');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  // Network connection listener (Uber/Slack style offline notice)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      setTimeout(() => setShowReconnectedToast(false), 3500);
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

    socket.on('job:created', handleJobCreatedEvent);
    socket.on('job:deleted', handleJobDeletedEvent);
    socket.on('user:registered', handleUserRegisteredEvent);
    socket.on('user:updated', handleUserUpdatedEvent);

    return () => {
      socket.off('job:created', handleJobCreatedEvent);
      socket.off('job:deleted', handleJobDeletedEvent);
      socket.off('user:registered', handleUserRegisteredEvent);
      socket.off('user:updated', handleUserUpdatedEvent);
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

  // Fetch jobs via JobService
  const fetchJobs = async () => {
    try {
      const data = await jobService.getAllJobs(
        user?.lat && user?.lng ? { userLat: user.lat, userLng: user.lng } : {}
      );
      setJobs(data || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  // Fetch seekers via UserService
  const fetchSeekers = async () => {
    try {
      const data = await userService.getSeekers();
      setSeekers(data || []);
    } catch (err) {
      console.error('Failed to fetch seekers:', err);
    }
  };

  // Fetch employers via UserService
  const fetchEmployers = async () => {
    try {
      const data = await userService.getEmployers();
      setEmployers(data || []);
    } catch (err) {
      console.error('Failed to fetch employers:', err);
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

  const handleExploreAsGuest = (targetTab = 'feed') => {
    localStorage.setItem('jobradar_guest_mode', 'true');
    setIsGuestMode(true);
    setCurrentTab(targetTab);
  };

  const handleExitGuest = () => {
    localStorage.removeItem('jobradar_guest_mode');
    setIsGuestMode(false);
    setCurrentTab('welcome');
  };

  // Once logged in or exploring as guest, completely bypass and remove the welcome page
  useEffect(() => {
    if ((user || isGuestMode) && currentTab === 'welcome') {
      setCurrentTab('feed');
    }
  }, [user, isGuestMode, currentTab]);

  // Centralized tab navigation: public tabs accessible to guests, protected tabs require login
  const handleNavigateTab = (tab) => {
    const publicTabs = ['welcome', 'feed', 'network', 'jobs'];
    if (!user && !publicTabs.includes(tab)) {
      setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' });
      return;
    }
    setCurrentTab(tab);
  };

  // Route guard: without login only allow 'welcome', 'feed', 'network', 'jobs'
  useEffect(() => {
    const publicTabs = ['welcome', 'feed', 'network', 'jobs'];
    if (!user && !publicTabs.includes(currentTab)) {
      setCurrentTab('feed');
      setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' });
    }
  }, [user, currentTab]);

  // STANDALONE WELCOME / ONBOARDING LANDING VIEW (Unauthenticated / Non-guest only)
  if (currentTab === 'welcome' && !user && !isGuestMode) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
        <Welcome
          onNavigateToMap={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
          onNavigateToJobs={() => handleExploreAsGuest('jobs')}
          onNavigateToNetwork={() => handleExploreAsGuest('network')}
          onNavigateToFeed={() => handleExploreAsGuest('feed')}
          onNavigateToAnon={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
          onExploreAsGuest={(tab) => {
            const allowed = ['feed', 'network', 'jobs'];
            handleExploreAsGuest(allowed.includes(tab) ? tab : 'feed');
          }}
          onOpenLogin={(phone) => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
          onOpenSignup={(role, phone) => setAuthConfig({ isOpen: true, mode: 'register', role: role || 'seeker' })}
          onSelectJob={(job) => { setSelectedJob(job); handleExploreAsGuest('jobs'); }}
          onSelectSeeker={(seeker) => { handleOpenProfile(seeker); handleExploreAsGuest('feed'); }}
          jobs={jobs}
          seekers={seekers}
          employers={employers}
        />

        {/* Global Auth Modal for Welcome Page Login / Register */}
        <AuthModal
          isOpen={authConfig.isOpen}
          initialMode={authConfig.mode}
          initialRole={authConfig.role}
          onClose={() => setAuthConfig(prev => ({ ...prev, isOpen: false }))}
          onSuccess={() => {
            setAuthConfig(prev => ({ ...prev, isOpen: false }));
            setCurrentTab('feed');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Offline / Reconnected Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-900 text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-sm transition-all z-[1200]">
          <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping" />
          <span>Offline mode: Trying to reconnect to JobScout real-time grid...</span>
        </div>
      )}
      {showReconnectedToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-sm transition-all z-[1200] animate-in fade-in duration-300">
          <span>✓ Back online! Real-time sync restored.</span>
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
        isGuestMode={isGuestMode}
        onExitGuest={handleExitGuest}
        jobsCount={jobs.length}
        seekersCount={seekers.length}
        employersCount={employers.length}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-full relative ${currentTab === 'map' ? 'overflow-hidden' : 'pb-20 md:pb-0 overflow-x-clip'}`}>

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
      />

      {/* Global Realtime Components */}
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
        onClose={() => setAuthConfig(prev => ({ ...prev, isOpen: false }))}
        onSuccess={() => {
          setAuthConfig(prev => ({ ...prev, isOpen: false }));
          setCurrentTab('feed');
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

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <MainApp />
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
