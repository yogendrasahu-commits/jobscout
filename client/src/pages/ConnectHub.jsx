import React, { useState } from 'react';
import { 
  Phone, 
  Video, 
  MessageSquare, 
  MapPin, 
  Radio, 
  Search, 
  UserCheck, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Building2, 
  Briefcase, 
  Flame, 
  Filter,
  Award,
  Zap,
  ArrowUpRight,
  Car
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const ConnectHub = ({ seekers = [], employers = [], jobs = [], onSelectSeeker, onSelectJob, onOpenProfile }) => {
  const { user, isEmployer } = useAuth();
  const { setActiveChatUser, startCall, startSelfTestCall, otherUserLocations } = useSocket();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'candidates' | 'employers' | 'online' | 'nearby'
  const [searchTerm, setSearchTerm] = useState('');

  // Combine both candidates and employers into a unified ready-to-call pool
  const allAvailableUsers = React.useMemo(() => {
    let pool = [];
    if (activeFilter === 'candidates') {
      pool = seekers;
    } else if (activeFilter === 'employers') {
      pool = employers;
    } else {
      // By default, prioritize the complementary role, followed by peers
      const primary = isEmployer ? seekers : employers;
      const secondary = isEmployer ? employers : seekers;
      pool = [...primary, ...secondary];
    }
    const seen = new Set();
    return pool.filter(item => {
      if (!item || String(item.id) === String(user?.id)) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [seekers, employers, isEmployer, user?.id, activeFilter]);

  const parseSkills = (skills) => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string' && skills.trim()) {
      return skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Filter & Search
  const filteredList = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allAvailableUsers.filter((item) => {
      const parsedSkills = parseSkills(item.skills);
      const matchesSearch = !q ||
        item.name?.toLowerCase().includes(q) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.companyName && item.companyName.toLowerCase().includes(q)) ||
        parsedSkills.some(s => s.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeFilter === 'online') return item.isOnline !== false;

      return true;
    });
  }, [allAvailableUsers, searchTerm, activeFilter]);

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner with Live Stats */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-indigo-50/40 to-white border border-slate-200/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3 shadow-xs">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              <span>Speed Connect Hub • WebRTC Voice & HD Video</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isEmployer ? 'Instant Candidate Match & Speed Interview' : 'Connect Directly With Nearby Recruiters'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {isEmployer
                ? 'Spot-call candidates nearby. Zero waiting time — connect via 1-click HD Video Call, Voice, or Live Chat.'
                : 'Browse verified hiring companies nearby. Call HR directly and fast-track your spot interview.'}
            </p>
          </div>

          {/* Quick Stats Badges & Test Call */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => startSelfTestCall(true)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl px-4 py-3 text-center shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex flex-col items-center justify-center min-w-[125px] group cursor-pointer border border-indigo-500"
              title="Test your webcam, microphone and live video calling UI"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Video className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span>Test Video Call</span>
              </div>
              <div className="text-[10px] text-indigo-200 mt-0.5">Echo / Hardware Test</div>
            </button>

            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl px-4 py-3 text-center min-w-[90px] shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-extrabold text-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{filteredList.length}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Ready to Call</div>
            </div>

            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl px-4 py-3 text-center min-w-[80px] shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-indigo-600 font-extrabold text-xl">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>0s</span>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Wait Time</div>
            </div>
          </div>
        </div>

        {/* Background glow effects */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={isEmployer ? "Search candidates by role, skills, name..." : "Search companies, recruiters, titles..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All Profiles (${seekers.length + employers.length - (user ? 1 : 0)})` },
            { id: 'candidates', label: `Candidates (${seekers.filter(s => s.id !== user?.id).length})` },
            { id: 'employers', label: `Recruiters (${employers.filter(e => e.id !== user?.id).length})` },
            { id: 'online', label: '🟢 Online Now' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* 3. Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
        {filteredList.map((target) => (
          <div
            key={target.id}
            className="group card-spotlight bg-white/95 hover:bg-white backdrop-blur-2xl border border-slate-200/90 hover:border-indigo-400/90 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-8px_rgba(99,102,241,0.16)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top iridescent hairline */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" />
            <div>
              {/* Header: Avatar, Name, Online Status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => onOpenProfile && onOpenProfile(target.id)}
                    className="relative cursor-pointer"
                  >
                    <img
                      src={target.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${target.name}`}
                      alt={target.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 bg-slate-100 group-hover:border-indigo-500 transition-colors shadow-2xs group-hover:scale-105"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-2xs"></span>
                    </span>
                  </div>
                  <div>
                    <h3 
                      onClick={() => onOpenProfile && onOpenProfile(target.id)}
                      className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      {target.name}
                    </h3>
                    <p className="text-xs text-indigo-600 font-bold truncate max-w-[180px]">
                      {target.title || target.companyName}
                    </p>
                  </div>
                </div>

                {/* Proximity commute tag */}
                <div className="text-right flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-2xs">
                    <Car className="w-3 h-3 text-indigo-600" />
                    <span>{target.distanceKm ? `~${Math.max(2, Math.round(target.distanceKm * 2.5))}m • ${target.distanceKm} km` : 'Active Nearby'}</span>
                  </span>
                </div>
              </div>

              {/* Address / Location */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{target.address || 'Mumbai, Maharashtra'}</span>
              </div>

              {/* Specific info: Skills or Company details */}
              {isEmployer ? (
                <div className="space-y-2 mb-4">
                  {/* Experience & Expected Salary */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block">Exp</span>
                      <strong className="text-slate-800">{target.experience || '2+ Yrs'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block">Expected</span>
                      <strong className="text-emerald-700">{target.expectedSalary || 'Negotiable'}</strong>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {parseSkills(target.skills).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {parseSkills(target.skills).slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded-md border border-slate-200 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Industry:</span>
                    <strong className="text-slate-800">{target.industry || 'Technology'}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Active Openings:</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {target.activeOpenings || 2} Jobs Open
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Connect Action Row */}
            <div className="pt-3.5 border-t border-slate-100/90 flex items-center gap-2">
              
              {/* Voice Call */}
              <button
                onClick={() => startCall(target, false)}
                title="Direct Voice Call"
                className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-extrabold text-xs border border-emerald-200/90 hover:border-emerald-600 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Voice</span>
              </button>

              {/* Video Call */}
              <button
                onClick={() => startCall(target, true)}
                title="Direct HD Video Call"
                className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Video className="w-3.5 h-3.5 text-cyan-200" />
                <span>Video Call</span>
              </button>

              {/* Direct Message Drawer */}
              <button
                onClick={() => setActiveChatUser(target)}
                title="Open Direct Chat"
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors active:scale-95 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
              </button>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
