import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Globe,
  Tag,
  Upload,
  FileText,
  Zap,
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CompleteProfileModal = ({ isOpen, onClose, onCompleted }) => {
  const { user, updateProfile } = useAuth();

  const isEmp = user?.role === 'emp';

  // Common Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  
  // Seeker Specific Fields
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [bio, setBio] = useState('');

  // Employer Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology & IT');
  const [website, setWebsite] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // AI Resume Auto-Fill State
  const fileInputRef = useRef(null);
  const [aiParsing, setAiParsing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const parseResumeData = (parsed) => {
    if (!parsed) return;
    if (parsed.name && (!name || name.startsWith('User '))) {
      setName(parsed.name);
    }
    if (parsed.title) {
      setTitle(parsed.title);
    }
    if (Array.isArray(parsed.skills) && parsed.skills.length > 0) {
      setSkills(parsed.skills.join(', '));
    }
    if (parsed.expectedSalary) {
      setExpectedSalary(parsed.expectedSalary);
    }
    if (parsed.bio) {
      setBio(parsed.bio);
    }
    setAiResult(parsed);
    setSuccess(`✨ AI parsed resume successfully! ${parsed.skills?.length || 0} skills auto-detected.`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiParsing(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/ai/parse-resume', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse resume');
      }
      parseResumeData(data.data);
    } catch (err) {
      setError(`AI Resume parsing failed: ${err.message}`);
    } finally {
      setAiParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTextParse = async () => {
    if (!pastedText.trim()) return;
    setAiParsing(true);
    setError('');
    try {
      const res = await fetch('/api/ai/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse resume');
      }
      parseResumeData(data.data);
      setShowPasteBox(false);
      setPastedText('');
    } catch (err) {
      setError(`AI Resume parsing failed: ${err.message}`);
    } finally {
      setAiParsing(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name && !user.name.startsWith('User ') ? user.name : '');
      setAddress(user.address || 'Mumbai, India');
      if (isEmp) {
        setCompanyName(user.companyName || user.company || '');
        setIndustry(user.industry || 'Technology & IT');
        setWebsite(user.website || '');
      } else {
        setTitle(user.title || '');
        setSkills(Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''));
        setExpectedSalary(user.expectedSalary || '₹12,00,000 / yr');
        setBio(user.bio || '');
      }
    }
  }, [user, isEmp, isOpen]);

  if (!isOpen) return null;

  // Suggested popular skills quick add
  const popularSkills = ['React', 'Node.js', 'WebRTC', 'Tailwind CSS', 'TypeScript', 'Docker', 'Python', 'Figma'];
  const handleAddSkill = (skill) => {
    const list = skills.split(',').map(s => s.trim()).filter(Boolean);
    if (!list.includes(skill)) {
      list.push(skill);
      setSkills(list.join(', '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!isEmp && !title.trim()) {
      setError('Please enter your professional job title');
      return;
    }
    if (isEmp && !companyName.trim()) {
      setError('Please enter your company name');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        name: name.trim(),
        address: address.trim(),
        isProfileComplete: true,
        ...(isEmp ? {
          companyName: companyName.trim(),
          industry: industry.trim(),
          website: website.trim()
        } : {
          title: title.trim(),
          skills: skillsArray,
          expectedSalary: expectedSalary.trim(),
          bio: bio.trim()
        })
      };

      const result = await updateProfile(payload);
      if (!result.success) throw new Error(result.error || 'Failed to update profile');

      setSuccess('🎉 Profile successfully completed! Updating your radar presence...');

      setTimeout(() => {
        if (onCompleted) onCompleted(result.user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/40 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-bold mb-1.5 shadow-2xs">
              <Sparkles size={12} className="text-indigo-600 animate-pulse" />
              Step 2 of 2: Profile Details
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Complete Your Profile
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEmp 
                ? 'Add your company info to begin posting jobs and hiring talent' 
                : 'Add your title and skills so recruiters can discover and spot-hire you'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Skip for now"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-1 w-3/4 transition-all" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* EMPLOYER FIELDS */}
          {isEmp && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Building2 size={16} />
                  </span>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. TechPulse Solutions Pvt Ltd"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Industry / Category
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition font-medium"
                >
                  <option value="Technology & IT">Technology & IT</option>
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                  <option value="Design & Creative Media">Design & Creative Media</option>
                  <option value="Healthcare & Diagnostics">Healthcare & Diagnostics</option>
                  <option value="Retail & Commerce">Retail & Commerce</option>
                  <option value="Finance & FinTech">Finance & FinTech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Company Website / Link (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Globe size={16} />
                  </span>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://techpulse.io"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* SEEKER FIELDS */}
          {!isEmp && (
            <>
              {/* AI Resume 1-Click Auto-Fill Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/40 border border-indigo-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                      <Sparkles size={14} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                        AI Resume 1-Click Auto-Fill
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-100 text-indigo-700 rounded-full">New</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">Upload PDF / TXT or paste text to auto-populate your entire profile</p>
                    </div>
                  </div>
                  {aiResult && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      ⚡ {aiResult.score || 90}% Match
                    </span>
                  )}
                </div>

                {/* Upload or Paste Controls */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-file-input"
                  />
                  <button
                    type="button"
                    disabled={aiParsing}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 disabled:opacity-60"
                  >
                    {aiParsing ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-indigo-600" />
                        <span>Parsing Resume...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>Upload Resume (PDF/TXT)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={aiParsing}
                    onClick={() => setShowPasteBox(!showPasteBox)}
                    className="py-2 px-3 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition active:scale-95"
                  >
                    <FileText size={13} />
                    <span>{showPasteBox ? 'Cancel' : 'Paste Text'}</span>
                  </button>
                </div>

                {/* Collapsible Paste Text Area */}
                {showPasteBox && (
                  <div className="pt-2 space-y-2 animate-fadeIn">
                    <textarea
                      rows={4}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your resume text or LinkedIn summary here (e.g. Senior Fullstack Developer with 4 years experience in React, Node, WebRTC...)"
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      disabled={aiParsing || !pastedText.trim()}
                      onClick={handleTextParse}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      {aiParsing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                      <span>Analyze & Populate Fields</span>
                    </button>
                  </div>
                )}

                {/* Strengths / AI insights preview */}
                {aiResult?.strengths && (
                  <div className="pt-1 border-t border-indigo-100 flex flex-wrap gap-1">
                    {aiResult.strengths.slice(0, 2).map((str, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 border border-indigo-100 text-[10px] text-indigo-900 font-medium">
                        <Check size={10} className="text-emerald-500" />
                        {str}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Professional Title / Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Briefcase size={16} />
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior React & WebRTC Engineer"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Core Skills (Comma separated)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Tag size={16} />
                  </span>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, WebSockets, Tailwind"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                  />
                </div>
                {/* Popular Skill Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 font-bold mr-1 self-center">Quick add:</span>
                  {popularSkills.map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => handleAddSkill(sk)}
                      className="px-2.5 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 transition active:scale-95"
                    >
                      + {sk}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Expected Salary / Rate
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="text"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="e.g. ₹15,00,000 / yr or ₹2,500 / day"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Location / Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              City / Location in India
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <MapPin size={16} />
              </span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bandra Kurla Complex (BKC), Mumbai"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-98 text-white font-extrabold rounded-xl text-sm transition shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save & Complete Profile</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition text-center"
            >
              I will complete this later &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
