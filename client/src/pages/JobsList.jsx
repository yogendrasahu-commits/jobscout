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
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApplicationsView } from './ApplicationsView';

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
  defaultSubTab = 'browse'
}) => {
  const { user, token, isEmployer } = useAuth();
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalActiveSubTab, setInternalActiveSubTab] = useState(defaultSubTab);

  const activeSubTab = externalActiveSubTab !== undefined ? externalActiveSubTab : internalActiveSubTab;
  const setActiveSubTab = externalSetActiveSubTab || setInternalActiveSubTab;

  const [applicationsCount, setApplicationsCount] = useState(0);

  // Bookmarking / Saved Jobs State
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobscout_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  const toggleSaveJob = (e, jobId) => {
    e.stopPropagation();
    setSavedJobIds(prev => {
      const updated = prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId];
      localStorage.setItem('jobscout_saved_jobs', JSON.stringify(updated));
      return updated;
    });
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
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'saved', 'urgent', 'remote', 'easy_apply'

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
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeSubTab === 'browse'
              ? 'Discover Live Nearby Jobs'
              : (isEmployer ? 'Candidate Applications & Resumes' : 'My Applied Jobs')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeSubTab === 'browse'
              ? 'Realtime location-matched openings ready for instant chat & interviews'
              : (isEmployer 
                  ? 'Review applicants for your posted jobs, schedule live video/voice interviews' 
                  : 'Track your submitted applications and interview requests')}
          </p>
        </div>

        {isEmployer && (
          <button
            onClick={onOpenPostJob}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Briefcase className="w-4 h-4" />
            Post New Opening
          </button>
        )}
      </div>

      {/* Segmented Sub-Tab Switcher: Explore Jobs vs Applied Jobs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('browse')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'browse'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30'
              : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-xs'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Explore Openings</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeSubTab === 'browse' ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {jobs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('applied')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'applied'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30'
              : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-xs'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isEmployer ? 'Candidate Applications' : 'Applied Jobs'}</span>
          {applicationsCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeSubTab === 'applied' ? 'bg-indigo-700/80 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {applicationsCount}
            </span>
          )}
        </button>
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
              onClick={() => setQuickFilter('all')}
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
              onClick={() => setQuickFilter('saved')}
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
              onClick={() => setQuickFilter('urgent')}
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
              onClick={() => setQuickFilter('remote')}
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
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-sm space-y-3">
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
                return (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="group bg-white/95 hover:bg-white backdrop-blur-2xl border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative"
                  >
                    <div>
                      {/* Top Badges & Bookmark */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {job.jobType}
                          </span>
                          {job.workMode && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {job.workMode}
                            </span>
                          )}
                          {job.urgent && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
                              <Flame className="w-3 h-3 text-amber-500" /> Urgent
                            </span>
                          )}
                        </div>

                        {/* 1-Click Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleSaveJob(e, job.id)}
                          className={`p-1.5 rounded-xl border transition-all ${
                            isSaved 
                              ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-2xs' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                          title={isSaved ? 'Remove from Saved Jobs' : 'Save Job for Later'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{job.company}</p>

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                        <span>{job.salary}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.address}</span>
                        {job.distanceKm && (
                          <span className="ml-auto text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {job.distanceKm} km
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-700 rounded border border-slate-200"
                            >
                              {s}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-emerald-700 font-extrabold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Easy Apply
                      </span>
                      <span className="text-slate-500 font-semibold group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        Details <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
};
