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
import { SwitchAccountModal } from './components/SwitchAccountModal';
import { ChatDrawer } from './components/ChatDrawer';
import { VideoCallModal } from './components/VideoCallModal';
import { IncomingCallBanner } from './components/IncomingCallBanner';
import { AuthModal } from './pages/AuthModal';
import { FullPageChat } from './pages/FullPageChat';
import { AnonDiscuss } from './pages/AnonDiscuss';
import { Welcome } from './pages/Welcome';

function MainApp() {
  const { user, isEmployer } = useAuth();
  const { socket } = useSocket();
  const [currentTab, setCurrentTab] = useState(() => {
    return localStorage.getItem('jobradar_token') ? 'feed' : 'welcome';
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
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobsQuickFilter, setJobsQuickFilter] = useState('all');

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
      if (newUser.role === 'seeker') {
        setSeekers(prev => {
          if (prev.some(s => s.id === newUser.id)) return prev;
          return [newUser, ...prev];
        });
      } else if (newUser.role === 'emp') {
        setEmployers(prev => {
          if (prev.some(e => e.id === newUser.id)) return prev;
          return [newUser, ...prev];
        });
      }
    };

    socket.on('job:created', handleJobCreatedEvent);
    socket.on('job:deleted', handleJobDeletedEvent);
    socket.on('user:registered', handleUserRegisteredEvent);

    return () => {
      socket.off('job:created', handleJobCreatedEvent);
      socket.off('job:deleted', handleJobDeletedEvent);
      socket.off('user:registered', handleUserRegisteredEvent);
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
    // Fallback: if user is logged in
    if (user) {
      setSelectedProfileUser(user);
    }
  };

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const url = user?.lat && user?.lng
        ? `/api/jobs?userLat=${user.lat}&userLng=${user.lng}`
        : '/api/jobs';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  // Fetch seekers
  const fetchSeekers = async () => {
    try {
      const res = await fetch('/api/auth/seekers');
      if (res.ok) {
        const data = await res.json();
        setSeekers(data.seekers || []);
      }
    } catch (err) {
      console.error('Failed to fetch seekers:', err);
    }
  };

  // Fetch employers
  const fetchEmployers = async () => {
    try {
      const res = await fetch('/api/auth/employers');
      if (res.ok) {
        const data = await res.json();
        setEmployers(data.employers || []);
      }
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

  // Once logged in, completely bypass and remove the welcome page, directing user to feed
  useEffect(() => {
    if (user && currentTab === 'welcome') {
      setCurrentTab('feed');
    }
  }, [user, currentTab]);

  // STANDALONE WELCOME / ONBOARDING LANDING VIEW (Unauthenticated / Guest only)
  if (currentTab === 'welcome' && !user) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
        <Welcome
          onNavigateToMap={() => setCurrentTab('map')}
          onNavigateToJobs={() => setCurrentTab('jobs')}
          onNavigateToNetwork={() => setCurrentTab('network')}
          onNavigateToFeed={() => setCurrentTab('feed')}
          onNavigateToAnon={() => setCurrentTab('anon')}
          onOpenLogin={(phone) => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
          onOpenSignup={(role, phone) => setAuthConfig({ isOpen: true, mode: 'register', role: role || 'seeker' })}
          onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
          onSelectJob={(job) => { setSelectedJob(job); setCurrentTab('jobs'); }}
          onSelectSeeker={(seeker) => { handleOpenProfile(seeker); }}
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

        {/* Switch Account Modal */}
        <SwitchAccountModal
          isOpen={isSwitchAccountOpen}
          onClose={() => setIsSwitchAccountOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Top Desktop/Tablet Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
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
        onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
        onOpenProfile={handleOpenProfile}
        jobsCount={jobs.length}
        seekersCount={seekers.length}
        employersCount={employers.length}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-full relative ${currentTab === 'map' ? 'overflow-hidden' : 'pb-20 md:pb-0 overflow-x-hidden'}`}>

        {currentTab === 'feed' && (
          <Feed
            onSelectSeeker={(seeker) => setSelectedSeeker(seeker)}
            onSelectJob={(job) => setSelectedJob(job)}
            onNavigateToMap={() => setCurrentTab('map')}
            onNavigateToAnon={() => setCurrentTab('anon')}
            onNavigateToApplications={() => {
              setCurrentTab('jobs');
              setJobsSubTab('applied');
            }}
            onNavigateToSavedJobs={() => {
              setCurrentTab('jobs');
              setJobsSubTab('browse');
              setJobsQuickFilter('saved');
            }}
            onOpenProfile={handleOpenProfile}
          />
        )}

        {currentTab === 'network' && (
          <Network
            seekers={seekers}
            employers={employers}
            onSelectSeeker={(seeker) => setSelectedSeeker(seeker)}
            onSelectJob={(job) => setSelectedJob(job)}
            onNavigateToMap={() => setCurrentTab('map')}
            onNavigateToJobs={() => setCurrentTab('jobs')}
            onOpenProfile={handleOpenProfile}
          />
        )}

        {currentTab === 'map' && (
          <UberJobMap
            jobs={jobs}
            seekers={seekers}
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
        setCurrentTab={setCurrentTab}
        onOpenPostJob={() => {
          setPostJobCoords(null);
          setIsPostJobOpen(true);
        }}
        onOpenAuth={() => setAuthConfig({ isOpen: true, mode: 'login', role: 'seeker' })}
        onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
        jobsCount={jobs.length}
      />

      {/* Global Realtime Components */}
      <IncomingCallBanner />
      <VideoCallModal />
      <ChatDrawer 
        onOpenFullPageChat={() => setCurrentTab('messages')}
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

      <SwitchAccountModal
        isOpen={isSwitchAccountOpen}
        onClose={() => setIsSwitchAccountOpen(false)}
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

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
