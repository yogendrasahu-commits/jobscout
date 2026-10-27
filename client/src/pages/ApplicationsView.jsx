import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Video, 
  MessageSquare, 
  User, 
  ExternalLink,
  Briefcase,
  Sparkles,
  Send,
  Mail,
  Edit3,
  Award,
  ArrowRight,
  ShieldCheck,
  Building,
  Settings,
  LayoutGrid,
  List,
  ChevronRight,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { IssueOfferModal } from '../components/IssueOfferModal';
import { ViewOfferLetterModal } from '../components/ViewOfferLetterModal';
import { ProfileEditModal } from '../components/ProfileEditModal';
import { ResumePreviewModal } from '../components/ResumePreviewModal';
import { EmailSettingsModal } from '../components/EmailSettingsModal';
import { playMessageChime, playSuccessChime } from '../utils/soundEffects';
import { calculateAIMatch } from '../utils/aiMatchEngine';
import { AIMatchBadge } from '../components/AIMatchBadge';
import { AIMatchModal } from '../components/AIMatchModal';

export const ApplicationsView = ({ 
  onOpenProfile, 
  onOpenAuth, 
  embedded = false, 
  onCountChange 
}) => {
  const { user, token, isEmployer } = useAuth();
  const { setActiveChatUser, startCall, socket } = useSocket();
  const [selectedMatchApp, setSelectedMatchApp] = useState(null);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));

  // Modal states
  const [selectedAppForOffer, setSelectedAppForOffer] = useState(null);
  const [selectedAppForView, setSelectedAppForView] = useState(null);
  const [selectedCandidateForCV, setSelectedCandidateForCV] = useState(null);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isEmailSettingsOpen, setIsEmailSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState(isEmployer ? 'kanban' : 'list');

  const KANBAN_STAGES = [
    { 
      id: 'pending', 
      label: 'New Applied', 
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
      accent: 'border-t-indigo-500', 
      filter: (a) => a.status === 'pending',
      nextStatus: 'reviewed', 
      nextLabel: 'Shortlist' 
    },
    { 
      id: 'reviewed', 
      label: 'Shortlisted', 
      badge: 'bg-sky-50 text-sky-700 border-sky-200', 
      accent: 'border-t-sky-500', 
      filter: (a) => a.status === 'reviewed',
      nextStatus: 'interview', 
      nextLabel: 'Interview' 
    },
    { 
      id: 'interview', 
      label: 'Interviewing', 
      badge: 'bg-violet-50 text-violet-700 border-violet-200', 
      accent: 'border-t-violet-500', 
      filter: (a) => a.status === 'interview' || a.status === 'accepted',
      nextStatus: 'offer_modal', 
      nextLabel: 'Issue Offer' 
    },
    { 
      id: 'offered', 
      label: 'Offer Dispatched', 
      badge: 'bg-amber-50 text-amber-800 border-amber-300', 
      accent: 'border-t-amber-500', 
      filter: (a) => a.status === 'offered',
      nextStatus: 'hired', 
      nextLabel: 'Mark Hired' 
    },
    { 
      id: 'hired', 
      label: 'Hired 🎉', 
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
      accent: 'border-t-emerald-500', 
      filter: (a) => a.status === 'hired',
      nextStatus: null, 
      nextLabel: null 
    },
    { 
      id: 'rejected', 
      label: 'Declined', 
      badge: 'bg-rose-50 text-rose-700 border-rose-200', 
      accent: 'border-t-rose-500', 
      filter: (a) => a.status === 'rejected',
      nextStatus: 'pending', 
      nextLabel: 'Reopen' 
    }
  ];

  const fetchApplications = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const endpoint = isEmployer ? '/api/applications/employer' : '/api/applications/my';
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.applications || [];
        setApplications(list);
        if (onCountChange) onCountChange(list.length);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token, isEmployer]);

  useEffect(() => {
    if (onCountChange) {
      onCountChange(applications.length);
    }
  }, [applications.length]);

  // Real-time synchronization for applications
  useEffect(() => {
    if (!socket) return;
    const handleNewApp = (newApp) => {
      if (isEmployer && newApp.employerId === user?.id) {
        setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
        playMessageChime();
      } else if (!isEmployer && newApp.seekerId === user?.id) {
        setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
        playMessageChime();
      }
    };

    const handleUpdatedApp = (updatedApp) => {
      setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
      if (selectedAppForView && selectedAppForView.id === updatedApp.id) {
        setSelectedAppForView(updatedApp);
      }
      if (updatedApp.status === 'offered' || updatedApp.status === 'hired') {
        playSuccessChime();
      }
    };

    socket.on('application:created', handleNewApp);
    socket.on('application:updated', handleUpdatedApp);

    return () => {
      socket.off('application:created', handleNewApp);
      socket.off('application:updated', handleUpdatedApp);
    };
  }, [socket, isEmployer, user, selectedAppForView]);

  const updateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplications(prev =>
          prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a))
        );
        if (newStatus === 'hired' || newStatus === 'offered') {
          playSuccessChime();
        }
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  const handleOfferDispatched = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    setSelectedAppForOffer(null);
    playSuccessChime();
  };

  const handleOfferAccepted = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    setSelectedAppForView(updatedApp);
    playSuccessChime();
  };

  const handleOfferDeclined = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    setSelectedAppForView(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hired':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Officially Hired (नियुक्त)</span>
          </span>
        );
      case 'offered':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-300 shadow-xs animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Offer Dispatched (ऑफर लेटर भेजा)</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Accepted (स्वीकृत)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Declined (अस्वीकृत)</span>
          </span>
        );
      case 'reviewed':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Under Review (समीक्षा में)</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending (प्रतीक्षारत)</span>
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className={embedded ? 'w-full py-4' : 'max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8'}>
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
          <FileText className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Sign In to View Applications</h3>
          <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto leading-relaxed">
            Please sign in to track your applied positions, view hiring status updates, receive offer letters, and connect with employers.
          </p>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              Sign In to JobScout
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? 'w-full' : 'max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8'}>
      
      {/* Title & Email Sync Header Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEmployer ? 'Candidate Applications & Hiring' : 'My Job Applications & Offers'}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 border border-slate-200">
              {applications.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isEmployer
              ? 'Review candidate profiles, schedule interviews, and issue official offer letters directly to candidate email.'
              : 'Track applications, receive official offer letters in your email inbox, and accept job offers with one click.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher: Pipeline Board vs List View */}
          <div className="flex items-center p-1 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pipeline Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table List</span>
            </button>
          </div>

          {/* Profile Email Indicator with Update Button */}
          <div className="flex items-center gap-2.5 p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 pr-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                {isEmployer ? 'Your Employer Email:' : 'Your Inbox for Offers:'}
              </span>
              <span className="text-xs font-bold text-slate-900 truncate max-w-[170px] sm:max-w-[220px] block mt-0.5">
                {user.email || <span className="text-amber-600 italic">No email linked</span>}
              </span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => setIsEmailSettingsOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[11px] font-bold border border-indigo-200 transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap shadow-xs"
                title="Configure Real Gmail Delivery"
              >
                <Settings className="w-3 h-3" />
                <span>Email SMTP Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setIsProfileEditOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[11px] font-bold border border-emerald-200 transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap shadow-xs"
                title="Edit Profile"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {isEmployer ? 'No Candidate Applications Yet' : 'No Submitted Applications'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isEmployer
              ? 'When candidates apply to your job postings on the map, their profiles will appear here for review and offer letter issuance.'
              : 'Explore the live map to discover nearby opportunities, submit applications, and receive direct offer letters!'}
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start custom-scrollbar">
          {KANBAN_STAGES.map((stage) => {
            const stageApps = applications.filter(stage.filter);
            return (
              <div
                key={stage.id}
                className="min-w-[300px] max-w-[320px] flex-1 flex-shrink-0 bg-slate-50/90 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b border-slate-200/80 flex items-center justify-between rounded-t-2xl border-t-4 ${stage.accent} bg-white`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{stage.label}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${stage.badge}`}>
                      {stageApps.length}
                    </span>
                  </div>
                  {stage.id === 'hired' && (
                    <span className="text-xs">🏆</span>
                  )}
                  {stage.id === 'offered' && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  )}
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 min-h-[160px] max-h-[calc(100vh-270px)] overflow-y-auto">
                  {stageApps.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl text-slate-400">
                      <p className="text-[11px] font-medium">No candidates in this stage</p>
                    </div>
                  ) : (
                    stageApps.map((app) => {
                      const isAppOffered = app.status === 'offered';
                      const isAppHired = app.status === 'hired';
                      const isAppAccepted = app.status === 'accepted';

                      return (
                        <div
                          key={app.id}
                          className={`bg-white rounded-xl p-3.5 border shadow-xs transition-all hover:shadow-md ${
                            isAppOffered 
                              ? 'border-amber-300 ring-1 ring-amber-400/20' 
                              : isAppHired 
                              ? 'border-emerald-300 ring-1 ring-emerald-400/20' 
                              : 'border-slate-200/90 hover:border-indigo-300'
                          }`}
                        >
                          {/* Candidate / Job Title Header */}
                          <div className="mb-2">
                            <div className="flex items-start justify-between gap-1.5 mb-1">
                              <span className="text-xs font-bold text-indigo-600 line-clamp-1">{app.jobTitle}</span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {isEmployer && (
                                  <AIMatchBadge
                                    matchResult={calculateAIMatch(
                                      {
                                        skills: app.seekerSkills || ['React', 'JavaScript', 'Node.js', 'Tailwind CSS'],
                                        title: app.seekerTitle || app.jobTitle,
                                        bio: app.coverNote || ''
                                      },
                                      {
                                        title: app.jobTitle,
                                        skills: app.jobSkills || ['React', 'WebSockets', 'Node.js']
                                      }
                                    )}
                                    compact={true}
                                    onClick={() => {
                                      const jobObj = {
                                        title: app.jobTitle,
                                        skills: app.jobSkills || ['React', 'WebSockets', 'Node.js'],
                                        company: user?.companyName || user?.name || 'Your Company'
                                      };
                                      const candObj = {
                                        name: app.seekerName,
                                        skills: app.seekerSkills || ['React', 'JavaScript', 'Node.js', 'Tailwind CSS'],
                                        title: app.seekerTitle || app.jobTitle,
                                        bio: app.coverNote || ''
                                      };
                                      setSelectedMatchApp({
                                        job: jobObj,
                                        matchResult: calculateAIMatch(candObj, jobObj)
                                      });
                                    }}
                                  />
                                )}
                                {app.jobSalary && (
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                                    {app.jobSalary}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              onClick={() => onOpenProfile && onOpenProfile(isEmployer ? app.seekerId : app.employerId)}
                              className="flex items-center gap-2 cursor-pointer group mt-1.5"
                              title="Click to view profile"
                            >
                              <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-400">
                                {app.seekerAvatar ? (
                                  <img src={app.seekerAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 truncate flex items-center gap-1">
                                  {isEmployer ? app.seekerName : app.employerName}
                                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {isEmployer ? (app.seekerEmail || 'Verified candidate') : 'Hiring Employer'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Cover Note Snippet */}
                          {app.coverNote && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2 my-2 italic leading-relaxed">
                              "{app.coverNote}"
                            </p>
                          )}

                          {/* Quick Connect Bar */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  startCall(
                                    {
                                      id: isEmployer ? app.seekerId : app.employerId,
                                      name: isEmployer ? app.seekerName : app.employerName,
                                      avatar: app.seekerAvatar
                                    },
                                    false
                                  )
                                }
                                title="Voice Call"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  startCall(
                                    {
                                      id: isEmployer ? app.seekerId : app.employerId,
                                      name: isEmployer ? app.seekerName : app.employerName,
                                      avatar: app.seekerAvatar
                                    },
                                    true
                                  )
                                }
                                title="Video Call"
                                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                              >
                                <Video className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  setActiveChatUser({
                                    id: isEmployer ? app.seekerId : app.employerId,
                                    name: isEmployer ? app.seekerName : app.employerName,
                                    avatar: app.seekerAvatar
                                  })
                                }
                                title="Direct Chat"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedCandidateForCV({
                                    id: isEmployer ? app.seekerId : app.employerId,
                                    name: isEmployer ? app.seekerName : app.employerName,
                                    avatar: app.seekerAvatar,
                                    title: app.jobTitle,
                                    experience: '3.5+ Years Verified',
                                    expectedSalary: app.salary || 'Competitive',
                                    skills: ['Fullstack Architecture', 'React & Node.js', 'System Design', 'Problem Solving'],
                                    bio: app.coverLetter || 'Results-driven professional with verified credentials and identity on JobScout.',
                                    email: app.seekerEmail || 'verified.candidate@jobscout.io',
                                    phone: app.seekerPhone || '9876543210',
                                    address: app.jobLocation || 'Mumbai, India'
                                  })
                                }
                                title="Candidate CV"
                                className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[10px] text-slate-400">
                              {new Date(app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          {/* Pipeline Advancement Buttons */}
                          <div className="pt-2.5 mt-2 border-t border-slate-100">
                            {isEmployer ? (
                              <div className="flex items-center gap-1.5">
                                {stage.nextStatus === 'offer_modal' ? (
                                  <button
                                    onClick={() => setSelectedAppForOffer(app)}
                                    className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-xs flex items-center justify-center gap-1 active:scale-95"
                                  >
                                    <Sparkles className="w-3 h-3 text-emerald-200" />
                                    <span>Issue Offer Letter</span>
                                  </button>
                                ) : stage.nextStatus ? (
                                  <button
                                    onClick={() => updateStatus(app.id, stage.nextStatus)}
                                    className="flex-1 py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-xs flex items-center justify-center gap-1 active:scale-95"
                                  >
                                    <span>{stage.nextLabel}</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                ) : null}

                                {(isAppOffered || isAppHired) && (
                                  <button
                                    onClick={() => setSelectedAppForView(app)}
                                    className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold"
                                    title="View Offer Letter"
                                  >
                                    <FileText className="w-3 h-3" />
                                  </button>
                                )}

                                {app.status !== 'rejected' && app.status !== 'hired' && (
                                  <button
                                    onClick={() => updateStatus(app.id, 'rejected')}
                                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-[11px]"
                                    title="Decline Candidate"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div>
                                {isAppOffered ? (
                                  <button
                                    onClick={() => setSelectedAppForView(app)}
                                    className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] shadow-xs flex items-center justify-center gap-1 active:scale-95 animate-pulse"
                                  >
                                    <Sparkles className="w-3 h-3 text-emerald-200" />
                                    <span>Review & Sign Offer ➔</span>
                                  </button>
                                ) : isAppHired ? (
                                  <button
                                    onClick={() => setSelectedAppForView(app)}
                                    className="w-full py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] flex items-center justify-center gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    <span>View Signed Contract</span>
                                  </button>
                                ) : (
                                  <div className="text-[10px] text-center font-medium text-slate-500 py-1 bg-slate-50 rounded-lg">
                                    {app.status === 'reviewed' ? 'Recruiter shortlisted your profile' : 'Under recruiter review'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isAppOffered = app.status === 'offered';
            const isAppHired = app.status === 'hired';
            const isAppAccepted = app.status === 'accepted';

            return (
              <div
                key={app.id}
                className={`bg-white/95 backdrop-blur-2xl border rounded-2xl p-5 shadow-sm transition-all ${
                  isAppOffered 
                    ? 'border-amber-400 ring-1 ring-amber-400/30 shadow-[0_4px_20px_rgba(245,158,11,0.12)]' 
                    : isAppHired
                    ? 'border-emerald-400 ring-1 ring-emerald-400/30 shadow-[0_4px_20px_rgba(16,185,129,0.12)]'
                    : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Candidate / Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-indigo-600">{app.jobTitle}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500">
                        Applied on {new Date(app.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {app.jobSalary && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-semibold text-emerald-700">{app.jobSalary}</span>
                        </>
                      )}
                    </div>

                    <div 
                      onClick={() => onOpenProfile && onOpenProfile(isEmployer ? app.seekerId : app.employerId)}
                      className="flex items-center gap-2.5 mb-2 cursor-pointer group w-fit"
                      title="Click to view full profile"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                        {app.seekerAvatar ? (
                          <img src={app.seekerAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                          {isEmployer ? app.seekerName : app.employerName}
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{isEmployer ? (app.seekerEmail || 'Email unverified') : 'Hiring Company'}</span>
                          {app.seekerPhone && (
                            <>
                              <span>•</span>
                              <span>+91 {app.seekerPhone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {app.coverNote && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed max-w-xl">
                        "{app.coverNote}"
                      </p>
                    )}
                  </div>

                  {/* Status & Instant Action Buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {getStatusBadge(app.status)}

                    {/* Instant Connect Buttons (Voice, Video, Chat) */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          startCall(
                            {
                              id: isEmployer ? app.seekerId : app.employerId,
                              name: isEmployer ? app.seekerName : app.employerName,
                              avatar: app.seekerAvatar
                            },
                            false
                          )
                        }
                        title="Voice Call"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-xs"
                      >
                        <Phone className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          startCall(
                            {
                              id: isEmployer ? app.seekerId : app.employerId,
                              name: isEmployer ? app.seekerName : app.employerName,
                              avatar: app.seekerAvatar
                            },
                            true
                          )
                        }
                        title="Video Call"
                        className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-xs"
                      >
                        <Video className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          setActiveChatUser({
                            id: isEmployer ? app.seekerId : app.employerId,
                            name: isEmployer ? app.seekerName : app.employerName,
                            avatar: app.seekerAvatar
                          })
                        }
                        title="Open Direct Chat"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-xs"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* View & Print Candidate CV Button */}
                      <button
                        onClick={() =>
                          setSelectedCandidateForCV({
                            id: isEmployer ? app.seekerId : app.employerId,
                            name: isEmployer ? app.seekerName : app.employerName,
                            avatar: app.seekerAvatar,
                            title: app.jobTitle,
                            experience: '3.5+ Years Verified',
                            expectedSalary: app.salary || 'Competitive',
                            skills: ['Fullstack Architecture', 'React & Node.js', 'System Design', 'Problem Solving'],
                            bio: app.coverLetter || 'Results-driven professional with verified credentials and identity on JobScout.',
                            email: app.seekerEmail || 'verified.candidate@jobscout.io',
                            phone: app.seekerPhone || '9876543210',
                            address: app.jobLocation || 'Mumbai, India'
                          })
                        }
                        title="View & Download Professional CV (बायोडाटा)"
                        className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shadow-xs"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Employer Review / Accept / Issue Offer Workflow */}
                    {isEmployer && (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Initial state: Pending or Reviewed */}
                        {(app.status === 'pending' || app.status === 'reviewed') && (
                          <>
                            <button
                              onClick={() => updateStatus(app.id, 'accepted')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm active:scale-95"
                            >
                              Accept Application
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'rejected')}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold border border-slate-200 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* When Accepted: Show prominent 'Issue Offer Letter & Hire' Button */}
                        {isAppAccepted && (
                          <button
                            onClick={() => setSelectedAppForOffer(app)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <Sparkles className="w-4 h-4 text-emerald-200" />
                            <span>Issue Offer Letter & Hire (ऑफर भेजें)</span>
                          </button>
                        )}

                        {/* When Offered or Hired: Show 'View Issued Offer' Button */}
                        {(isAppOffered || isAppHired) && (
                          <button
                            onClick={() => setSelectedAppForView(app)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{isAppHired ? 'View Signed Offer' : 'View Dispatched Offer'}</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>

                </div>

                {/* Seeker Perspective Special Interactive Banners */}
                {!isEmployer && (
                  <>
                    {/* 1. When Offer Letter is Received */}
                    {isAppOffered && (
                      <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50/50 to-indigo-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex-shrink-0 mt-0.5">
                            <Sparkles className="w-5 h-5 text-amber-600 animate-bounce" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900">
                              🎉 Congratulations! Formal Offer Letter Received
                            </h4>
                            <p className="text-xs text-slate-700 mt-0.5">
                              Role: <strong className="text-slate-900">{app.offerLetter?.designation || app.jobTitle}</strong> • CTC: <strong className="text-emerald-700">{app.offerLetter?.salary || app.jobSalary || 'Competitive'}</strong>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              An official copy has also been dispatched to your email ({app.seekerEmail || user.email}).
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedAppForView(app)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View & Accept Offer Letter (ऑफर देखें)</span>
                        </button>
                      </div>
                    )}

                    {/* 2. When Officially Hired */}
                    {isAppHired && (
                      <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex-shrink-0">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900">
                              🏆 You are Officially Hired! (नियुक्ति पूर्ण)
                            </h4>
                            <p className="text-xs text-slate-700 mt-0.5">
                              Joined as <strong>{app.offerLetter?.designation || app.jobTitle}</strong> at <strong>{app.employerName}</strong>.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedAppForView(app)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Download / Print Letter (प्रिंट करें)</span>
                        </button>
                      </div>
                    )}

                    {/* 3. When Application is Accepted but Offer Letter Pending */}
                    {isAppAccepted && (
                      <div className="mt-3 p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span>
                          आवेदन नियोक्ता द्वारा स्वीकृत कर लिया गया है। नियोक्ता द्वारा जल्द ही आपके ईमेल पर औपचारिक ऑफर लेटर जारी किया जाएगा।
                        </span>
                      </div>
                    )}
                  </>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* 1. Modal for Employer to Issue Formal Offer Letter */}
      {selectedAppForOffer && (
        <IssueOfferModal
          application={selectedAppForOffer}
          isOpen={Boolean(selectedAppForOffer)}
          onClose={() => setSelectedAppForOffer(null)}
          onSuccess={handleOfferDispatched}
        />
      )}

      {/* 2. Modal for Candidate/Employer to View, Print & Accept Offer Letter */}
      {selectedAppForView && (
        <ViewOfferLetterModal
          application={selectedAppForView}
          isOpen={Boolean(selectedAppForView)}
          onClose={() => setSelectedAppForView(null)}
          onAccepted={handleOfferAccepted}
          onDeclined={handleOfferDeclined}
        />
      )}

      {/* 3. Modal to Edit User Profile */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
      />

      {/* 5. Modal to Preview Candidate CV */}
      {selectedCandidateForCV && (
        <ResumePreviewModal
          candidate={selectedCandidateForCV}
          isOpen={Boolean(selectedCandidateForCV)}
          onClose={() => setSelectedCandidateForCV(null)}
        />
      )}

      {/* 6. Modal for Email Delivery & SMTP Settings */}
      <EmailSettingsModal
        isOpen={isEmailSettingsOpen}
        onClose={() => setIsEmailSettingsOpen(false)}
      />

      {/* 7. Modal for AI Candidate Skill Gap Breakdown */}
      {selectedMatchApp && (
        <AIMatchModal
          isOpen={Boolean(selectedMatchApp)}
          onClose={() => setSelectedMatchApp(null)}
          job={selectedMatchApp.job}
          matchResult={selectedMatchApp.matchResult}
        />
      )}

    </div>
  );
};
