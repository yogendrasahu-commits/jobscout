import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  Phone, 
  Video, 
  ArrowLeft,
  Sparkles,
  Zap,
  Building,
  Car,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { triggerConfetti } from '../utils/confetti';
import { playSuccessChime } from '../utils/soundEffects';

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

  // Compute skill match score
  const userSkills = (user?.skills || []).map(s => String(s).toLowerCase().trim());
  const jobSkills = (job.skills || []).map(s => String(s).toLowerCase().trim());
  let matchPercentage = null;
  if (userSkills.length > 0 && jobSkills.length > 0) {
    const matched = jobSkills.filter(s => userSkills.includes(s));
    matchPercentage = Math.min(99, Math.max(60, Math.round((matched.length / jobSkills.length) * 100)));
  }

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setError('Please sign in as a Job Seeker to submit an application');
      return;
    }
    if (user.role === 'emp') {
      setError('You are signed in as an Employer. Direct applications are reserved for Job Seekers.');
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
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      setSuccess(true);
      triggerConfetti();
      playSuccessChime();
      if (onApplied) onApplied(job.id);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectChat = () => {
    setActiveChatUser({
      id: job.employerId,
      name: job.employerName || job.company,
      companyName: job.company
    });
    onClose();
  };

  const handleDirectCall = (isVideo) => {
    startCall(
      {
        id: job.employerId,
        name: job.employerName || job.company,
        companyName: job.company
      },
      isVideo
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-slate-950/65 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-5 sm:p-7 shadow-[0_30px_90px_-15px_rgba(15,23,42,0.35)] animate-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto my-auto text-slate-900 overflow-hidden">
        {/* Subtle top iridescent highlight */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />
        
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95"
            title="Back to Jobs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            {matchPercentage && (
              <span className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80 shadow-2xs">
                <Sparkles className="w-3 h-3 text-indigo-600" /> {matchPercentage}% Match
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="pt-4 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/20 flex-shrink-0">
            {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                {job.jobType || 'Full-time'}
              </span>
              {job.workMode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {job.workMode}
                </span>
              )}
              {job.urgent && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-rose-600 fill-rose-600" /> Urgent
                </span>
              )}
            </div>

            <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 leading-snug">
              {job.title}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-800">{job.company}</strong>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Employer" />
            </p>
          </div>
        </div>

        {/* Highlight Stats Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Compensation</span>
            <span className="text-sm font-mono font-extrabold text-emerald-800 tracking-tight">
              {job.salary || 'Competitive'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Commute Distance</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Car className="w-3.5 h-3.5 text-indigo-600" />
              <span>~{Math.max(2, Math.round((job.distanceKm || 2) * 2.5))} min</span>
              <span className="text-slate-400">•</span>
              <span>{job.distanceKm ? `${job.distanceKm} km` : 'Local'}</span>
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Work Location</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
              {job.address || 'In Office'}
            </span>
          </div>
        </div>

        {/* Direct Connect Action Bar */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-indigo-50/70 border border-indigo-200/80 rounded-2xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Direct Recruiter Speed-Connect
            </span>
            <span className="text-[11px] text-slate-500">Fast-track interview without waiting days</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDirectCall(false)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
              title="Voice Call Recruiter"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voice</span>
            </button>

            <button
              type="button"
              onClick={() => handleDirectCall(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
              title="Video Call Recruiter"
            >
              <Video className="w-3.5 h-3.5 text-indigo-600" />
              <span>Video</span>
            </button>

            <button
              type="button"
              onClick={handleDirectChat}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
              title="Message Recruiter"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chat</span>
            </button>

            {job.lat && job.lng && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center justify-center active:scale-95 shadow-2xs"
                title="Route in Google Maps"
              >
                <Navigation className="w-3.5 h-3.5 text-slate-600" />
              </a>
            )}
          </div>
        </div>

        {/* Description & Skill Tags */}
        <div className="space-y-3 mb-4">
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            {job.description || 'No detailed description provided.'}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                Required Skills & Tech Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s, idx) => {
                  const isMatched = userSkills.includes(s.toLowerCase().trim());
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all ${
                        isMatched
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {isMatched ? '✓ ' : ''}{s}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Employer Account Banner */}
        {user?.role === 'emp' && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <span className="text-base leading-none">⚠️</span>
            <div>
              <strong className="block font-bold">Employer Account Notice</strong>
              <span>You are logged in as an Employer. Standard application submissions are for Job Seekers. You can reach out directly via the Recruiter Connect buttons above.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs text-center font-extrabold flex items-center justify-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Application submitted successfully! Recruiter notified.</span>
          </div>
        )}

        {/* Application Submission Form */}
        <form onSubmit={handleApply} className="space-y-3.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              Quick Pitch / Candidate Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Hi, I am ready for this role and available nearby for an immediate discussion..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              disabled={user?.role === 'emp'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none disabled:opacity-60 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-[10px] text-slate-500 flex items-center gap-1.5 order-2 sm:order-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              Verified contact & skill profile attached
            </span>

            <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || success || user?.role === 'emp'}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>
                  {loading
                    ? 'Submitting...'
                    : user?.role === 'emp'
                    ? 'Employer Account'
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
