import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  FileText, 
  Zap, 
  TrendingUp, 
  Briefcase, 
  BookOpen, 
  Check, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractSkillsFromResume } from '../utils/aiMatchEngine';
import { triggerConfetti } from '../utils/confetti';
import { playSuccessChime } from '../utils/soundEffects';

export const AIMatchModal = ({ 
  isOpen, 
  onClose, 
  job = { title: 'General Profile Analysis', company: 'JobScout AI' }, 
  matchResult = { score: 75, tier: 'strong', label: '75% Profile Readiness', matchedSkills: [], missingSkills: [], recommendations: [], summary: 'AI profile assessment active.' }, 
  onProfileUpdated,
  defaultTab = 'analysis'
}) => {
  const { user, token, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [resumeText, setResumeText] = useState('');
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [addingSkill, setAddingSkill] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState('');

  if (!isOpen) return null;

  const { score, tier, label, matchedSkills = [], missingSkills = [], recommendations = [], summary } = matchResult;

  // Add a missing skill directly to user profile
  const handleAddSkillToProfile = async (skill) => {
    if (!user || !token) return;
    setAddingSkill(skill);

    try {
      const currentSkills = Array.isArray(user.skills) ? [...user.skills] : [];
      if (!currentSkills.includes(skill)) {
        currentSkills.push(skill);
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ skills: currentSkills })
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        triggerConfetti();
        playSuccessChime();
        if (onProfileUpdated) onProfileUpdated(data.user);
      }
    } catch (err) {
      console.error('Failed to add skill to profile:', err);
    } finally {
      setAddingSkill(null);
    }
  };

  // AI Resume Text Parser
  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setParsingResume(true);
    setResumeSuccessMsg('');

    // Simulate short neural processing delay for realistic UX
    setTimeout(async () => {
      const detected = extractSkillsFromResume(resumeText);
      setExtractedSkills(detected);

      if (detected.length > 0 && user && token) {
        const existing = Array.isArray(user.skills) ? user.skills : [];
        const merged = Array.from(new Set([...existing, ...detected]));

        try {
          const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ skills: merged })
          });

          if (res.ok) {
            const data = await res.json();
            updateUser(data.user);
            triggerConfetti();
            playSuccessChime();
            setResumeSuccessMsg(`✨ Successfully extracted and added ${detected.length} skills to your profile!`);
            if (onProfileUpdated) onProfileUpdated(data.user);
          }
        } catch (err) {
          console.error('Failed to sync extracted skills:', err);
        }
      } else if (detected.length === 0) {
        setResumeSuccessMsg('No technical skills detected. Try pasting your skills summary or project bullets.');
      }

      setParsingResume(false);
    }, 600);
  };

  // Color schemes based on score
  let strokeColor = '#64748b';
  let badgeTheme = 'bg-slate-100 text-slate-800 border-slate-200';
  if (score >= 82) {
    strokeColor = '#10b981';
    badgeTheme = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (score >= 68) {
    strokeColor = '#6366f1';
    badgeTheme = 'bg-indigo-50 text-indigo-800 border-indigo-200';
  } else if (score >= 50) {
    strokeColor = '#f59e0b';
    badgeTheme = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 leading-tight flex items-center gap-1.5">
                AI Resume & Job Fit Match
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700">
                  JobScout AI
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-sm">
                Target: <strong className="text-slate-800">{job.title}</strong> at {job.company || job.employerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 px-5 pt-2 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-2.5 transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === 'analysis'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Fit Score & Skill Gap</span>
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`pb-2.5 transition-all flex items-center gap-1.5 border-b-2 ${
              activeTab === 'resume'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>AI Resume Scanner</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'analysis' ? (
            <>
              {/* Score Gauge Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80 flex items-center gap-5">
                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={strokeColor}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-black text-xl text-slate-900 leading-none">{score}%</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Match</span>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${badgeTheme}`}>
                      {label}
                    </span>
                    {score >= 80 && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <Zap className="w-3 h-3" /> Top 10% Candidate
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {summary}
                  </p>
                </div>
              </div>

              {/* Skills Analysis Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Matched Skills */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Matching Skills ({matchedSkills.length})
                    </span>
                    <span className="text-[10px] text-emerald-700 font-extrabold">Verified</span>
                  </div>

                  {matchedSkills.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No direct skills matched yet. Add relevant skills below to boost your score!
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {matchedSkills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300"
                        >
                          <Check className="w-3 h-3" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing Skills with 1-Click Add */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-indigo-600" />
                      Recommended Skills ({missingSkills.length})
                    </span>
                    <span className="text-[10px] text-indigo-600 font-medium">1-Click Add</span>
                  </div>

                  {missingSkills.length === 0 ? (
                    <p className="text-xs text-emerald-700 font-bold py-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> You satisfy all core technical skills!
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {missingSkills.map(skill => (
                        <button
                          key={skill}
                          onClick={() => handleAddSkillToProfile(skill)}
                          disabled={addingSkill === skill}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-white hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          title="If you know this skill, click to instantly add it to your profile"
                        >
                          {addingSkill === skill ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                          <span>{skill}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Career Copilot Recommendations */}
              {recommendations.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    AI Action Items to Increase Shortlisting:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            /* AI Resume Scanner Tab */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Instant Neural Resume & Skills Extractor
                </p>
                <p className="text-[11px] text-slate-600">
                  Paste your resume text, LinkedIn summary, or project bullet points below. JobScout AI will automatically extract your technical skills and sync them to your profile.
                </p>
              </div>

              <textarea
                rows={5}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Example: Fullstack developer with 3 years building web apps using React, Node.js, WebRTC, Tailwind CSS, PostgreSQL, and Docker. Experience with AWS S3 and Jest automation..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400 font-mono"
              />

              {resumeSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{resumeSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {resumeText.trim().split(/\s+/).filter(Boolean).length} words entered
                </span>

                <button
                  type="button"
                  onClick={handleParseResume}
                  disabled={parsingResume || !resumeText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
                >
                  {parsingResume ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning Resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extract & Sync Skills</span>
                    </>
                  )}
                </button>
              </div>

              {extractedSkills.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Extracted Skills ({extractedSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedSkills.map(s => (
                      <span
                        key={s}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Powered by JobScout Match Engine
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIMatchModal;
