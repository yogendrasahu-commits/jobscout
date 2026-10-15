import React, { useState, useEffect } from 'react';
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
  Radio,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const Network = ({ 
  seekers = [], 
  employers = [], 
  onSelectSeeker, 
  onSelectJob, 
  onNavigateToMap,
  onOpenProfile
}) => {
  const { user, isEmployer } = useAuth();
  const { startCall, setActiveChatUser } = useSocket();

  // Pending Invitations Simulation
  const [invitations, setInvitations] = useState([
    {
      id: 'inv_1',
      name: 'Rohan Sharma',
      title: 'Senior Full-Stack & React Engineer • BKC Mumbai',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'seeker',
      mutual: 14,
      targetUser: seekers[0] || null
    },
    {
      id: 'inv_2',
      name: 'TechPulse Solutions',
      title: 'Technology & Cloud Recruitment Lead',
      avatar: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150',
      role: 'emp',
      mutual: 8,
      targetUser: employers[0] || null
    },
    {
      id: 'inv_3',
      name: 'Priya Patel',
      title: 'Lead Product UI/UX Designer • Design Systems',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'seeker',
      mutual: 21,
      targetUser: seekers[1] || null
    }
  ]);

  // Connection states
  const [connectedUsers, setConnectedUsers] = useState({
    usr_seek_1: true
  });

  const [followingCompanies, setFollowingCompanies] = useState({});

  const handleAcceptInvite = (id) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
  };

  const handleIgnoreInvite = (id) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
  };

  const toggleConnect = (userId) => {
    setConnectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const toggleFollow = (companyId) => {
    setFollowingCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================== */}
        {/* LEFT COLUMN: MANAGE MY NETWORK */}
        {/* ========================================================== */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="bg-[#090d16]/85 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-2xl">
            <h3 className="font-extrabold text-sm text-white border-b border-white/[0.08] pb-3 mb-3">
              Manage My Network
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300 hover:text-indigo-400 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" /> Connections
                </span>
                <span className="font-bold text-slate-400">540</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 hover:text-indigo-400 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" /> Companies & Hubs
                </span>
                <span className="font-bold text-slate-400">38</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 hover:text-indigo-400 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Endorsed Skills
                </span>
                <span className="font-bold text-slate-400">24</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 hover:text-indigo-400 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-rose-400" /> Job Alerts
                </span>
                <span className="font-bold text-slate-400">8</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.08]">
              <button
                onClick={onNavigateToMap}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-400/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
                <span>Explore Nearby Radar</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* CENTER / MAIN: INVITATIONS & PEOPLE YOU MAY KNOW */}
        {/* ========================================================== */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Pending Invitations Box */}
          {invitations.length > 0 && (
            <div className="bg-[#090d16]/85 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>Invitations</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
                    {invitations.length} Pending
                  </span>
                </h3>
              </div>

              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-black/40 rounded-2xl border border-white/[0.06] hover:border-white/[0.14] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={inv.avatar}
                          alt={inv.name}
                          className="w-12 h-12 rounded-full object-cover border border-white/10 ring-2 ring-indigo-500/20"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#090d16] ${
                          inv.role === 'seeker' ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`} />
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white leading-tight">{inv.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{inv.title}</p>
                        <p className="text-[11px] text-indigo-400 font-semibold mt-0.5">
                          {inv.mutual} mutual connections
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleIgnoreInvite(inv.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        Ignore
                      </button>
                      <button
                        onClick={() => handleAcceptInvite(inv.id)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 border border-indigo-400/30 transition-all flex items-center gap-1"
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

          {/* People You May Know Grid */}
          <div className="bg-[#090d16]/85 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  People you may know based on your role
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Expand your professional network and explore talent in Mumbai BKC & nearby tech hubs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {seekers.map((seeker) => {
                const isConnected = connectedUsers[seeker.id];
                return (
                  <div
                    key={seeker.id}
                    className="bg-black/40 border border-white/[0.08] rounded-3xl overflow-hidden hover:border-white/[0.18] transition-all flex flex-col justify-between group"
                  >
                    {/* Cover photo */}
                    <div className="h-16 bg-gradient-to-r from-slate-800 via-indigo-900/60 to-slate-800 relative">
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-extrabold border border-emerald-500/30">
                        OPENTOWORK
                      </span>
                    </div>

                    {/* Profile details */}
                    <div className="px-4 pb-4 -mt-8 flex flex-col items-center text-center flex-1">
                      <div className="relative mb-2">
                        <img
                          src={seeker.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${seeker.name}`}
                          alt={seeker.name}
                          className="w-14 h-14 rounded-full border-2 border-slate-900 object-cover shadow-lg"
                        />
                      </div>

                      <h4 
                        onClick={() => onOpenProfile ? onOpenProfile(seeker.id) : onSelectSeeker(seeker)}
                        className="font-bold text-sm text-white group-hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {seeker.name}
                      </h4>
                      <p className="text-[11px] text-emerald-400 font-semibold mt-0.5 truncate max-w-full">
                        {seeker.title || 'Available Candidate'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 truncate max-w-full">
                        {seeker.address || 'Active Nearby'}
                      </p>

                      {/* Verified Skills chips */}
                      {(() => {
                        const parsed = Array.isArray(seeker.skills) 
                          ? seeker.skills 
                          : (typeof seeker.skills === 'string' && seeker.skills.trim() 
                              ? seeker.skills.split(',').map(s => s.trim()).filter(Boolean) 
                              : []);
                        return parsed.length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center my-3">
                            {parsed.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-slate-900 text-slate-300 border border-slate-800"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()}

                      {/* Connect / Actions */}
                      <div className="w-full mt-auto space-y-1.5 pt-2 border-t border-slate-900">
                        <button
                          onClick={() => toggleConnect(seeker.id)}
                          className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isConnected
                              ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                          }`}
                        >
                          {isConnected ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                          <span>{isConnected ? 'Connected' : 'Connect'}</span>
                        </button>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => startCall(seeker, false)}
                            className="py-1 bg-slate-900 hover:bg-slate-850 text-emerald-400 rounded-lg text-[10px] font-bold border border-slate-800 flex items-center justify-center gap-1"
                          >
                            <Phone className="w-2.5 h-2.5" /> Call
                          </button>
                          <button
                            onClick={() => onOpenProfile ? onOpenProfile(seeker.id) : onSelectSeeker(seeker)}
                            className="py-1 bg-slate-900 hover:bg-slate-850 text-indigo-300 rounded-lg text-[10px] font-bold border border-slate-800 flex items-center justify-center gap-1"
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
          </div>

          {/* Companies Hiring in Your Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="font-extrabold text-base text-white mb-1">
              Top Companies Hiring in Mumbai BKC & Nearby
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Follow leading employers to get notified immediately when new openings drop on the radar
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
              {employers.map((emp) => {
                const isFollowing = followingCompanies[emp.id];
                return (
                  <div
                    key={emp.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={emp.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${emp.name}`}
                        alt={emp.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-700"
                      />
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-white truncate">{emp.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{emp.industry || 'Technology & Cloud'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{emp.address ? emp.address.split(',')[0] : 'Mumbai BKC'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                        <button
                          onClick={() => toggleFollow(emp.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            isFollowing
                              ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30'
                              : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
                          }`}
                        >
                          {isFollowing ? '✓ Following' : '+ Follow'}
                        </button>

                        <button
                          onClick={onNavigateToMap}
                          className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <span>Radar</span>
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
