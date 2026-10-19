import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Send, 
  Mail, 
  Briefcase, 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileCheck, 
  Sparkles, 
  AlertCircle,
  Eye,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const IssueOfferModal = ({ application, isOpen, onClose, onSuccess }) => {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'preview'
  const [candidateEmail, setCandidateEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('Immediate (Within 7-15 Days)');
  const [location, setLocation] = useState('Bandra Kurla Complex (BKC), Mumbai / Hybrid');
  const [terms, setTerms] = useState('Standard company employment policies, 3 months probation period, 30 days notice period.');
  const [customNote, setCustomNote] = useState('We were extremely impressed by your experience and are thrilled to welcome you to our engineering team!');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (application) {
      setCandidateEmail(application.seekerEmail || '');
      setDesignation(application.jobTitle || 'Senior Software Engineer');
      setSalary(application.jobSalary || '₹14,00,000 / yr');
      if (application.jobLocation) {
        setLocation(application.jobLocation);
      }
      setError('');
      setSuccess('');
      setActiveTab('form');
    }
  }, [application, isOpen]);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = (candidateEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('कृपया उम्मीदवार का एक मान्य ईमेल आईडी दर्ज करें (जैसे: candidate@gmail.com)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${application.id}/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          candidateEmail: cleanEmail,
          designation,
          salary,
          joiningDate,
          location,
          terms,
          customNote
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch offer letter');
      }

      setSuccess(`🎉 आधिकारिक ऑफर लेटर पोर्टल में उम्मीदवार के प्रोफाइल पर सफलतापूर्वक जारी कर दिया गया है!`);

      if (onSuccess) {
        onSuccess(data.application);
      }
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err) {
      setError(err.message || 'ऑफर लेटर भेजने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col max-h-[94dvh] overflow-hidden my-auto animate-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Top Header with Back & Close Buttons */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Back / Close"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>Back (वापस)</span>
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block">
                Issue Official Job Offer Letter
              </span>
              <span className="text-[10px] text-slate-500">
                To: {application.seekerName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'form' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Close modal"
            >
              <span className="text-[11px] font-semibold hidden sm:inline">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-7 space-y-4">
          
          {/* Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipient Notice */}
              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {application.seekerName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{application.seekerName}</h4>
                    <p className="text-[11px] text-slate-500">Position Applied: <strong className="text-slate-800">{application.jobTitle}</strong></p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase">
                  Candidate Selected
                </span>
              </div>

              {/* Candidate Email Input (Required to send Offer) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Candidate Email (उम्मीदवार का ईमेल) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="उदा. candidate@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ऑफर लेटर की आधिकारिक HTML कॉपी और साइन करने का लिंक इस ईमेल पर भेजा जाएगा।
                </p>
              </div>

              {/* Grid 2 Columns: Designation & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Designation / Title <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Senior Full Stack Engineer"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Offered CTC / Salary <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="₹15,00,000 / yr"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                    <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns: Joining Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Joining Date (शामिल होने की तिथि)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      placeholder="Immediate (Within 7 Days)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Work Location / Hub
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Bandra Kurla Complex (BKC), Mumbai"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Employment Terms & Probation
                </label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* Personal Welcome Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Personal Welcome Message (व्यक्तिगत संदेश)
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  rows={2}
                  placeholder="संदेश लिखें जो ऑफर लेटर में प्रदर्शित होगा..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* Bottom Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full sm:w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? (
                    <span>ऑफर लेटर ईमेल भेजा जा रहा है...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Offer Letter via Email (ऑफर भेजें)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* Live Preview Tab */
            <div className="space-y-4">
              <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 relative overflow-hidden">
                
                {/* Background Security Watermark with Company Name */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                  <div className="rotate-[-28deg] text-center space-y-12 sm:space-y-16 opacity-[0.06] sm:opacity-[0.07] select-none pointer-events-none">
                    <div className="text-3xl sm:text-5xl font-black uppercase tracking-[0.25em] text-slate-900 whitespace-nowrap">
                      {user?.companyName || user?.name || 'OFFICIAL OFFER'}
                    </div>
                    <div className="text-4xl sm:text-6xl font-black uppercase tracking-[0.25em] text-indigo-900 whitespace-nowrap">
                      {user?.companyName || user?.name || 'OFFICIAL OFFER'}
                    </div>
                    <div className="text-3xl sm:text-5xl font-black uppercase tracking-[0.25em] text-slate-900 whitespace-nowrap">
                      {user?.companyName || user?.name || 'OFFICIAL OFFER'}
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">{user?.companyName || user?.name || 'Company Name'}</h3>
                      <p className="text-[10px] font-semibold text-indigo-700">CORPORATE EMPLOYMENT SERVICES</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Ref: JS-OFFER-PREVIEW</span>
                  </div>

                  <div className="mt-4 text-xs space-y-2 text-slate-700">
                    <p><strong>To:</strong> {application.seekerName} ({candidateEmail || 'email@example.com'})</p>
                    <p className="font-bold text-slate-900">Dear {application.seekerName},</p>
                    <p>We are pleased to offer you the position of <strong className="text-indigo-900">"{designation}"</strong> with <strong className="text-slate-900">{user?.companyName || user?.name}</strong>.</p>
                    
                    {customNote && (
                      <div className="p-2.5 bg-indigo-50 border-l-4 border-indigo-600 rounded-r-lg italic text-slate-700 text-xs">
                        "{customNote}"
                      </div>
                    )}

                    <div className="my-3 border border-slate-200 rounded-lg overflow-hidden text-xs">
                      <div className="p-2 bg-slate-100 font-bold border-b border-slate-200">Offer Highlights</div>
                      <div className="p-2 grid grid-cols-2 gap-2">
                        <div><span className="text-slate-500">Role:</span> <strong>{designation}</strong></div>
                        <div><span className="text-slate-500">CTC:</span> <strong className="text-emerald-700">{salary}</strong></div>
                        <div><span className="text-slate-500">Joining:</span> <strong>{joiningDate}</strong></div>
                        <div><span className="text-slate-500">Hub:</span> <strong>{location}</strong></div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">Terms: {terms}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Edit Details
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
