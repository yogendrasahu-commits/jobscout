import React, { useState, useEffect } from 'react';
import { X, Send, Briefcase, MapPin, DollarSign, MessageSquare, Phone, Video } from 'lucide-react';
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
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">
              {job.jobType}
            </span>
            <h3 className="font-bold text-lg text-white mt-1.5">{job.title}</h3>
            <p className="text-xs text-slate-400">{job.company} • {job.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Job Quick Stats */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Compensation</span>
            <span className="text-sm font-bold text-emerald-400">{job.salary}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Radar Distance</span>
            <span className="text-sm font-bold text-indigo-400">
              {job.distanceKm ? `${job.distanceKm} km away` : 'Nearby in city'}
            </span>
          </div>
        </div>

        {/* Description & Skills */}
        <div className="space-y-3 mb-4">
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            {job.description || 'No detailed description provided.'}
          </p>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-300 rounded-md border border-slate-700"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Direct Connect Options (Instant Reach) */}
        <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl mb-4 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-white block">Connect Directly with Recruiter</span>
            <span className="text-[11px] text-indigo-300">Fast-track interview via call or chat</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDirectCall(false)}
              title="Voice Call Recruiter"
              className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDirectCall(true)}
              title="Video Call Recruiter"
              className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={handleDirectChat}
              title="Message Recruiter"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-bold">
            ✓ Application submitted successfully!
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleApply} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quick Pitch / Cover Note
            </label>
            <textarea
              rows={2}
              placeholder="Hi, I am ready for this role and available nearby for an immediate discussion..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Your verified profile & contact are auto-attached
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <span>⚡</span>
                <span>{loading ? 'Submitting...' : '1-Click Easy Apply'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
