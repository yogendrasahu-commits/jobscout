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
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const ConnectHub = ({ seekers = [], employers = [], jobs = [], onSelectSeeker, onSelectJob, onOpenProfile }) => {
  const { user, isEmployer } = useAuth();
  const { setActiveChatUser, startCall, otherUserLocations } = useSocket();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'online' | 'verified' | 'nearby'
  const [searchTerm, setSearchTerm] = useState('');

  // If Employer: connect targets are Job Seekers (filtered out self)
  // If Seeker: connect targets are Employers/Recruiters (filtered out self)
  const rawList = isEmployer ? seekers : employers;
  const connectList = rawList.filter(item => item.id !== user?.id);

  const parseSkills = (skills) => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string' && skills.trim()) {
      return skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Filter & Search
  const filteredList = connectList.filter((item) => {
    const q = searchTerm.toLowerCase();
    const parsedSkills = parseSkills(item.skills);
    const matchesSearch = 
      item.name.toLowerCase().includes(q) ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.companyName && item.companyName.toLowerCase().includes(q)) ||
      parsedSkills.some(s => s.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeFilter === 'online') return item.isOnline !== false;
    if (activeFilter === 'nearby') return item.distanceKm ? item.distanceKm <= 5 : true;

    return true;
  });

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner with Live Stats */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#090d16]/95 via-indigo-950/30 to-[#090d16]/95 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold mb-3 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Speed Connect Hub • WebRTC Voice & HD Video</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isEmployer ? 'Instant Candidate Match & Speed Interview' : 'Connect Directly With Nearby Recruiters'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {isEmployer
                ? 'Spot-call candidates on radar. Zero waiting time — connect via 1-click HD Video Call, Voice, or Live Chat.'
                : 'Browse verified hiring companies nearby. Call HR directly and fast-track your spot interview.'}
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-[#090d16]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-4 py-3 text-center min-w-[100px] shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-extrabold text-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>{filteredList.length}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Ready to Call</div>
            </div>

            <div className="bg-[#090d16]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-4 py-3 text-center min-w-[100px] shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-indigo-400 font-extrabold text-xl">
                <Zap className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <span>0s</span>
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Wait Time</div>
            </div>
          </div>
        </div>

        {/* Background glow effects */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-[#090d16]/85 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 mb-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={isEmployer ? "Search candidates by role, skills, name..." : "Search companies, recruiters, titles..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.08] hover:border-white/[0.16] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Profiles' },
            { id: 'online', label: '🟢 Online Now' },
            { id: 'nearby', label: '📍 Within 5 km' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)] border border-indigo-400/30'
                  : 'bg-black/40 text-slate-400 hover:text-white border border-white/[0.08]'
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
            className="group bg-[#090d16]/85 hover:bg-[#0c121e]/95 backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.18] rounded-3xl p-5 shadow-2xl hover:shadow-[0_15px_30px_rgba(99,102,241,0.15)] transition-all flex flex-col justify-between"
          >
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
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 hover:border-indigo-400 transition-colors"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                  </div>
                  <div>
                    <h3 
                      onClick={() => onOpenProfile && onOpenProfile(target.id)}
                      className="font-bold text-base text-white hover:text-indigo-300 cursor-pointer transition-colors"
                    >
                      {target.name}
                    </h3>
                    <p className="text-xs text-indigo-400 font-semibold truncate max-w-[180px]">
                      {target.title || target.companyName}
                    </p>
                  </div>
                </div>

                {/* Radar distance tag */}
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {target.distanceKm ? `${target.distanceKm} km away` : 'Active Nearby'}
                  </span>
                </div>
              </div>

              {/* Address / Location */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="truncate">{target.address || 'Mumbai, Maharashtra'}</span>
              </div>

              {/* Specific info: Skills or Company details */}
              {isEmployer ? (
                <div className="space-y-2 mb-4">
                  {/* Experience & Expected Salary */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-black/40 rounded-xl border border-white/[0.08]">
                      <span className="text-[10px] text-slate-500 uppercase block">Exp</span>
                      <strong className="text-slate-200">{target.experience || '2+ Yrs'}</strong>
                    </div>
                    <div className="p-2 bg-black/40 rounded-xl border border-white/[0.08]">
                      <span className="text-[10px] text-slate-500 uppercase block">Expected</span>
                      <strong className="text-emerald-400">{target.expectedSalary || 'Negotiable'}</strong>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {parseSkills(target.skills).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {parseSkills(target.skills).slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] bg-white/[0.04] text-slate-300 rounded-md border border-white/[0.06]">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.08] flex items-center justify-between text-xs">
                    <span className="text-slate-400">Industry:</span>
                    <strong className="text-slate-200">{target.industry || 'Technology'}</strong>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.08] flex items-center justify-between text-xs">
                    <span className="text-slate-400">Active Openings:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {target.activeOpenings || 2} Jobs Open
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Connect Action Row */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
              
              {/* Voice Call */}
              <button
                onClick={() => startCall(target, false)}
                title="Direct Voice Call"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Voice</span>
              </button>

              {/* Video Call */}
              <button
                onClick={() => startCall(target, true)}
                title="Direct HD Video Call"
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Call</span>
              </button>

              {/* Direct Message Drawer */}
              <button
                onClick={() => setActiveChatUser(target)}
                title="Open Direct Chat"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
