import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  User, 
  Sparkles, 
  Zap, 
  Radio, 
  Phone, 
  Video, 
  MessageSquare, 
  Flame, 
  Compass, 
  ArrowRight, 
  CornerDownLeft, 
  X,
  Sliders,
  Navigation
} from 'lucide-react';

export const CommandPalette = ({
  isOpen,
  onClose,
  jobs = [],
  seekers = [],
  onNavigateTab,
  onSelectJob,
  onSelectSeeker,
  onOpenPostJob
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation & global shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanQ = query.trim().toLowerCase();

  // Quick action navigation items
  const quickActions = [
    {
      id: 'nav_map',
      title: 'Interactive Live Radar Map',
      subtitle: 'Explore nearby jobs & talent with live GPS radar',
      icon: Compass,
      badge: 'Radar',
      action: () => { onNavigateTab('map'); onClose(); }
    },
    {
      id: 'nav_jobs',
      title: 'Explore All Job Openings',
      subtitle: 'Browse full-time, remote, & urgent job listings',
      icon: Briefcase,
      badge: 'Jobs',
      action: () => { onNavigateTab('jobs'); onClose(); }
    },
    {
      id: 'nav_feed',
      title: 'Community Feed & Updates',
      subtitle: 'Read professional posts, hiring alerts, and updates',
      icon: Sparkles,
      badge: 'Feed',
      action: () => { onNavigateTab('feed'); onClose(); }
    },
    {
      id: 'nav_connect',
      title: 'Speed Networking (WebRTC Video & Voice)',
      subtitle: 'Connect instantly with recruiters and top talent',
      icon: Video,
      badge: 'Live',
      action: () => { onNavigateTab('connect'); onClose(); }
    },
    {
      id: 'nav_anon',
      title: 'Anonymous Salary & Career Discussion',
      subtitle: 'Ask honest career questions with complete privacy',
      icon: MessageSquare,
      badge: 'Anon',
      action: () => { onNavigateTab('anon'); onClose(); }
    },
    {
      id: 'action_post',
      title: 'Post a New Opening (Recruiter)',
      subtitle: 'Publish a job pin to the national live map',
      icon: Zap,
      badge: 'Hiring',
      action: () => { onOpenPostJob(); onClose(); }
    }
  ];

  // Filtered Actions
  const filteredActions = cleanQ
    ? quickActions.filter(a => 
        a.title.toLowerCase().includes(cleanQ) || 
        a.subtitle.toLowerCase().includes(cleanQ)
      )
    : quickActions;

  // Filtered Jobs
  const filteredJobs = cleanQ
    ? jobs.filter(j => 
        j.title?.toLowerCase().includes(cleanQ) || 
        j.company?.toLowerCase().includes(cleanQ) || 
        j.address?.toLowerCase().includes(cleanQ) ||
        (j.skills && j.skills.some(sk => sk.toLowerCase().includes(cleanQ)))
      ).slice(0, 5)
    : jobs.slice(0, 3);

  // Filtered Seekers
  const filteredSeekers = cleanQ
    ? seekers.filter(s => 
        s.name?.toLowerCase().includes(cleanQ) || 
        s.title?.toLowerCase().includes(cleanQ) ||
        (s.skills && s.skills.some(sk => sk.toLowerCase().includes(cleanQ)))
      ).slice(0, 4)
    : seekers.slice(0, 3);

  // Flattened items for keyboard arrow navigation
  const allItems = [
    ...filteredActions.map(a => ({ type: 'action', data: a })),
    ...filteredJobs.map(j => ({ type: 'job', data: j })),
    ...filteredSeekers.map(s => ({ type: 'seeker', data: s }))
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        if (current.type === 'action') current.data.action();
        else if (current.type === 'job') { onSelectJob(current.data); onClose(); }
        else if (current.type === 'seeker') { onSelectSeeker(current.data); onClose(); }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-start justify-center pt-16 sm:pt-24 p-3 bg-slate-950/65 backdrop-blur-xl animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_30px_90px_-15px_rgba(15,23,42,0.35),0_0_0_1px_rgba(255,255,255,0.8)] overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-200 relative"
      >
        {/* Subtle top iridescent highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />
        {/* Spotlight Search Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, job title, company, skill, or area..."
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/80">
              <span>ESC to exit</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 sm:p-3 space-y-4">
          
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Navigation & Shortcuts
              </div>
              <div className="space-y-1 mt-1">
                {filteredActions.map((item, idx) => {
                  const globalIdx = idx;
                  const isSelected = selectedIndex === globalIdx;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {item.title}
                          </p>
                          <p className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Job Openings */}
          {filteredJobs.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Matching Jobs ({filteredJobs.length})</span>
                <span className="text-[10px] text-indigo-600 font-bold">Press Enter to View</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredJobs.map((job, idx) => {
                  const globalIdx = filteredActions.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  return (
                    <div
                      key={job.id}
                      onClick={() => { onSelectJob(job); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {job.title}
                          </p>
                          <p className={`text-[11px] truncate flex items-center gap-1.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                            <span>{job.company}</span>
                            <span>•</span>
                            <span>{job.address}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {job.salary ? job.salary.split('-')[0].trim() : 'Active'}
                        </span>
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Candidates & Seekers */}
          {filteredSeekers.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Nearby Candidates ({filteredSeekers.length})</span>
                <span className="text-[10px] text-emerald-600 font-bold">1-Click Voice/Video</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredSeekers.map((seeker, idx) => {
                  const globalIdx = filteredActions.length + filteredJobs.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  return (
                    <div
                      key={seeker.id}
                      onClick={() => { onSelectSeeker(seeker); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-md' 
                          : 'hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={seeker.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${seeker.name}`}
                          alt={seeker.name}
                          className="w-8 h-8 rounded-full border border-white/60 object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {seeker.name}
                          </p>
                          <p className={`text-[11px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {seeker.title || 'Available Candidate'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {seeker.distanceKm ? `${seeker.distanceKm} km` : 'Local'}
                        </span>
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {allItems.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching commands, jobs, or candidates found for "{query}".
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-indigo-600">
            <Sparkles className="w-3 h-3" />
            <span>JobScout Spotlight</span>
          </div>
        </div>

      </div>
    </div>
  );
};
