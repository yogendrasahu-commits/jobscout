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
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { IssueOfferModal } from '../components/IssueOfferModal';
import { ViewOfferLetterModal } from '../components/ViewOfferLetterModal';
import { UpdateEmailModal } from '../components/UpdateEmailModal';

export const ApplicationsView = ({ 
  onOpenProfile, 
  onOpenAuth, 
  embedded = false, 
  onCountChange 
}) => {
  const { user, token, isEmployer } = useAuth();
  const { setActiveChatUser, startCall, socket } = useSocket();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));

  // Modal states
  const [selectedAppForOffer, setSelectedAppForOffer] = useState(null);
  const [selectedAppForView, setSelectedAppForView] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

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
      } else if (!isEmployer && newApp.seekerId === user?.id) {
        setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
      }
    };

    const handleUpdatedApp = (updatedApp) => {
      setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
      if (selectedAppForView && selectedAppForView.id === updatedApp.id) {
        setSelectedAppForView(updatedApp);
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
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  const handleOfferDispatched = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    setSelectedAppForOffer(null);
  };

  const handleOfferAccepted = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    setSelectedAppForView(updatedApp);
  };

  const handleOfferDeclined = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    setSelectedAppForView(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hired':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Officially Hired (नियुक्त)</span>
          </span>
        );
      case 'offered':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Offer Dispatched (ऑफर लेटर भेजा)</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-teal-300 bg-teal-500/15 px-3 py-1 rounded-xl border border-teal-500/30">
            <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Accepted (स्वीकृत)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Declined (अस्वीकृत)</span>
          </span>
        );
      case 'reviewed':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review (समीक्षा में)</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending (प्रतीक्षारत)</span>
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className={embedded ? 'w-full py-4' : 'max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8'}>
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto shadow-xl">
          <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Sign In to View Applications</h3>
          <p className="text-xs text-slate-400 mb-5 max-w-sm mx-auto leading-relaxed">
            Please sign in to track your applied positions, view hiring status updates, receive offer letters, and connect with employers.
          </p>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{isEmployer ? 'Candidate Applications & Hiring' : 'My Job Applications & Offers'}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
              {applications.length}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isEmployer
              ? 'Review candidate profiles, schedule interviews, and issue official offer letters directly to candidate email.'
              : 'Track applications, receive official offer letters in your email inbox, and accept job offers with one click.'}
          </p>
        </div>

        {/* Profile Email Indicator with Update Button */}
        <div className="flex items-center gap-2.5 p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0 pr-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
              Your Inbox for Offers:
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-[220px] block mt-0.5">
              {user.email || <span className="text-amber-400 italic">No email linked</span>}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-bold border border-indigo-500/40 transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap ml-auto"
            title="Update Profile Email"
          >
            <Edit3 className="w-3 h-3" />
            <span>Update Email (ईमेल बदलें)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">
            {isEmployer ? 'No Candidate Applications Yet' : 'No Submitted Applications'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isEmployer
              ? 'When candidates apply to your job postings on the map, their profiles will appear here for review and offer letter issuance.'
              : 'Explore the live radar map to discover nearby opportunities, submit applications, and receive direct offer letters!'}
          </p>
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
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all ${
                  isAppOffered 
                    ? 'border-amber-500/40 ring-1 ring-amber-500/20' 
                    : isAppHired
                    ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Candidate / Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-indigo-400">{app.jobTitle}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] text-slate-400">
                        Applied on {new Date(app.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {app.jobSalary && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-[11px] font-semibold text-emerald-400">{app.jobSalary}</span>
                        </>
                      )}
                    </div>

                    <div 
                      onClick={() => onOpenProfile && onOpenProfile(isEmployer ? app.seekerId : app.employerId)}
                      className="flex items-center gap-2.5 mb-2 cursor-pointer group w-fit"
                      title="Click to view full profile"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                        {app.seekerAvatar ? (
                          <img src={app.seekerAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                          {isEmployer ? app.seekerName : app.employerName}
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
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
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed max-w-xl">
                        "{app.coverNote}"
                      </p>
                    )}
                  </div>

                  {/* Status & Instant Action Buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
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
                        className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
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
                        className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition-colors"
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
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
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
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md active:scale-95"
                            >
                              Accept Application
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'rejected')}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 font-semibold border border-slate-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* When Accepted: Show prominent 'Issue Offer Letter & Hire' Button */}
                        {isAppAccepted && (
                          <button
                            onClick={() => setSelectedAppForOffer(app)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <Sparkles className="w-4 h-4 text-emerald-200" />
                            <span>Issue Offer Letter & Hire (ऑफर भेजें)</span>
                          </button>
                        )}

                        {/* When Offered or Hired: Show 'View Issued Offer' Button */}
                        {(isAppOffered || isAppHired) && (
                          <button
                            onClick={() => setSelectedAppForView(app)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600/25 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs border border-indigo-500/30 transition-all flex items-center gap-1.5"
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
                      <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-indigo-500/15 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0 mt-0.5">
                            <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white">
                              🎉 Congratulations! Formal Offer Letter Received
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                              Role: <strong className="text-white">{app.offerLetter?.designation || app.jobTitle}</strong> • CTC: <strong className="text-emerald-400">{app.offerLetter?.salary || app.jobSalary || 'Competitive'}</strong>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              An official copy has also been dispatched to your email ({app.seekerEmail || user.email}).
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedAppForView(app)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View & Accept Offer Letter (ऑफर देखें)</span>
                        </button>
                      </div>
                    )}

                    {/* 2. When Officially Hired */}
                    {isAppHired && (
                      <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white">
                              🏆 You are Officially Hired! (नियुक्ति पूर्ण)
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                              Joined as <strong>{app.offerLetter?.designation || app.jobTitle}</strong> at <strong>{app.employerName}</strong>.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedAppForView(app)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white font-bold text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Download / Print Letter (प्रिंट करें)</span>
                        </button>
                      </div>
                    )}

                    {/* 3. When Application is Accepted but Offer Letter Pending */}
                    {isAppAccepted && (
                      <div className="mt-3 p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs text-teal-300 flex items-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
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

      {/* 3. Modal to Update User Profile Email */}
      {isEmailModalOpen && (
        <UpdateEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}

    </div>
  );
};
