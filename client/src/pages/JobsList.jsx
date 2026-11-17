import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Filter, 
  Sparkles, 
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Zap,
  FileText,
  Bookmark,
  BookmarkCheck,
  Globe,
  SlidersHorizontal,
  ArrowUpDown,
  Car,
  Building,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApplicationsView } from './ApplicationsView';
import { calculateAIMatch } from '../utils/aiMatchEngine';
import { AIMatchBadge } from '../components/AIMatchBadge';
import { AIMatchModal } from '../components/AIMatchModal';
import { SmartCommuteModal } from '../components/SmartCommuteModal';

export const JobsList = ({ 
  jobs = [], 
  onSelectJob, 
  onOpenPostJob,
  searchTerm: externalSearchTerm,
  setSearchTerm: externalSetSearchTerm,
  onOpenProfile,
  onOpenAuth,
  activeSubTab: externalActiveSubTab,
  setActiveSubTab: externalSetActiveSubTab,
  defaultSubTab = 'browse',
  initialQuickFilter = 'all',
  onQuickFilterChange
}) => {
  const { user, token, isEmployer } = useAuth();
  const userSkills = (user?.skills || []).map(s => String(s).toLowerCase().trim());
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalActiveSubTab, setInternalActiveSubTab] = useState(defaultSubTab);
  const [selectedMatchJob, setSelectedMatchJob] = useState(null);
  const [commuteModalJob, setCommuteModalJob] = useState(null);

  const activeSubTab = externalActiveSubTab !== undefined ? externalActiveSubTab : internalActiveSubTab;
  const setActiveSubTab = externalSetActiveSubTab || setInternalActiveSubTab;

  const [applicationsCount, setApplicationsCount] = useState(0);

  // Bookmarking / Saved Jobs State (with cloud sync & localStorage offline fallback)
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobscout_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  // Sync saved jobs from backend when user logs in
  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/saved-jobs', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.savedJobs && Array.isArray(data.savedJobs)) {
          setSavedJobIds(data.savedJobs);
          localStorage.setItem('jobscout_saved_jobs', JSON.stringify(data.savedJobs));
        }
      })
      .catch(() => {});
  }, [token]);

  const toggleSaveJob = (e, jobId) => {
    e.stopPropagation();
    setSavedJobIds(prev => {
      const updated = prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId];
      localStorage.setItem('jobscout_saved_jobs', JSON.stringify(updated));
      return updated;
    });

    if (token) {
      fetch('/api/auth/saved-jobs/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ jobId })
      }).catch(() => {});
    }
  };

  // Sync with defaultSubTab if changed externally
  useEffect(() => {
    if (defaultSubTab && externalActiveSubTab === undefined) {
      setInternalActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  // Initial fetch of applications count for badge
  useEffect(() => {
    if (!token) {
      setApplicationsCount(0);
      return;
    }
    const endpoint = isEmployer ? '/api/applications/employer' : '/api/applications/my';
    fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data?.applications) {
          setApplicationsCount(data.applications.length);
        }
      })
      .catch(() => {});
  }, [token, isEmployer]);

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = externalSetSearchTerm || setInternalSearchTerm;

  // Filters State
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [quickFilter, setQuickFilter] = useState(initialQuickFilter || 'all'); // 'all', 'saved', 'urgent', 'remote', 'easy_apply'

  useEffect(() => {
    if (initialQuickFilter) {
      setQuickFilter(initialQuickFilter);
    }
  }, [initialQuickFilter]);

  const handleQuickFilterChange = (filter) => {
    setQuickFilter(filter);
    if (onQuickFilterChange) onQuickFilterChange(filter);
  };

  // Filter & Sort Logic
  const filteredJobs = jobs
    .filter(j => {
      // Search match
      const s = searchTerm.toLowerCase();
      const matchesSearch = !s || (
        j.title?.toLowerCase().includes(s) ||
        j.company?.toLowerCase().includes(s) ||
        j.address?.toLowerCase().includes(s) ||
        (j.skills && j.skills.some(sk => sk.toLowerCase().includes(s)))
      );

      // Dropdown filters
      const matchesType = selectedType === 'All' ? true : j.jobType === selectedType;
      const matchesCategory = selectedCategory === 'All' ? true : (
        j.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Technology' && (j.category === 'Technology' || j.skills?.some(sk => ['React', 'Node.js', 'Python', 'Go'].includes(sk)))) ||
        (selectedCategory === 'AI & Data' && (j.title?.toLowerCase().includes('ai') || j.title?.toLowerCase().includes('data') || j.skills?.some(sk => ['PyTorch', 'LLM', 'SQL', 'Python'].includes(sk))))
      );
      const matchesWorkMode = selectedWorkMode === 'All' ? true : (
        j.workMode === selectedWorkMode || (selectedWorkMode === 'Remote' && (j.address?.toLowerCase().includes('remote') || j.jobType?.toLowerCase().includes('remote')))
      );
      const matchesExperience = selectedExperience === 'All' ? true : (
        j.experienceLevel === selectedExperience || 
        (selectedExperience === 'Senior' && j.title?.toLowerCase().includes('senior')) ||
        (selectedExperience === 'Lead' && j.title?.toLowerCase().includes('lead'))
      );

      // Quick filter chips
      if (quickFilter === 'saved' && !savedJobIds.includes(j.id)) return false;
      if (quickFilter === 'urgent' && !j.urgent) return false;
      if (quickFilter === 'remote' && !(j.workMode === 'Remote' || j.address?.toLowerCase().includes('remote'))) return false;

      return matchesSearch && matchesType && matchesCategory && matchesWorkMode && matchesExperience;
    })
    .sort((a, b) => {
      if (sortBy === 'ai_match') {
        const scoreA = calculateAIMatch(user, a).score;
        const scoreB = calculateAIMatch(user, b).score;
        return scoreB - scoreA;
      }
      if (sortBy === 'salary_high') {
        const salA = a.minSalary || (parseInt((a.salary || '').replace(/[^0-9]/g, '')) || 0);
        const salB = b.minSalary || (parseInt((b.salary || '').replace(/[^0-9]/g, '')) || 0);
        return salB - salA;
      }
      if (sortBy === 'urgent') {
        return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
      }
      // default newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Ultra-Luxury Hero Screen Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-indigo-50/40 to-white border border-slate-200/90 backdrop-blur-2xl p-6 sm:p-8 mb-6 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>Smart Match Engine • Verified Compensation & Distance</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {activeSubTab === 'browse' ? (
                <>
                  Discover Nearby Tech Jobs on{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-500">
                    Live Radar
                  </span>
                </>
              ) : (
                <>
                  {isEmployer ? 'Candidate Applications & ATS' : 'My Applied Jobs & Stamped Offers'}
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {activeSubTab === 'browse'
                ? 'Hyper-local openings with exact commute distance, verified CTC brackets, and 1-click spot video interviews.'
                : (isEmployer 
                    ? 'Review applicants, screen via peer-to-peer WebRTC video, and dispatch stamped offer letters directly to candidate email.' 
                    : 'Track your applications in real time and digitally accept official offer letters with instant hire confirmation.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isEmployer && (
              <button
                onClick={onOpenPostJob}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-cyan-200" />
                <span>+ Post New Opening</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient subtle lighting orbs */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Segmented Sub-Tab Switcher: Explore Jobs vs Applied Jobs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 backdrop-blur-md rounded-full border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={() => setActiveSubTab('browse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeSubTab === 'browse'
                ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Explore Openings</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubTab === 'browse' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/70 text-slate-600'
            }`}>
              {jobs.length}
            </span>
          </button>

          {user?.role !== 'admin' && (
            <button
              type="button"
              onClick={() => setActiveSubTab('applied')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeSubTab === 'applied'
                  ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{isEmployer ? 'Candidate Applications' : 'Applied Jobs'}</span>
              {applicationsCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeSubTab === 'applied' ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {applicationsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Active Sub-Tab View */}
      {activeSubTab === 'applied' ? (
        <ApplicationsView 
          onOpenProfile={onOpenProfile}
          onOpenAuth={onOpenAuth}
          embedded={true}
          onCountChange={setApplicationsCount}
        />
      ) : (
        <>
          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
            <button
              type="button"
              onClick={() => handleQuickFilterChange('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                quickFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span>All Openings</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${quickFilter === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
                {jobs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFilterChange('saved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                quickFilter === 'saved'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${quickFilter === 'saved' ? 'fill-white text-white' : 'text-amber-500 fill-amber-500'}`} />
              <span>Saved Jobs</span>
              {savedJobIds.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${quickFilter === 'saved' ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}>
                  {savedJobIds.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleQuickFilterChange('urgent')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                quickFilter === 'urgent'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>🔥 Urgent Spot Hiring</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFilterChange('remote')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                quickFilter === 'remote'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-500" />
              <span>🌐 100% Remote</span>
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-sm space-y-3 md:sticky md:top-20 z-20">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by job title, company, skills, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Filter Controls Row */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                {/* Category */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                >
                  <option value="All">All Categories</option>
                  <option value="Technology">Technology & Eng</option>
                  <option value="AI & Data">AI & Data Science</option>
                  <option value="Design">UI/UX & Design</option>
                  <option value="Product">Product & Growth</option>
                  <option value="Logistics">Logistics & Supply</option>
                  <option value="Finance">Fintech & Finance</option>
                  <option value="Support">Support & IT</option>
                  <option value="Healthcare">Healthcare</option>
                </select>

                {/* Work Mode */}
                <select
                  value={selectedWorkMode}
                  onChange={(e) => setSelectedWorkMode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                >
                  <option value="All">All Modes</option>
                  <option value="Remote">100% Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>

                {/* Job Type */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                >
                  <option value="All">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract / Gig">Contract / Gig</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Part-time">Part-time</option>
                </select>

                {/* Sort By */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs text-slate-700 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="ai_match">✨ Best AI Fit</option>
                    <option value="salary_high">Highest Salary</option>
                    <option value="urgent">Urgent First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchTerm || selectedCategory !== 'All' || selectedType !== 'All' || selectedWorkMode !== 'All' || quickFilter !== 'all') && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Showing <strong>{filteredJobs.length}</strong> matching results
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedType('All');
                    setSelectedWorkMode('All');
                    setQuickFilter('all');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-xs"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Matching Jobs Found</h3>
              <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedType('All');
                  setSelectedWorkMode('All');
                  setQuickFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
              {filteredJobs.map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                
                // Compute smart AI skill match
                const matchResult = user?.role !== 'emp' ? calculateAIMatch(user, job) : null;

                return (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="group card-spotlight bg-white/95 hover:bg-white backdrop-blur-2xl border border-slate-200/90 hover:border-indigo-400/90 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-8px_rgba(99,102,241,0.16)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top subtle hairline glow */}
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Top Badges & Bookmark */}
                      <div className="flex items-start justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                            {job.jobType}
                          </span>
                          {job.workMode && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                              {job.workMode}
                            </span>
                          )}
                          {job.urgent && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg shadow-2xs">
                              <Flame className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" /> Urgent
                            </span>
                          )}
                          {matchResult && (
                            <AIMatchBadge
                              matchResult={matchResult}
                              compact={true}
                              onClick={() => setSelectedMatchJob(job)}
                            />
                          )}
                        </div>

                        {/* 1-Click Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleSaveJob(e, job.id)}
                          className={`p-2 rounded-xl border transition-all active:scale-95 ${
                            isSaved 
                              ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-xs' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                          title={isSaved ? 'Remove from Saved Jobs' : 'Save Job for Later'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                      </div>

                      {/* Company Avatar & Job Title */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 border border-indigo-200/70 flex items-center justify-center font-black text-sm text-indigo-700 flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          {(job.company || 'JS').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-600 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{job.company}</span>
                          </p>
                        </div>
                      </div>

                      {/* Prominent Tabular Figures Salary & Commute */}
                      <div className="mt-3.5 flex items-center justify-between gap-2">
                        <span className="font-mono tracking-tight font-black text-xs sm:text-sm text-emerald-800 bg-emerald-50/90 px-3 py-1 rounded-xl border border-emerald-200/90 shadow-2xs flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 -mr-0.5" />
                          <span>{job.salary || 'Competitive'}</span>
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {job.distanceKm && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100/90 px-2 py-1 rounded-xl border border-slate-200">
                              <Car className="w-3 h-3 text-indigo-600" />
                              <span>{job.distanceKm} km</span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCommuteModalJob(job);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl border border-indigo-200 transition-colors shadow-2xs"
                            title="Calculate travel time via Metro, Bike, Cab & Walking"
                          >
                            <span>🚇</span>
                            <span>Commute</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.address}</span>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((s, idx) => {
                            const isMatched = userSkills.includes(s.toLowerCase().trim());
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border ${
                                  isMatched 
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' 
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {isMatched ? '✓ ' : ''}{s}
                              </span>
                            );
                          })}
                          {job.skills.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-50 rounded-lg">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      {user?.role === 'admin' ? (
                        <span className="flex items-center gap-1.5 text-rose-700 font-black text-[11px] bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 shadow-2xs">
                          <ShieldCheck className="w-3 h-3 text-rose-600" /> Admin Oversight
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-700 font-black text-[11px] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <Zap className="w-3 h-3 fill-current" /> Easy Apply
                        </span>
                      )}
                      <span className="text-slate-500 font-bold group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        {user?.role === 'admin' ? 'Manage Role' : 'View Role'} <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Interactive AI Skill Match Modal */}
      {selectedMatchJob && (
        <AIMatchModal
          isOpen={Boolean(selectedMatchJob)}
          onClose={() => setSelectedMatchJob(null)}
          job={selectedMatchJob}
          matchResult={calculateAIMatch(user, selectedMatchJob)}
        />
      )}

      {/* Smart Commute & Transit Estimator Modal */}
      {commuteModalJob && (
        <SmartCommuteModal
          isOpen={Boolean(commuteModalJob)}
          onClose={() => setCommuteModalJob(null)}
          job={commuteModalJob}
          userCoords={user ? { lat: user.lat, lng: user.lng } : null}
          userAddress={user?.address}
        />
      )}

    </div>
  );
};
