import React, { useState, useEffect } from 'react';
import { X, Send, Briefcase, MapPin, DollarSign, MessageSquare, Phone, Video, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const JobApplyModal = ({ job, isOpen, onClose, onApplied }) => {
  const { user, token } = useAuth();
  const { setActiveChatUser, startCall } = useSocket();

  const [coverNote, setCoverNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form state whenever modal opens or selected job changes
  useEffect(() => {
    if (isOpen) {
      setCoverNote('');
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen, job?.id]);

  if (!isOpen || !job) return null;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setError('Please sign in as a Job Seeker to apply for jobs');
      return;
    }
    if (user.role === 'emp') {
      setError('You are currently signed in as an Employer. Application submissions are reserved for Job Seekers. Please switch to a Job Seeker account.');
      return;
    }
    if (coverNote.trim().length > 1000) {
      setError('Cover note cannot exceed 1000 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job.id,
          coverNote: coverNote.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply');

      setSuccess(true);
      if (onApplied) onApplied(job.id);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectChat = () => {
    setActiveChatUser({
      id: job.employerId,
      name: job.employerName,
      companyName: job.company
    });
    onClose();
  };

  const handleDirectCall = (isVideo) => {
    startCall(
      {
        id: job.employerId,
        name: job.employerName,
        companyName: job.company
      },
      isVideo
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto my-auto text-slate-900">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="mt-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1 shadow-xs active:scale-95"
              title="Back / Close"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-600" />
              <span>Back</span>
            </button>
            <div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase">
                {job.jobType}
              </span>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-1.5 leading-snug">{job.title}</h3>
              <p className="text-xs text-slate-500">{job.company} • {job.address}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex-shrink-0"
            title="Close dialog"
          >
            <span className="text-[11px] font-semibold hidden sm:inline">Close (बंद करें)</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Job Quick Stats */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Compensation</span>
            <span className="text-sm font-bold text-emerald-700">{job.salary}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Map Distance</span>
            <span className="text-sm font-bold text-indigo-700">
              {job.distanceKm ? `${job.distanceKm} km away` : 'Nearby in city'}
            </span>
          </div>
        </div>

        {/* Description & Skills */}
        <div className="space-y-3 mb-4">
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {job.description || 'No detailed description provided.'}
          </p>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-medium bg-white text-slate-700 rounded-md border border-slate-200 shadow-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Direct Connect Options (Instant Reach) */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl mb-4 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">Connect Directly with Recruiter</span>
            <span className="text-[11px] text-indigo-700">Fast-track interview via call or chat</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDirectCall(false)}
              title="Voice Call Recruiter"
              className="p-2 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDirectCall(true)}
              title="Video Call Recruiter"
              className="p-2 rounded-xl bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border border-indigo-300 transition-colors shadow-xs"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={handleDirectChat}
              title="Message Recruiter"
              className="p-2 rounded-xl bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {user?.role === 'emp' && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <span className="text-base leading-none">⚠️</span>
            <div>
              <span className="font-bold block">Employer Account Notice</span>
              <span>You are signed in as an Employer. Application submissions are reserved for Job Seekers. You can switch to a Job Seeker account from the profile menu, or use the direct recruiter contact buttons above.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center font-bold">
            ✓ Application submitted successfully!
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleApply} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quick Pitch / Cover Note
            </label>
            <textarea
              rows={2}
              placeholder="Hi, I am ready for this role and available nearby for an immediate discussion..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              disabled={user?.role === 'emp'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 resize-none disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 order-2 sm:order-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              Verified profile & contact auto-attached
            </span>
            <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Cancel / Back (रद्द करें)</span>
              </button>
              <button
                type="submit"
                disabled={loading || success || user?.role === 'emp'}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
              >
                <span>⚡</span>
                <span>
                  {loading
                    ? 'Submitting...'
                    : user?.role === 'emp'
                    ? 'Employer Account (Seekers Only)'
                    : '1-Click Easy Apply'}
                </span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
