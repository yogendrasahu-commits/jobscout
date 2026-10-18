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
  ArrowLeft,
  Mail,
  Edit3,
  FileText
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { UpdateEmailModal } from './UpdateEmailModal';
import { ResumePreviewModal } from './ResumePreviewModal';

export const LinkedInProfileModal = ({ profileUser, isOpen, onClose }) => {
  const { user } = useAuth();
  const { startCall, setActiveChatUser } = useSocket();

  const [isConnected, setIsConnected] = useState(false);
  const [endorsedSkills, setEndorsedSkills] = useState({});
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

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
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] overflow-y-auto my-auto text-slate-900">
        
        {/* Top-Left Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 left-4 z-20 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 font-bold text-xs transition-all shadow-md border border-slate-200/90 flex items-center gap-1.5 active:scale-95 backdrop-blur-md"
          title="Back / Close Profile"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back (वापस)</span>
        </button>

        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 z-20 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 font-bold text-xs transition-all shadow-md border border-slate-200/90 flex items-center gap-1.5 active:scale-95 backdrop-blur-md"
          title="Close dialog"
        >
          <span className="hidden sm:inline">Close (बंद करें)</span>
          <X className="w-4 h-4" />
        </button>

        {/* Cover Photo */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 relative">
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-emerald-700 border border-emerald-200 shadow-sm">
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
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-xl bg-slate-100"
              />
              {isSeeker && (
                <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-emerald-600 border-2 border-white text-[9px] font-extrabold text-white tracking-wider shadow-md">
                  #OPENTOWORK
                </span>
              )}
              {isEmployer && (
                <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-indigo-600 border-2 border-white text-[9px] font-extrabold text-white tracking-wider shadow-md">
                  #HIRING
                </span>
              )}
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {user && user.id === profileUser.id ? (
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Your Verified Profile</span>
                  </span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsConnected(!isConnected)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isConnected ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{isConnected ? 'Connected' : 'Connect'}</span>
                  </button>

                  <button
                    onClick={handleChatMessage}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={handleVoiceCall}
                    title="Voice Call"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleVideoCall}
                    title="HD Video Call"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
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
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{profileUser.name}</h2>
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>

            <p className="text-sm font-semibold text-slate-600">
              {profileUser.title || profileUser.companyName || (isEmployer ? 'Technology & Cloud Solutions' : 'Full Stack Developer')}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {profileUser.address || 'Bandra Kurla Complex (BKC), Mumbai'}
              </span>
              <span>•</span>
              <span className="text-indigo-600 font-bold">500+ Connections</span>
              <span>•</span>
              <span className="text-slate-500">{profileUser.phone || '+91 98765 43210'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>{profileUser.email || (user?.id === profileUser.id ? 'No email linked' : 'Verified candidate')}</span>
              </span>
              {user && user.id === profileUser.id && (
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-all flex items-center gap-1 active:scale-95 ml-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Update Email (ईमेल बदलें)</span>
                </button>
              )}
            </div>
          </div>

          {/* Open To Work Card (If Seeker) */}
          {isSeeker && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">
                  Open to Work Preferences
                </span>
                <p className="text-xs font-bold text-slate-900">
                  Roles: {profileUser.title || 'Full Stack Engineer, React Developer'}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Availability: <strong className="text-emerald-700">{profileUser.availability || 'Immediate (Ready Today)'}</strong> • Expected: <strong className="text-slate-800">{profileUser.expectedSalary || '₹18,00,000 / yr'}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                  title="View & Print Verified CV"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>View CV (बायोडाटा)</span>
                </button>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200">
                  Active Candidate
                </span>
              </div>
            </div>
          )}

          {/* Hiring Notice (If Employer) */}
          {isEmployer && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200/90 rounded-2xl mb-5 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider block mb-1">
                  Actively Hiring in Mumbai & Remote
                </span>
                <p className="text-xs font-bold text-slate-900">
                  {profileUser.companyName || profileUser.name} is looking for Engineering & Design talent
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Industry: <strong className="text-indigo-700">{profileUser.industry || 'Technology & Cloud'}</strong> • Team Size: <strong className="text-slate-800">{profileUser.companySize || '50-200 Employees'}</strong>
                </p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-lg border border-indigo-200">
                Hiring Team
              </span>
            </div>
          )}

          {/* About / Summary Section */}
          <div className="mb-6">
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-2">About</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              {profileUser.bio || (isSeeker 
                ? "Results-oriented software engineer with expertise in building real-time collaboration tools, high-concurrency Node.js microservices, and interactive geospatial web applications with React and Leaflet."
                : "Leading technology enterprise specializing in high-performance cloud infrastructure, low-latency WebSockets, and real-time geospatial applications in India.")}
            </p>
          </div>

          {/* Verified Skills & Endorsements */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
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
                    className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center justify-between hover:border-indigo-300 hover:bg-white transition-all shadow-sm"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{skill}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <strong className="text-emerald-600">{count}</strong> endorsements
                      </p>
                    </div>

                    <button
                      onClick={() => handleEndorse(skill)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-[10px] font-bold border border-indigo-200 transition-all flex items-center gap-1 active:scale-95"
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
            <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-3">Experience</h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {profileUser.title || (isEmployer ? 'Talent Acquisition Director' : 'Senior Full-Stack Engineer')}
                  </h4>
                  <p className="text-[11px] text-indigo-600 font-semibold">{profileUser.companyName || 'Tech Innovations Lab'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">2023 - Present • 3 yrs • Mumbai BKC Hub</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Close Button */}
          <div className="pt-5 mt-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Verified JobScout professional profile
            </span>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Close Profile (बंद करें)</span>
            </button>
          </div>

        </div>

      </div>

      {isEmailModalOpen && (
        <UpdateEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          onUpdated={(newEmail) => {
            if (profileUser) profileUser.email = newEmail;
          }}
        />
      )}

      {isResumeModalOpen && (
        <ResumePreviewModal
          candidate={profileUser}
          isOpen={isResumeModalOpen}
          onClose={() => setIsResumeModalOpen(false)}
        />
      )}
    </div>
  );
};
