import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Plus, 
  Trash2, 
  FileText, 
  Award, 
  Briefcase, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ResumeBuilderModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const printRef = useRef(null);

  // Resume form state
  const [copied, setCopied] = useState(false);
  const [template, setTemplate] = useState('harvard'); // 'harvard' | 'modern'
  const [mobileViewTab, setMobileViewTab] = useState('editor'); // 'editor' | 'preview' (for < lg screens)

  const [resumeData, setResumeData] = useState({
    fullName: user?.name || 'Aarav Sharma',
    headline: user?.title || 'Senior Full-Stack Software Engineer',
    email: user?.email || 'aarav.sharma@example.com',
    phone: user?.phone || '+91 98765 43210',
    location: user?.address || 'Mumbai, Maharashtra, India',
    linkedin: 'linkedin.com/in/aarav-engineer',
    github: 'github.com/aarav-dev',
    summary:
      user?.bio ||
      'Dedicated Full-Stack Engineer with 4+ years of hands-on experience designing high-scale React, Node.js, and WebRTC real-time systems. Proven track record reducing API latency by 35% and mentoring junior engineering talent.',
    skills: user?.skills && user.skills.length > 0
      ? user.skills
      : ['React.js', 'Node.js', 'TypeScript', 'WebSockets', 'Tailwind CSS', 'PostgreSQL', 'Docker', 'AWS'],
    experience: [
      {
        id: 'exp_1',
        title: 'Senior Software Engineer',
        company: 'CloudTech Solutions India',
        location: 'Mumbai, India',
        duration: '2022 - Present',
        bullets: [
          'Architected real-time WebSocket communication infrastructure handling 100k+ concurrent active sessions with 99.98% uptime.',
          'Reduced web application bundle size by 42% through lazy loading, code-splitting, and optimized asset delivery.',
          'Spearheaded team of 6 engineers across sprint cycles, boosting velocity by 25%.'
        ]
      },
      {
        id: 'exp_2',
        title: 'Full-Stack Developer',
        company: 'Apex Digital Systems',
        location: 'Pune, India',
        duration: '2020 - 2022',
        bullets: [
          'Engineered RESTful microservices in Node.js and Express with automated PostgreSQL read-replicas.',
          'Designed interactive analytics dashboards in React and Tailwind CSS serving 50,000+ daily business users.'
        ]
      }
    ],
    education: [
      {
        id: 'edu_1',
        degree: 'Bachelor of Technology (B.Tech) in Computer Engineering',
        institution: 'University of Mumbai',
        location: 'Mumbai, India',
        year: '2016 - 2020',
        score: 'CGPA: 8.9 / 10'
      }
    ],
    projects: [
      {
        id: 'proj_1',
        name: 'JobScout Live Radar',
        description: 'Interactive map-driven hiring platform with WebRTC peer video interviews, instant WhatsApp alerts, and AI skill matching.'
      }
    ]
  });

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

  // Sync if user data updates
  useEffect(() => {
    if (user && isOpen) {
      setResumeData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        headline: prev.headline || user.title || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        location: prev.location || user.address || ''
      }));
    }
  }, [user, isOpen]);

  // Calculate ATS Compatibility Score
  const calculateATSScore = () => {
    let score = 30; // base score
    if (resumeData.fullName && resumeData.email && resumeData.phone) score += 20;
    if (resumeData.summary && resumeData.summary.length > 60) score += 15;
    if (resumeData.skills.length >= 6) score += 15;
    if (resumeData.experience.length >= 1) score += 10;
    if (resumeData.education.length >= 1) score += 10;

    // Check for power action verbs
    const powerVerbs = ['architected', 'spearheaded', 'engineered', 'developed', 'optimized', 'reduced', 'boosted', 'designed', 'led'];
    const textAll = JSON.stringify(resumeData).toLowerCase();
    const verbMatches = powerVerbs.filter(v => textAll.includes(v));
    if (verbMatches.length >= 3) score = Math.min(100, score + 10);

    return Math.min(100, score);
  };

  const atsScore = calculateATSScore();

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Copy plain text ATS format
  const handleCopyPlainText = () => {
    const plainText = `
${resumeData.fullName.toUpperCase()}
${resumeData.headline}
${resumeData.email} | ${resumeData.phone} | ${resumeData.location}
${resumeData.linkedin} | ${resumeData.github}

==================================================
PROFESSIONAL SUMMARY
==================================================
${resumeData.summary}

==================================================
CORE SKILLS & TECHNOLOGIES
==================================================
${resumeData.skills.join(', ')}

==================================================
WORK EXPERIENCE
==================================================
${resumeData.experience
  .map(
    (exp) => `
${exp.title.toUpperCase()} | ${exp.company} (${exp.location})
${exp.duration}
${exp.bullets.map((b) => `• ${b}`).join('\n')}
`
  )
  .join('\n')}

==================================================
EDUCATION
==================================================
${resumeData.education
  .map((edu) => `${edu.degree}\n${edu.institution}, ${edu.location} (${edu.year}) - ${edu.score}`)
  .join('\n\n')}

==================================================
KEY PROJECTS
==================================================
${resumeData.projects.map((p) => `• ${p.name}: ${p.description}`).join('\n')}
`.trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Add Experience
  const addExperience = () => {
    const newExp = {
      id: `exp_${Date.now()}`,
      title: 'Software Developer',
      company: 'Tech Solutions',
      location: 'India',
      duration: '2023 - Present',
      bullets: ['Engineered scalable user experiences with clean code and high performance.']
    };
    setResumeData({ ...resumeData, experience: [...resumeData.experience, newExp] });
  };

  // Remove Experience
  const removeExperience = (id) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((e) => e.id !== id)
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/75 backdrop-blur-md flex justify-center items-start sm:items-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Styles injected specifically for clean printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #harvard-resume-sheet, #harvard-resume-sheet * {
            visibility: visible !important;
          }
          #harvard-resume-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      <div 
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky with Prominent Close Button */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-3xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">1-Click ATS Harvard Resume Builder</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">
                  ATS Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden xs:block">
                100% Parser-friendly format guaranteed to pass HR Applicant Tracking Systems
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* ATS Score Meter */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-bold text-white">ATS Score:</span>
              <span className="text-xs font-black text-emerald-400">{atsScore}%</span>
            </div>

            {/* Prominent Catchy Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-rose-600 text-white border border-white/20 hover:border-rose-500 transition-all font-bold text-xs active:scale-95 shadow-xs group"
              title="Close Resume Builder (बंद करें)"
            >
              <X className="w-4 h-4 text-slate-200 group-hover:text-white" />
              <span className="font-extrabold">Close</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Template toggle, Print, Copy plain text */}
        <div className="p-3 sm:px-6 sm:py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 hidden sm:inline">Style:</span>
            <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setTemplate('harvard')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  template === 'harvard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Harvard Classic ATS
              </button>
              <button
                type="button"
                onClick={() => setTemplate('modern')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  template === 'modern' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Modern Tech
              </button>
            </div>
          </div>

          {/* Mobile Tab Switcher (< lg) */}
          <div className="flex lg:hidden items-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setMobileViewTab('editor')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                mobileViewTab === 'editor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewTab('preview')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                mobileViewTab === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPlainText}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition-colors flex items-center gap-1.5 active:scale-95 shadow-2xs"
              title="Copy clean plain text for pasting into HR portals"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copied ? 'Copied ATS Text!' : 'Copy ATS Plain Text'}</span>
              <span className="sm:hidden">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-indigo-600/25"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print to PDF</span>
            </button>
          </div>
        </div>

        {/* Content Area: Two Panels (Left: Live Editor, Right: Sheet Preview) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* Left Panel: Form Inputs */}
          <div className={`lg:col-span-5 p-4 sm:p-5 overflow-y-auto space-y-4 border-r border-slate-200 bg-slate-50/50 ${
            mobileViewTab === 'editor' ? 'block' : 'hidden lg:block'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Edit Resume Content</h4>
              <span className="text-[11px] text-indigo-600 font-semibold">Auto-synced</span>
            </div>

            {/* Basic Info */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs shadow-2xs">
              <span className="font-bold text-slate-800 block">Personal Details</span>
              <input
                type="text"
                placeholder="Full Name"
                value={resumeData.fullName}
                onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              />
              <input
                type="text"
                placeholder="Professional Headline"
                value={resumeData.headline}
                onChange={(e) => setResumeData({ ...resumeData, headline: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={resumeData.email}
                  onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={resumeData.phone}
                  onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <input
                type="text"
                placeholder="City, State, Country"
                value={resumeData.location}
                onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Summary */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5 text-xs shadow-2xs">
              <span className="font-bold text-slate-800 block">Professional Summary</span>
              <textarea
                rows={3}
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                placeholder="Highlight years of experience, core technical stack, and top achievement..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Skills */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs shadow-2xs">
              <span className="font-bold text-slate-800 block">Core Skills (comma separated)</span>
              <input
                type="text"
                value={resumeData.skills.join(', ')}
                onChange={(e) =>
                  setResumeData({
                    ...resumeData,
                    skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {resumeData.skills.map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Experience History</span>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Role</span>
                </button>
              </div>

              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Position #{index + 1}</span>
                    {resumeData.experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="text-rose-500 hover:text-rose-700 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const updated = [...resumeData.experience];
                        updated[index].title = e.target.value;
                        setResumeData({ ...resumeData, experience: updated });
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...resumeData.experience];
                        updated[index].company = e.target.value;
                        setResumeData({ ...resumeData, experience: updated });
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Duration"
                      value={exp.duration}
                      onChange={(e) => {
                        const updated = [...resumeData.experience];
                        updated[index].duration = e.target.value;
                        setResumeData({ ...resumeData, experience: updated });
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => {
                        const updated = [...resumeData.experience];
                        updated[index].location = e.target.value;
                        setResumeData({ ...resumeData, experience: updated });
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom quick view button on mobile */}
            <div className="lg:hidden pt-2">
              <button
                type="button"
                onClick={() => setMobileViewTab('preview')}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Formatted PDF Sheet</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Live Clean Resume Sheet (A4 format) */}
          <div className={`lg:col-span-7 p-3 sm:p-6 overflow-y-auto bg-slate-200/70 flex justify-center ${
            mobileViewTab === 'preview' ? 'block' : 'hidden lg:flex'
          }`}>
            <div
              id="harvard-resume-sheet"
              ref={printRef}
              className={`bg-white w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-12 shadow-xl border border-slate-300 transition-all my-auto ${
                template === 'harvard' ? 'font-serif text-slate-900' : 'font-sans text-slate-800'
              }`}
            >
              {/* Header */}
              <div className="text-center pb-4 border-b border-black">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight uppercase">
                  {resumeData.fullName}
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 mt-1">
                  {resumeData.headline}
                </p>
                <div className="text-[11px] sm:text-xs text-slate-600 mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                  <span>{resumeData.email}</span>
                  <span>•</span>
                  <span>{resumeData.phone}</span>
                  <span>•</span>
                  <span>{resumeData.location}</span>
                  {resumeData.linkedin && (
                    <>
                      <span>•</span>
                      <span>{resumeData.linkedin}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary */}
              {resumeData.summary && (
                <div className="mt-4 sm:mt-5">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider pb-1 border-b border-black">
                    Professional Summary
                  </h2>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-800 mt-2 text-justify">
                    {resumeData.summary}
                  </p>
                </div>
              )}

              {/* Core Skills */}
              <div className="mt-4 sm:mt-5">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider pb-1 border-b border-black">
                  Technical Expertise & Core Competencies
                </h2>
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-800 mt-2">
                  <span className="font-bold">Technologies & Tools: </span>
                  {resumeData.skills.join(', ')}
                </p>
              </div>

              {/* Experience */}
              <div className="mt-4 sm:mt-5">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider pb-1 border-b border-black">
                  Professional Experience
                </h2>
                <div className="mt-2.5 sm:mt-3 space-y-3 sm:space-y-4">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex items-baseline justify-between text-xs sm:text-[13px]">
                        <div>
                          <span className="font-bold uppercase">{exp.title}</span>
                          <span className="text-slate-600"> | {exp.company}</span>
                        </div>
                        <span className="font-semibold text-slate-600 text-xs">{exp.duration}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">{exp.location}</div>
                      <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs sm:text-[12.5px] leading-relaxed text-slate-800">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mt-4 sm:mt-5">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider pb-1 border-b border-black">
                  Education & Credentials
                </h2>
                <div className="mt-2.5 sm:mt-3 space-y-2">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="flex items-baseline justify-between text-xs sm:text-[13px]">
                      <div>
                        <div className="font-bold">{edu.degree}</div>
                        <div className="text-slate-600 text-xs">{edu.institution}, {edu.location}</div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-semibold text-slate-600 block">{edu.year}</span>
                        <span className="font-bold text-slate-800">{edu.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {resumeData.projects && resumeData.projects.length > 0 && (
                <div className="mt-4 sm:mt-5">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider pb-1 border-b border-black">
                    Key Projects & Technical Implementations
                  </h2>
                  <div className="mt-2 space-y-1.5">
                    {resumeData.projects.map((proj) => (
                      <div key={proj.id} className="text-xs sm:text-[12.5px] leading-relaxed">
                        <span className="font-bold">{proj.name}: </span>
                        <span className="text-slate-800">{proj.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Modal Footer with Clear Close Option */}
        <div className="p-3 sm:px-6 sm:py-3 bg-white border-t border-slate-200 flex items-center justify-between flex-shrink-0 text-xs">
          <span className="text-slate-500 hidden sm:inline">
            ATS Score: <strong className="text-emerald-600">{atsScore}%</strong> • Optimized for Harvard standards
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
              <span>Download / Print PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ResumeBuilderModal;
