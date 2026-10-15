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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[800] bg-[#07090e]/90 backdrop-blur-2xl border-t border-white/[0.08] py-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] px-2 shadow-[0_-12px_40px_rgba(0,0,0,0.85)] select-none">
      <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
        
        {/* 1. Feed (Home) */}
        <button
          onClick={() => setCurrentTab('feed')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
            currentTab === 'feed'
              ? 'text-white font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 flex-shrink-0 transition-transform ${currentTab === 'feed' ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : ''}`} />
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center ${currentTab === 'feed' ? 'text-indigo-300 font-bold' : ''}`}>Feed</span>
          {currentTab === 'feed' && (
            <span className="w-1.5 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 mt-0.5 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          )}
        </button>

        {/* 2. My Network */}
        <button
          onClick={() => setCurrentTab('network')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
            currentTab === 'network'
              ? 'text-white font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 flex-shrink-0 transition-transform ${currentTab === 'network' ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : ''}`} />
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center ${currentTab === 'network' ? 'text-indigo-300 font-bold' : ''}`}>Network</span>
          {currentTab === 'network' && (
            <span className="w-1.5 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 mt-0.5 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          )}
        </button>

        {/* 3. Center Elevated JobScout Radar Button */}
        <div className="col-span-1 flex flex-col items-center justify-center relative">
          <button
            onClick={() => setCurrentTab('map')}
            className="relative -top-3.5 flex flex-col items-center group active:scale-95 transition-transform"
          >
            {/* Ambient Aura Halo */}
            <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500 via-cyan-400 to-violet-500 blur-md transition-opacity duration-300 ${
              currentTab === 'map' ? 'opacity-80' : 'opacity-30 group-hover:opacity-60'
            }`} />

            <div className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${
              currentTab === 'map'
                ? 'bg-[#090d16] border border-cyan-400/50 shadow-[0_0_25px_rgba(56,189,248,0.45)] ring-2 ring-indigo-500/50 scale-105'
                : 'bg-[#090d16]/95 border border-white/15 text-indigo-300 ring-1 ring-white/10 group-hover:border-indigo-400/40'
            }`}>
              <JobScoutLogo size={38} withBadge={false} animated={currentTab === 'map'} />
              
              {/* Radar Live Beacon Dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-tr from-emerald-400 to-cyan-400 border-2 border-[#090d16] shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
              </span>
            </div>

            <span className={`text-[10px] font-black tracking-wider uppercase mt-1 ${
              currentTab === 'map' ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300' : 'text-slate-400'
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
              ? 'text-white font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Briefcase className={`w-5 h-5 flex-shrink-0 transition-transform ${currentTab === 'jobs' ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : ''}`} />
            {jobsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-[8px] text-white font-extrabold px-1.5 py-0.2 rounded-full border border-white/20 shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                {jobsCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center ${currentTab === 'jobs' ? 'text-indigo-300 font-bold' : ''}`}>Jobs</span>
          {currentTab === 'jobs' && (
            <span className="w-1.5 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 mt-0.5 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          )}
        </button>

        {/* 5. Messages (Full-Page Chat) */}
        <button
          onClick={() => setCurrentTab('messages')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative ${
            currentTab === 'messages'
              ? 'text-white font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 flex-shrink-0 transition-transform ${currentTab === 'messages' ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : ''}`} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center ${currentTab === 'messages' ? 'text-indigo-300 font-bold' : ''}`}>Chat</span>
          {currentTab === 'messages' && (
            <span className="w-1.5 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 mt-0.5 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          )}
        </button>

      </div>
    </nav>
  );
};
