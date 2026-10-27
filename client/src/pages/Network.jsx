import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Check, 
  X, 
  MapPin, 
  Briefcase, 
  Building, 
  Sparkles, 
  Phone, 
  Video, 
  MessageSquare,
  Award,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Bell,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const Network = ({ 
  seekers = [], 
  employers = [], 
  onSelectSeeker, 
  onSelectJob, 
  onNavigateToMap,
  onNavigateToJobs,
  onOpenProfile,
  onOpenAuth
}) => {
  const { user, token, isEmployer } = useAuth();
  const { startCall, setActiveChatUser } = useSocket();

  // Search & Active Filter Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'seekers' | 'employers' | 'connected'

  // Toast / System notification banner state
  const [networkNotice, setNetworkNotice] = useState(null);

  const showNotice = (message, type = 'info') => {
    setNetworkNotice({ message, type });
    setTimeout(() => {
      setNetworkNotice(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Connected users state (persisted locally and synced with backend /api/network)
  const [connectedUserIds, setConnectedUserIds] = useState(() => {
    try {
      const stored = localStorage.getItem('jobscout_connections');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter(id => !String(id).startsWith('usr_seek_') && !String(id).startsWith('usr_emp_'));
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Followed companies state (persisted locally)
  const [followingCompanyIds, setFollowingCompanyIds] = useState(() => {
    try {
      const stored = localStorage.getItem('jobscout_followed_companies');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter(id => !String(id).startsWith('usr_seek_') && !String(id).startsWith('usr_emp_'));
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Pending Invitations (Only for logged-in users who received actual connection invitations)
  const [invitations, setInvitations] = useState(() => {
    try {
      const stored = localStorage.getItem('jobscout_invitations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter(i => !String(i.userId || i.id).startsWith('usr_seek_') && !String(i.userId || i.id).startsWith('usr_emp_'));
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Fetch verified network connections from backend API
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/network/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data?.connections && Array.isArray(data.connections)) {
          const apiConnectedIds = data.connections.map(c => 
            c.user1 === user.id ? c.user2 : c.user1
          );
          setConnectedUserIds(prev => {
            const merged = Array.from(new Set([...prev, ...apiConnectedIds]));
            try {
              localStorage.setItem('jobscout_connections', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch(() => {
        // gracefully fallback to local state
      });
  }, [user?.id]);

  // Handle Accept Invitation
  const handleAcceptInvite = (inv) => {
    const targetUserId = inv.userId || inv.id;
    const inviterName = inv.name || 'Member';

    // 1. Mark as connected
    setConnectedUserIds(prev => {
      const next = Array.from(new Set([...prev, targetUserId]));
      try {
        localStorage.setItem('jobscout_connections', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 2. Remove from pending invitations
    setInvitations(prev => {
      const remaining = prev.filter(item => item.id !== inv.id);
      try {
        localStorage.setItem('jobscout_invitations', JSON.stringify(remaining));
      } catch {}
      return remaining;
    });

    // 3. Post to backend
    if (user?.id) {
      fetch('/api/network/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, targetId: targetUserId })
      }).catch(() => {});
    }

    showNotice(`Accepted invitation from ${inviterName}! You are now connected.`, 'success');
  };

  // Handle Ignore Invitation
  const handleIgnoreInvite = (id) => {
    setInvitations(prev => {
      const remaining = prev.filter(inv => inv.id !== id);
      try {
        localStorage.setItem('jobscout_invitations', JSON.stringify(remaining));
      } catch {}
      return remaining;
    });
  };

  // Toggle Connect with a user
  const toggleConnect = (targetUserId, targetName = 'Professional') => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setConnectedUserIds(prev => {
      const isCurrentlyConnected = prev.includes(targetUserId);
      const next = isCurrentlyConnected 
        ? prev.filter(id => id !== targetUserId)
        : [...prev, targetUserId];

      try {
        localStorage.setItem('jobscout_connections', JSON.stringify(next));
      } catch {}

      if (!isCurrentlyConnected) {
        showNotice(`Connected with ${targetName}! You can now exchange direct messages and spot calls.`, 'success');
      } else {
        showNotice(`Removed connection with ${targetName}.`, 'info');
      }

      return next;
    });

    // Sync with backend API
    if (user?.id) {
      fetch('/api/network/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, targetId: targetUserId })
      }).catch(() => {});
    }
  };

  // Toggle Follow Company
  const toggleFollow = (companyId, companyName = 'Company') => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setFollowingCompanyIds(prev => {
      const isCurrentlyFollowing = prev.includes(companyId);
      const next = isCurrentlyFollowing
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];

      try {
        localStorage.setItem('jobscout_followed_companies', JSON.stringify(next));
      } catch {}

      if (!isCurrentlyFollowing) {
        showNotice(`Now following ${companyName}! You will receive notifications when new openings drop.`, 'success');
      } else {
        showNotice(`Unfollowed ${companyName}.`, 'info');
      }

      return next;
    });
  };

  // Safe Profile Opener (Supports full object or ID string)
  const handleProfileClick = (target) => {
    if (onOpenProfile) {
      onOpenProfile(target);
    } else if (onSelectSeeker && target.role === 'seeker') {
      onSelectSeeker(target);
    }
  };

  // Filtered Seekers (Excluding the currently logged-in user themselves)
  const safeSeekers = useMemo(() => {
    return seekers.filter(s => s && String(s.id) !== String(user?.id));
  }, [seekers, user?.id]);

  // Filtered Employers (Excluding the currently logged-in user themselves)
  const safeEmployers = useMemo(() => {
    return employers.filter(e => e && String(e.id) !== String(user?.id));
  }, [employers, user?.id]);

  // Unified list of People according to active filter and search query
  const displayedPeople = useMemo(() => {
    let pool = [];

    if (activeFilter === 'seekers') {
      pool = safeSeekers;
    } else if (activeFilter === 'employers') {
      pool = safeEmployers;
    } else if (activeFilter === 'connected') {
      pool = [...safeSeekers, ...safeEmployers].filter(p => connectedUserIds.includes(p.id));
    } else {
      // 'all': Candidates and Employers
      pool = isEmployer ? [...safeSeekers, ...safeEmployers] : [...safeEmployers, ...safeSeekers];
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return pool;

    return pool.filter(p => {
      const name = (p.name || '').toLowerCase();
      const title = (p.title || p.companyName || '').toLowerCase();
      const addr = (p.address || '').toLowerCase();
      const skills = Array.isArray(p.skills) 
        ? p.skills.join(' ').toLowerCase() 
        : typeof p.skills === 'string' ? p.skills.toLowerCase() : '';

      return name.includes(q) || title.includes(q) || addr.includes(q) || skills.includes(q);
    });
  }, [safeSeekers, safeEmployers, activeFilter, searchQuery, connectedUserIds, isEmployer]);

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Toast Notification Banner */}
      {networkNotice && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-6 z-[1000] animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm sm:max-w-md w-[calc(100%-24px)] sm:w-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 text-slate-900 ring-1 ring-slate-900/5">
            <div className={`p-2 rounded-xl flex-shrink-0 ${
              networkNotice.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
              networkNotice.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
              'bg-indigo-50 text-indigo-600 border border-indigo-200'
            }`}>
              {networkNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-bold text-slate-800 leading-snug">{networkNotice.message}</p>
            </div>
            <button
              onClick={() => setNetworkNotice(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors -mr-1 -mt-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================== */}
        {/* LEFT COLUMN: MANAGE MY NETWORK */}
        {/* ========================================================== */}
        <div className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain no-scrollbar">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Manage My Network
            </h3>

            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('connected')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  activeFilter === 'connected' 
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/90' 
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600" /> Connections
                </span>
                <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
                  {user ? connectedUserIds.length : 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('employers')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  activeFilter === 'employers' 
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/90' 
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-emerald-600" /> Companies & Hubs
                </span>
                <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
                  {safeEmployers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('seekers')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  activeFilter === 'seekers' 
                    ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/90' 
                    : 'text-slate-600 hover:text-amber-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-500" /> Verified Talent
                </span>
                <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
                  {safeSeekers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToJobs) onNavigateToJobs();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition-all"
              >
                <span className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-rose-500" /> Job Openings
                </span>
                <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
                  Openings
                </span>
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onNavigateToMap}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Compass className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Explore Nearby on Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* CENTER / MAIN: INVITATIONS & PEOPLE YOU MAY KNOW */}
        {/* ========================================================== */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Pending Invitations Box (Only visible for authenticated users who have pending invitations) */}
          {Boolean(user && invitations.length > 0) && (
            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span>Invitations</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
                    {invitations.length} Pending
                  </span>
                </h3>
              </div>

              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all"
                  >
                    <div 
                      onClick={() => handleProfileClick(inv)}
                      className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={inv.avatar}
                          alt={inv.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 ring-2 ring-indigo-500/10 group-hover:ring-indigo-500/40 transition-all"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          inv.role === 'seeker' ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {inv.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{inv.title}</p>
                        <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                          {inv.mutual} mutual connections • {inv.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleIgnoreInvite(inv.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                      >
                        Ignore
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptInvite(inv)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Header */}
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Professional Network & Nearby Connections
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect, message, and collaborate with verified tech talent and hiring managers
                </p>
              </div>

              {/* Real-time search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, skill, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>All Professionals</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                  {safeSeekers.length + safeEmployers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('seekers')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'seekers'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Job Candidates (#OpenToWork)</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                  {safeSeekers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('employers')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'employers'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>Recruiters & Companies</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                  {safeEmployers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('connected')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'connected'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>My Connections</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                  {connectedUserIds.length}
                </span>
              </button>
            </div>
          </div>

          {/* People Grid */}
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 shadow-sm">
            {displayedPeople.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No connections match your search</h4>
                <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search keywords.</p>
                <button
                  type="button"
                  onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 hover:bg-indigo-100 transition-all"
                >
                  Reset Network Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
                {displayedPeople.map((person) => {
                  const isConnected = connectedUserIds.includes(person.id);
                  const isCandidate = person.role === 'seeker';

                  return (
                    <div
                      key={person.id}
                      className="bg-white/95 hover:bg-white backdrop-blur-2xl border border-slate-200/90 hover:border-indigo-400/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-[0_20px_40px_-8px_rgba(99,102,241,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      {/* Top luxury iridescent highlight hairline */}
                      <div className={`h-[3px] w-full ${
                        isCandidate 
                          ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500' 
                          : 'bg-gradient-to-r from-indigo-500 via-violet-400 to-cyan-400'
                      }`} />

                      {/* Cover photo header */}
                      <div className={`h-14 relative border-b border-slate-100 ${
                        isCandidate 
                          ? 'bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-emerald-50/70' 
                          : 'bg-gradient-to-r from-indigo-50/70 via-violet-50/50 to-indigo-50/70'
                      }`}>
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black border shadow-2xs tracking-wider uppercase ${
                          isCandidate 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {isCandidate ? '#OPENTOWORK' : '#HIRING'}
                        </span>
                      </div>

                      {/* Profile details */}
                      <div className="px-4 pb-4 -mt-8 flex flex-col items-center text-center flex-1">
                        <div 
                          onClick={() => handleProfileClick(person)}
                          className="relative mb-2 cursor-pointer group-hover:scale-105 transition-transform"
                        >
                          <img
                            src={person.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${person.name}`}
                            alt={person.name}
                            className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-md bg-white"
                          />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            person.isOnline !== false ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                        </div>

                        <h4 
                          onClick={() => handleProfileClick(person)}
                          className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
                        >
                          {person.name}
                        </h4>
                        <p className={`text-[11px] font-semibold mt-0.5 truncate max-w-full ${
                          isCandidate ? 'text-emerald-700' : 'text-indigo-600'
                        }`}>
                          {person.title || person.companyName || (isCandidate ? 'Software Engineer' : 'Talent Partner')}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 truncate max-w-full flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{person.address ? person.address.split(',')[0] : 'Mumbai, India'}</span>
                        </p>

                        {/* Verified Skills / Industry Chips */}
                        {(() => {
                          const parsed = Array.isArray(person.skills) 
                            ? person.skills 
                            : (typeof person.skills === 'string' && person.skills.trim() 
                                ? person.skills.split(',').map(s => s.trim()).filter(Boolean) 
                                : []);
                          return parsed.length > 0 ? (
                            <div className="flex flex-wrap gap-1 justify-center my-3 max-h-12 overflow-hidden">
                              {parsed.slice(0, 3).map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-white text-slate-700 border border-slate-200/90 shadow-xs"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="my-3 text-[10px] text-slate-400 italic">
                              {person.industry || 'Verified Professional'}
                            </div>
                          );
                        })()}

                        {/* Connect / Actions */}
                        <div className="w-full mt-auto space-y-1.5 pt-2 border-t border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => toggleConnect(person.id, person.name)}
                            className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isConnected
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs hover:bg-emerald-100'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                            }`}
                          >
                            {isConnected ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <UserPlus className="w-3.5 h-3.5" />}
                            <span>{isConnected ? 'Connected' : 'Connect'}</span>
                          </button>

                          {/* Direct Speed Connect Action Row (Audio, Video, Chat, Profile) */}
                          <div className="grid grid-cols-4 gap-1 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (!user) {
                                  if (onOpenAuth) onOpenAuth();
                                  return;
                                }
                                startCall(person, false);
                              }}
                              title="Voice Call"
                              className="py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-slate-200 shadow-xs flex items-center justify-center transition-colors active:scale-95"
                            >
                              <Phone className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!user) {
                                  if (onOpenAuth) onOpenAuth();
                                  return;
                                }
                                startCall(person, true);
                              }}
                              title="HD Video Call"
                              className="py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-slate-200 shadow-xs flex items-center justify-center transition-colors active:scale-95"
                            >
                              <Video className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!user) {
                                  if (onOpenAuth) onOpenAuth();
                                  return;
                                }
                                setActiveChatUser(person);
                              }}
                              title="Direct Message"
                              className="py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 shadow-xs flex items-center justify-center transition-colors active:scale-95"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleProfileClick(person)}
                              title="View Full Profile"
                              className="py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200 shadow-xs flex items-center justify-center transition-colors active:scale-95"
                            >
                              Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Companies Hiring in Your Area */}
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Top Companies & Employers Hiring Nearby
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Follow leading employers to get notified immediately when new openings drop on the map
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {safeEmployers.map((emp) => {
                const isFollowing = followingCompanyIds.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    className="p-4 bg-slate-50/80 border border-slate-200/80 hover:border-indigo-300 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-all"
                  >
                    <div 
                      onClick={() => handleProfileClick(emp)}
                      className="flex items-center gap-3 mb-3 cursor-pointer group"
                    >
                      <img
                        src={emp.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${emp.name}`}
                        alt={emp.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
                      />
                      <div className="truncate min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {emp.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">{emp.industry || 'Technology & Cloud'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{emp.address ? emp.address.split(',')[0] : 'Mumbai Tech Hub'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => toggleFollow(emp.id, emp.name)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            isFollowing
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs hover:bg-emerald-100'
                              : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 transition-colors shadow-xs'
                          }`}
                        >
                          {isFollowing ? '✓ Following' : '+ Follow'}
                        </button>

                        <button
                          type="button"
                          onClick={onNavigateToMap}
                          className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          <span>View on Map</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
