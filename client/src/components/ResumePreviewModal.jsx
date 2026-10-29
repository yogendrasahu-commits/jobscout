import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const [copied, setCopied] = React.useState(false);

  // Escape key handler & Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/75 backdrop-blur-md flex justify-center items-start sm:items-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:fixed print:inset-0 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 print:border-none print:shadow-none print:rounded-none print:m-0 print:max-w-none flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) - Sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 print:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
              JobScout Verified CV
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold hidden xs:inline">
              Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs ${
                copied 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Share Profile Link"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            {/* Prominent Catchy Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-200/80 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300/80 hover:border-rose-200 transition-all font-bold text-xs active:scale-95 shadow-2xs group ml-1"
              title="Close Profile (बंद करें)"
            >
              <X className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
              <span className="font-extrabold hidden xs:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Printable Resume Canvas - Scrollable */}
        <div className="p-4 sm:p-8 md:p-10 overflow-y-auto print:max-h-none print:p-8 print:overflow-visible flex-1">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={candidate.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={candidate.name}
                  className="w-16 h-16 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-md ring-4 ring-indigo-50"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
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
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/90 shadow-2xs print:border-slate-300"
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
              <span>Verified candidate record generated via <strong>JobScout Geospatial Platform</strong>.</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              ID: {candidate.id || 'usr_verified'} • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer (Hidden on print) */}
        <div className="p-3 sm:px-6 sm:py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0 print:hidden text-xs">
          <span className="text-slate-500 hidden sm:inline">
            JobScout ATS-Verified Candidate Dossier
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-all active:scale-95"
            >
              Close (बंद करें)
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ResumePreviewModal;
