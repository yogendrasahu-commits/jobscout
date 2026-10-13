import React from 'react';
import { 
  Home,
  Users,
  Briefcase, 
  MessageSquare,
  Radar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { JobScoutLogo } from './JobScoutLogo';

export const MobileBottomNav = ({ 
  currentTab, 
  setCurrentTab, 
  jobsCount = 0 
}) => {
  const { user } = useAuth();
  const { incomingMessage } = useSocket();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[800] bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] px-1 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.8)] select-none">
      <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
        
        {/* 1. Feed (Home) */}
        <button
          onClick={() => setCurrentTab('feed')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
            currentTab === 'feed'
              ? 'text-indigo-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center">Feed</span>
          {currentTab === 'feed' && (
            <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
          )}
        </button>

        {/* 2. My Network */}
        <button
          onClick={() => setCurrentTab('network')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
            currentTab === 'network'
              ? 'text-indigo-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 flex-shrink-0" />
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center">Network</span>
          {currentTab === 'network' && (
            <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
          )}
        </button>

        {/* 3. Center Elevated JobScout Radar Button */}
        <div className="col-span-1 flex flex-col items-center justify-center relative">
          <button
            onClick={() => setCurrentTab('map')}
            className="relative -top-3 flex flex-col items-center group active:scale-95 transition-transform"
          >
            <div className={`relative flex items-center justify-center w-11 h-11 rounded-2xl shadow-xl transition-all ${
              currentTab === 'map'
                ? 'bg-slate-950 shadow-indigo-500/50 scale-105 ring-3 ring-indigo-500/60'
                : 'bg-slate-950/90 border border-indigo-500/40 text-indigo-300 ring-2 ring-slate-800'
            }`}>
              <JobScoutLogo size={36} withBadge={false} animated={currentTab === 'map'} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
            </div>
            <span className={`text-[10px] font-extrabold mt-0.5 ${
              currentTab === 'map' ? 'text-indigo-400' : 'text-slate-400'
            }`}>
              Radar
            </span>
          </button>
        </div>

        {/* 4. Jobs */}
        <button
          onClick={() => setCurrentTab('jobs')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative ${
            currentTab === 'jobs'
              ? 'text-indigo-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Briefcase className="w-5 h-5 flex-shrink-0" />
            {jobsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-indigo-600 text-[8px] text-white font-extrabold px-1 rounded-full border border-slate-900">
                {jobsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center">Jobs</span>
          {currentTab === 'jobs' && (
            <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
          )}
        </button>

        {/* 5. Messages (Full-Page Chat) */}
        <button
          onClick={() => setCurrentTab('messages')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative ${
            currentTab === 'messages'
              ? 'text-indigo-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center font-bold">Chat</span>
          {currentTab === 'messages' && (
            <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
          )}
        </button>

      </div>
    </nav>
  );
};
