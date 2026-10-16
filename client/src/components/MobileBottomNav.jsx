import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { JobScoutLogo } from './JobScoutLogo';
import { 
  NavFeedIcon, 
  NavNetworkIcon, 
  NavJobsIcon, 
  NavMessagesIcon 
} from './NavIcons';

export const MobileBottomNav = ({ 
  currentTab, 
  setCurrentTab, 
  jobsCount = 0 
}) => {
  const { user } = useAuth();
  const { incomingMessage } = useSocket();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[800] bg-white/90 backdrop-blur-2xl border-t border-slate-200/90 py-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] px-2 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] select-none">
      <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
        
        {/* 1. Feed (Home) */}
        <button
          onClick={() => setCurrentTab('feed')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
            currentTab === 'feed'
              ? 'text-indigo-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <NavFeedIcon active={currentTab === 'feed'} className="w-5 h-5 flex-shrink-0" />
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center ${currentTab === 'feed' ? 'text-indigo-600 font-bold' : ''}`}>Feed</span>
          {currentTab === 'feed' && (
            <span className="w-1.5 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 mt-0.5 shadow-xs" />
          )}
        </button>

        {/* 2. My Network */}
        <button
          onClick={() => setCurrentTab('network')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
            currentTab === 'network'
              ? 'text-indigo-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <NavNetworkIcon active={currentTab === 'network'} className="w-5 h-5 flex-shrink-0" />
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center ${currentTab === 'network' ? 'text-indigo-600 font-bold' : ''}`}>Network</span>
          {currentTab === 'network' && (
            <span className="w-1.5 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 mt-0.5 shadow-xs" />
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
              currentTab === 'map' ? 'opacity-70' : 'opacity-25 group-hover:opacity-50'
            }`} />

            <div className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${
              currentTab === 'map'
                ? 'bg-white border border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.25)] ring-2 ring-indigo-500/30 scale-105'
                : 'bg-white/95 border border-slate-200 text-indigo-600 ring-1 ring-slate-100 shadow-sm group-hover:border-indigo-400/40'
            }`}>
              <JobScoutLogo size={38} withBadge={false} animated={currentTab === 'map'} />
              
              {/* Radar Live Beacon Dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-tr from-emerald-500 to-cyan-500 border-2 border-white shadow-xs" />
              </span>
            </div>

            <span className={`text-[10px] font-black tracking-wider uppercase mt-1 ${
              currentTab === 'map' ? 'text-indigo-600' : 'text-slate-500'
            }`}>
              Map
            </span>
          </button>
        </div>

        {/* 4. Jobs */}
        <button
          onClick={() => setCurrentTab('jobs')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative ${
            currentTab === 'jobs'
              ? 'text-indigo-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <NavJobsIcon active={currentTab === 'jobs'} className="w-5 h-5 flex-shrink-0" />
            {jobsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-[8px] text-white font-extrabold px-1.5 py-0.2 rounded-full border border-white shadow-xs">
                {jobsCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center ${currentTab === 'jobs' ? 'text-indigo-600 font-bold' : ''}`}>Jobs</span>
          {currentTab === 'jobs' && (
            <span className="w-1.5 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 mt-0.5 shadow-xs" />
          )}
        </button>

        {/* 5. Messages (Full-Page Chat) */}
        <button
          onClick={() => setCurrentTab('messages')}
          className={`col-span-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative ${
            currentTab === 'messages'
              ? 'text-indigo-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <NavMessagesIcon active={currentTab === 'messages'} className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full shadow-xs border border-white" />
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full text-center ${currentTab === 'messages' ? 'text-indigo-600 font-bold' : ''}`}>Chat</span>
          {currentTab === 'messages' && (
            <span className="w-1.5 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 mt-0.5 shadow-xs" />
          )}
        </button>

      </div>
    </nav>
  );
};
