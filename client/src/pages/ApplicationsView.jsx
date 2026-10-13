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
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

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
    };

    socket.on('application:created', handleNewApp);
    socket.on('application:updated', handleUpdatedApp);

    return () => {
      socket.off('application:created', handleNewApp);
      socket.off('application:updated', handleUpdatedApp);
    };
  }, [socket, isEmployer, user]);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Accepted / Hired
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'reviewed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending
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
            Please sign in to track your applied positions, view hiring status updates, and connect with employers.
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
      
      {/* Title (Only when rendered standalone) */}
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {isEmployer ? 'Candidate Applications' : 'My Job Applications'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isEmployer
              ? 'Review applicants for your posted jobs, schedule live video/voice interviews'
              : 'Track your submitted applications and interview requests'}
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">
            {isEmployer ? 'No Applications Yet' : 'No Submitted Applications'}
          </h3>
          <p className="text-xs text-slate-400">
            {isEmployer
              ? 'When seekers apply to your postings, their profiles will appear here.'
              : 'Browse the Live Map to find nearby positions and apply!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-indigo-400">{app.jobTitle}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div 
                  onClick={() => onOpenProfile && onOpenProfile(isEmployer ? app.seekerId : app.employerId)}
                  className="flex items-center gap-2 mb-2 cursor-pointer group w-fit"
                  title="Click to view full profile"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
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
                    <span className="text-[11px] text-slate-400">
                      {isEmployer ? app.seekerEmail : 'Hiring Organization'}
                    </span>
                  </div>
                </div>

                {app.coverNote && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed max-w-xl">
                    "{app.coverNote}"
                  </p>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                {getStatusBadge(app.status)}

                {/* Instant Connect Buttons */}
                <div className="flex items-center gap-2">
                  {/* Audio Call */}
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
                    title="Start Voice Call"
                    className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  {/* Video Call */}
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
                    title="Start Video Call"
                    className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  {/* Message */}
                  <button
                    onClick={() =>
                      setActiveChatUser({
                        id: isEmployer ? app.seekerId : app.employerId,
                        name: isEmployer ? app.seekerName : app.employerName,
                        avatar: app.seekerAvatar
                      })
                    }
                    title="Open Chat"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>

                {/* Employer Status Update Action */}
                {isEmployer && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => updateStatus(app.id, 'accepted')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'rejected')}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
