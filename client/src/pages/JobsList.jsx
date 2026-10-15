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
  FileText
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

  const [selectedType, setSelectedType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.skills && j.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesType = selectedType === 'All' ? true : j.jobType === selectedType;
    const matchesCategory = selectedCategory === 'All' ? true : j.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {activeSubTab === 'browse'
              ? 'Discover Live Nearby Jobs'
              : (isEmployer ? 'Candidate Applications & Resumes' : 'My Applied Jobs')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
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
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            Post New Opening
          </button>
        )}
      </div>

      {/* Segmented Sub-Tab Switcher: Explore Jobs vs Applied Jobs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/[0.08] pb-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('browse')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'browse'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/30'
              : 'bg-[#090d16]/80 hover:bg-[#0c121e]/90 text-slate-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Explore Openings</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeSubTab === 'browse' ? 'bg-indigo-700/80 text-white' : 'bg-white/[0.06] text-slate-400'
          }`}>
            {jobs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('applied')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'applied'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/30'
              : 'bg-[#090d16]/80 hover:bg-[#0c121e]/90 text-slate-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isEmployer ? 'Candidate Applications' : 'Applied Jobs'}</span>
          {applicationsCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeSubTab === 'applied' ? 'bg-indigo-700/80 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
          {/* Filter and Search Bar */}
          <div className="bg-[#090d16]/85 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 mb-6 shadow-2xl space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by job title, company, skills, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] hover:border-white/[0.16] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-black/40 border border-white/[0.08] hover:border-white/[0.16] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-all"
                >
                  <option value="All" className="bg-[#0c121e]">All Types</option>
                  <option value="Full-time" className="bg-[#0c121e]">Full-time</option>
                  <option value="Part-time" className="bg-[#0c121e]">Part-time</option>
                  <option value="Contract / Gig" className="bg-[#0c121e]">Gig / Contract</option>
                  <option value="Hourly" className="bg-[#0c121e]">Hourly</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-black/40 border border-white/[0.08] hover:border-white/[0.16] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-all"
                >
                  <option value="All" className="bg-[#0c121e]">All Categories</option>
                  <option value="Technology" className="bg-[#0c121e]">Technology</option>
                  <option value="Design" className="bg-[#0c121e]">Design</option>
                  <option value="Support" className="bg-[#0c121e]">Support & IT</option>
                  <option value="Logistics" className="bg-[#0c121e]">Logistics</option>
                </select>
              </div>
            </div>

            {searchTerm && (
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs">
                <span className="text-slate-400">
                  Filtering by: <strong className="text-white bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/[0.08]">"{searchTerm}"</strong> ({filteredJobs.length} results)
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline text-xs"
                >
                  Clear search filter
                </button>
              </div>
            )}
          </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Jobs Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or switch to the live map.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="group bg-[#090d16]/85 hover:bg-[#0c121e]/95 backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-5 shadow-2xl hover:shadow-[0_15px_30px_rgba(99,102,241,0.15)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {job.jobType}
                  </span>
                  {job.urgent && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
                      <Flame className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{job.company}</p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <span>{job.salary}</span>
                </div>

                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{job.address}</span>
                  {job.distanceKm && (
                    <span className="ml-auto text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/30">
                      {job.distanceKm} km
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {job.skills && job.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-medium bg-black/40 text-slate-300 rounded border border-white/[0.06]"
                      >
                        {s}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-500">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-emerald-400 font-extrabold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" /> Easy Apply
                </span>
                <span className="text-slate-400 font-semibold group-hover:text-indigo-400 flex items-center gap-1 transition-colors">
                  Details <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}

    </div>
  );
};
