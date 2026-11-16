import React, { useState, useEffect } from 'react';
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
  Tag
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold mb-1.5">
              <Sparkles size={12} />
              Step 2 of 2: Profile Details
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Complete Your Profile
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEmp 
                ? 'Add your company info to begin posting jobs and hiring talent' 
                : 'Add your title and skills so recruiters can discover and spot-hire you'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Skip for now"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div className="bg-gradient-to-r from-amber-400 via-indigo-500 to-cyan-400 h-1 w-3/4 transition-all" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* EMPLOYER FIELDS */}
          {isEmp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <Building2 size={16} />
                  </span>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. TechPulse Solutions Pvt Ltd"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Industry / Category
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Website / Link (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <Globe size={16} />
                  </span>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://techpulse.io"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* SEEKER FIELDS */}
          {!isEmp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Professional Title / Role <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <Briefcase size={16} />
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior React & WebRTC Engineer"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Core Skills (Comma separated)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <Tag size={16} />
                  </span>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, WebSockets, Tailwind"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {/* Popular Skill Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1 self-center">Quick add:</span>
                  {popularSkills.map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => handleAddSkill(sk)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700/60 rounded-lg text-[10px] text-slate-300 transition"
                    >
                      + {sk}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Expected Salary / Rate
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="text"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="e.g. ₹15,00,000 / yr or ₹2,500 / day"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Location / Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              City / Location in India
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                <MapPin size={16} />
              </span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bandra Kurla Complex (BKC), Mumbai"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Save & Complete Profile
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-slate-300 transition text-center"
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
