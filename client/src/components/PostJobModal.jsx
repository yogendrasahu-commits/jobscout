import React, { useState, useEffect } from 'react';
import { X, Briefcase, DollarSign, MapPin, Tag, Sparkles, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PostJobModal = ({ isOpen, onClose, onJobCreated, defaultCoords }) => {
  const { user, token } = useAuth();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.companyName || user?.name || '');
  const [category, setCategory] = useState('Technology');
  const [jobType, setJobType] = useState('Full-time');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [address, setAddress] = useState(user?.address || 'Mumbai, Maharashtra');
  const [lat, setLat] = useState(defaultCoords?.lat || user?.lat || 19.0760);
  const [lng, setLng] = useState(defaultCoords?.lng || user?.lng || 72.8777);
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync coordinates and employer defaults whenever modal opens or coordinates change
  useEffect(() => {
    if (isOpen) {
      setError('');
      setCompany(user?.companyName || user?.name || '');
      setAddress(user?.address || 'Mumbai, Maharashtra');
      setLat(defaultCoords?.lat || user?.lat || 19.0760);
      setLng(defaultCoords?.lng || user?.lng || 72.8777);
    }
  }, [isOpen, defaultCoords, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedSalary = salary.trim();
    const trimmedAddress = address.trim();

    if (trimmedTitle.length < 3) {
      setError('Job Title must be at least 3 characters long');
      return;
    }
    if (trimmedSalary.length < 2) {
      setError('Please enter a valid Salary / Compensation (e.g. ₹12,00,000/yr or ₹800/day)');
      return;
    }
    if (trimmedAddress.length < 3) {
      setError('Please enter a valid Location / Area name');
      return;
    }
    const nLat = Number(lat);
    const nLng = Number(lng);
    if (!Number.isFinite(nLat) || !Number.isFinite(nLng) || nLat < 6 || nLat > 38 || nLng < 68 || nLng > 98) {
      setError('Coordinates must be within India (Lat 6–38, Lng 68–98)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: trimmedTitle,
          company: (company && company.trim()) || user?.companyName || user?.name,
          category,
          jobType,
          salary: trimmedSalary,
          description: description.trim(),
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          address: trimmedAddress,
          lat: nLat,
          lng: nLng,
          urgent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post job');

      setTitle('');
      setSalary('');
      setDescription('');
      setSkills('');
      setUrgent(false);
      if (onJobCreated) onJobCreated(data.job);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-slate-950/65 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-5 sm:p-6 shadow-[0_30px_90px_-15px_rgba(15,23,42,0.35)] animate-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto my-auto text-slate-900 relative">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1 shadow-xs active:scale-95"
              title="Back / Close"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-600" />
              <span>Back</span>
            </button>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">Post a New Job on Map</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Live coordinates will make this visible to nearby seekers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Close dialog"
          >
            <span className="text-[11px] font-semibold hidden sm:inline">Close (बंद करें)</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer, Delivery Partner, UI Designer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Support">Support & IT</option>
                <option value="Logistics">Logistics / Delivery</option>
                <option value="Sales">Sales & Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract / Gig">Contract / Gig</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary / Compensation *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹15,00,000 / yr or ₹2,500/day"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Area</label>
              <input
                type="text"
                placeholder="e.g. Bandra Kurla Complex"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Map Pin GPS: <strong className="text-slate-800">{Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</strong></span>
            </div>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shadow-xs">
              Live Map Active
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, WebSockets, Tailwind"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
            <textarea
              rows={3}
              placeholder="Detail the role, perks, immediate joining requirement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="urgent"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="w-4 h-4 rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="urgent" className="text-xs text-slate-700 cursor-pointer">
              Mark as <span className="text-amber-700 font-semibold">Immediate Spot Hiring / Urgent</span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancel / Back (रद्द करें)</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? 'Publishing...' : 'Publish to Live Map'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
