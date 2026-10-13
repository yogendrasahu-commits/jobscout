import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Briefcase, 
  Phone, 
  Video, 
  MessageSquare, 
  Award, 
  Sparkles, 
  Check, 
  UserPlus, 
  Building, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  Share2,
  ThumbsUp,
  Download
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export const LinkedInProfileModal = ({ profileUser, isOpen, onClose }) => {
  const { user } = useAuth();
  const { startCall, setActiveChatUser } = useSocket();

  const [isConnected, setIsConnected] = useState(false);
  const [endorsedSkills, setEndorsedSkills] = useState({});

  if (!isOpen || !profileUser) return null;

  const isSeeker = profileUser.role === 'seeker';
  const isEmployer = profileUser.role === 'emp';

  const handleVoiceCall = () => {
    startCall(profileUser, false);
    onClose();
  };

  const handleVideoCall = () => {
    startCall(profileUser, true);
    onClose();
  };

  const handleChatMessage = () => {
    setActiveChatUser(profileUser);
    onClose();
  };

  const handleEndorse = (skill) => {
    setEndorsedSkills(prev => ({
      ...prev,
      [skill]: (prev[skill] || 0) + 1
    }));
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] overflow-y-auto my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Photo */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-indigo-900 via-indigo-700 to-emerald-800 relative">
          <div className="absolute top-3 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-white/10">
              Verified Professional
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-5 sm:px-8 pb-8 pt-0">
          
          {/* Avatar & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="relative">
              <img
                src={profileUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profileUser.name}`}
                alt={profileUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-900 object-cover shadow-2xl bg-slate-800"
              />
              {isSeeker && (
                <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-emerald-600 border-2 border-slate-900 text-[9px] font-extrabold text-white tracking-wider shadow-lg">
                  #OPENTOWORK
                </span>
              )}
              {isEmployer && (
                <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-indigo-600 border-2 border-slate-900 text-[9px] font-extrabold text-white tracking-wider shadow-lg">
                  #HIRING
                </span>
              )}
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {user && user.id === profileUser.id ? (
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Your Verified Profile</span>
                  </span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsConnected(!isConnected)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                      isConnected
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isConnected ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{isConnected ? 'Connected' : 'Connect'}</span>
                  </button>

                  <button
                    onClick={handleChatMessage}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={handleVoiceCall}
                    title="Voice Call"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleVideoCall}
                    title="HD Video Call"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Name & Headline */}
          <div className="space-y-1 mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{profileUser.name}</h2>
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>

            <p className="text-sm font-semibold text-slate-300">
              {profileUser.title || profileUser.companyName || (isEmployer ? 'Technology & Cloud Solutions' : 'Full Stack Developer')}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {profileUser.address || 'Bandra Kurla Complex (BKC), Mumbai'}
              </span>
              <span>•</span>
              <span className="text-indigo-400 font-bold">500+ Connections</span>
              <span>•</span>
              <span className="text-slate-400">{profileUser.phone || '+91 98765 43210'}</span>
            </div>
          </div>

          {/* Open To Work Card (If Seeker) */}
          {isSeeker && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl mb-5 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
                  Open to Work Preferences
                </span>
                <p className="text-xs font-bold text-white">
                  Roles: {profileUser.title || 'Full Stack Engineer, React Developer'}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Availability: <strong className="text-emerald-400">{profileUser.availability || 'Immediate (Ready Today)'}</strong> • Expected: <strong className="text-slate-200">{profileUser.expectedSalary || '₹18,00,000 / yr'}</strong>
                </p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-500/30">
                Active Candidate
              </span>
            </div>
          )}

          {/* Hiring Notice (If Employer) */}
          {isEmployer && (
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl mb-5 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block mb-1">
                  Actively Hiring in Mumbai & Remote
                </span>
                <p className="text-xs font-bold text-white">
                  {profileUser.companyName || profileUser.name} is looking for Engineering & Design talent
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Industry: <strong className="text-indigo-300">{profileUser.industry || 'Technology & Cloud'}</strong> • Team Size: <strong className="text-slate-200">{profileUser.companySize || '50-200 Employees'}</strong>
                </p>
              </div>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-lg border border-indigo-500/30">
                Hiring Team
              </span>
            </div>
          )}

          {/* About / Summary Section */}
          <div className="mb-6">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-2">About</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {profileUser.bio || (isSeeker 
                ? "Results-oriented software engineer with expertise in building real-time collaboration tools, high-concurrency Node.js microservices, and interactive geospatial web applications with React and Leaflet."
                : "Leading technology enterprise specializing in high-performance cloud infrastructure, low-latency WebSockets, and real-time geospatial applications in India.")}
            </p>
          </div>

          {/* Verified Skills & Endorsements */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                Skills & Endorsements
              </h3>
              <span className="text-[11px] text-slate-500">1-click to endorse</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Array.isArray(profileUser.skills) && profileUser.skills.length > 0 
                ? profileUser.skills 
                : (typeof profileUser.skills === 'string' && profileUser.skills.trim()
                    ? profileUser.skills.split(',').map(s => s.trim()).filter(Boolean)
                    : (isEmployer 
                        ? ['Talent Acquisition', 'Team Leadership', 'Technical Recruiting', 'Strategic Hiring'] 
                        : ['React', 'JavaScript', 'Node.js', 'WebSockets', 'Tailwind CSS']))
              ).map((skill, idx) => {
                const count = (endorsedSkills[skill] || 0) + (idx * 3 + 2);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-indigo-500/40 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white">{skill}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        <strong className="text-emerald-400">{count}</strong> endorsements
                      </p>
                    </div>

                    <button
                      onClick={() => handleEndorse(skill)}
                      className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[10px] font-bold border border-indigo-500/30 transition-all flex items-center gap-1"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Endorse</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience Section */}
          <div>
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-3">Experience</h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">
                    {profileUser.title || (isEmployer ? 'Talent Acquisition Director' : 'Senior Full-Stack Engineer')}
                  </h4>
                  <p className="text-[11px] text-indigo-400">{profileUser.companyName || 'Tech Innovations Lab'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">2023 - Present • 3 yrs • Mumbai BKC Hub</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
