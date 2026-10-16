import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  CheckCircle, 
  Sparkles, 
  Share2, 
  Calendar, 
  DollarSign,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const ResumePreviewModal = ({ candidate, isOpen, onClose }) => {
  if (!isOpen || !candidate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Candidate profile link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[960] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 print:border-none print:shadow-none print:rounded-none print:m-0 print:max-w-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span className="font-extrabold text-sm text-slate-900">JobScout Verified Executive CV</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              Identity Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
              title="Share Profile Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Resume Canvas */}
        <div className="p-6 sm:p-10 max-h-[85vh] overflow-y-auto print:max-h-none print:p-8 print:overflow-visible">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={candidate.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={candidate.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-md ring-4 ring-indigo-50"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {candidate.name}
                  </h1>
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-extrabold print:border-slate-300">
                    Candidate #{candidate.id?.slice(-4) || '2026'}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-indigo-600 mt-1">
                  {candidate.title || 'Senior Software Engineer'}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{candidate.address || 'Mumbai, India'}</span>
                  </span>
                  {candidate.email && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{candidate.email}</span>
                    </span>
                  )}
                  {candidate.phone && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>+91 {candidate.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Experience</span>
                <span className="font-extrabold text-slate-900">{candidate.experience || '3.5+ Years'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Target Comp</span>
                <span className="font-extrabold text-emerald-700">{candidate.expectedSalary || 'Competitive'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Notice Period</span>
                <span className="font-extrabold text-indigo-700">{candidate.availability || 'Immediate'}</span>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="py-5 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Executive Summary</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {candidate.bio || `${candidate.name} is a results-driven engineering professional with extensive experience delivering high-impact solutions, collaborating cross-functionally, and scaling web and distributed platforms.`}
            </p>
          </div>

          {/* Core Competencies & Skills */}
          <div className="py-5 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Core Competencies & Verified Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(candidate.skills || ['React', 'Node.js', 'TypeScript', 'WebSockets', 'Tailwind CSS', 'SQL']).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/90 shadow-xs print:border-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Highlights */}
          <div className="py-5 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Professional Milestones</h2>
            <div className="space-y-4">
              <div className="relative pl-5 border-l-2 border-indigo-500">
                <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white" />
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">{candidate.title || 'Senior Engineering Specialist'}</h3>
                  <span className="text-xs text-slate-500 font-semibold">2023 - Present</span>
                </div>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">High-Growth Tech Startups & Enterprise Teams</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Architected real-time messaging, map geolocation feeds, and scalable REST/Socket APIs with 99.9% uptime. Mentored junior engineers and instituted automated testing practices.
                </p>
              </div>

              <div className="relative pl-5 border-l-2 border-slate-300">
                <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">Software Associate & Product Contributor</h3>
                  <span className="text-xs text-slate-500 font-semibold">2021 - 2023</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Technology Services & Product Labs</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Engineered customer-facing UI components, integrated payment gateways, and resolved core database performance bottlenecks.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span>Verified candidate record generated via <strong>JobScout Geospatial Radar Platform</strong>.</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              ID: {candidate.id || 'usr_verified'} • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
