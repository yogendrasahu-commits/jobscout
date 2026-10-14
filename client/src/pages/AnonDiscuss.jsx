import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  ArrowBigUp, 
  ArrowBigDown, 
  Share2, 
  Search, 
  Plus, 
  X, 
  ShieldCheck, 
  Dice5, 
  Send, 
  Eye, 
  Coffee, 
  DollarSign, 
  Building2, 
  Lock, 
  CheckCircle2, 
  Compass, 
  Code2, 
  Briefcase,
  HelpCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

// Available Community Discussion Channels
const CHANNELS = [
  { id: 'all', label: 'All Channels', icon: Compass, color: 'text-slate-300' },
  { id: 'SalaryTalk', label: '#SalaryTalk', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'InterviewLeaks', label: '#InterviewLeaks', icon: Code2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'WorkCulture', label: '#WorkCulture', icon: Building2, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'CompanyReview', label: '#CompanyReview', icon: Briefcase, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'TechSecrets', label: '#TechSecrets', icon: Sparkles, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'ChaiCharcha', label: '#ChaiCharcha', icon: Coffee, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
];

// Pool of cool anonymous avatars & animals
const ANIMAL_NAMES = ['Fox', 'Panda', 'Ninja', 'Owl', 'Wolf', 'Falcon', 'Tiger', 'Dolphin', 'Lion', 'Hawk', 'Coder', 'Cheetah'];
const ADJECTIVES = ['Curious', 'Shadow', 'Stealth', 'Clever', 'Swift', 'Brave', 'Mystic', 'Cosmic', 'Zen', 'Cyber', 'Quiet', 'Neon'];
const AVATAR_SEEDS = ['fox', 'panda', 'ninja', 'owl', 'wolf', 'falcon', 'tiger', 'dolphin', 'lion', 'hawk', 'bottts', 'adventurer'];

function generateRandomAlias() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  const num = Math.floor(10 + Math.random() * 890);
  const seed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
  return {
    alias: `${adj} ${animal} #${num}`,
    seed
  };
}

export const AnonDiscuss = () => {
  const { user, isEmployer } = useAuth();
  const { socket } = useSocket();

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('all');
  const [sortMode, setSortMode] = useState('hot'); // 'hot' | 'new' | 'top'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected discussion for full thread view modal
  const [selectedThread, setSelectedThread] = useState(null);

  // New post modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postChannel, setPostChannel] = useState('SalaryTalk');
  const [useVerifiedBadge, setUseVerifiedBadge] = useState(true);

  // Persistent anonymous identity for current session
  const [myPersona, setMyPersona] = useState(() => generateRandomAlias());

  // Comment input state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch discussions from API
  const fetchDiscussions = async () => {
    try {
      const params = new URLSearchParams();
      if (channelFilter !== 'all') params.append('channel', channelFilter);
      if (sortMode) params.append('sort', sortMode);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/anon?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data.discussions || []);
      }
    } catch (err) {
      console.error('Failed to load anon discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [channelFilter, sortMode]);

  // Handle Search submit / debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDiscussions();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Live Socket.IO Events
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (newPost) => {
      setDiscussions(prev => {
        if (prev.some(d => d.id === newPost.id)) return prev;
        return [newPost, ...prev];
      });
    };

    const handleVoted = (data) => {
      setDiscussions(prev => prev.map(p => {
        if (p.id === data.id) {
          return {
            ...p,
            score: data.score,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            upvotedBy: data.upvotedBy,
            downvotedBy: data.downvotedBy
          };
        }
        return p;
      }));

      setSelectedThread(prev => {
        if (prev && prev.id === data.id) {
          return {
            ...prev,
            score: data.score,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            upvotedBy: data.upvotedBy,
            downvotedBy: data.downvotedBy
          };
        }
        return prev;
      });
    };

    const handleComment = (data) => {
      setDiscussions(prev => prev.map(p => {
        if (p.id === data.postId) {
          const existingComments = p.comments || [];
          if (existingComments.some(c => c.id === data.comment.id)) return p;
          return {
            ...p,
            commentsCount: data.commentsCount,
            comments: [...existingComments, data.comment]
          };
        }
        return p;
      }));

      setSelectedThread(prev => {
        if (prev && prev.id === data.postId) {
          const existingComments = prev.comments || [];
          if (existingComments.some(c => c.id === data.comment.id)) return prev;
          return {
            ...prev,
            commentsCount: data.commentsCount,
            comments: [...existingComments, data.comment]
          };
        }
        return prev;
      });
    };

    const handleReaction = (data) => {
      const updateComments = (comments) => (comments || []).map(c => {
        if (c.id === data.commentId) {
          return { ...c, reactions: data.reactions };
        }
        return c;
      });

      setDiscussions(prev => prev.map(p => {
        if (p.id === data.postId) {
          return { ...p, comments: updateComments(p.comments) };
        }
        return p;
      }));

      setSelectedThread(prev => {
        if (prev && prev.id === data.postId) {
          return { ...prev, comments: updateComments(prev.comments) };
        }
        return prev;
      });
    };

    socket.on('anon:created', handleCreated);
    socket.on('anon:voted', handleVoted);
    socket.on('anon:comment', handleComment);
    socket.on('anon:reaction', handleReaction);

    return () => {
      socket.off('anon:created', handleCreated);
      socket.off('anon:voted', handleVoted);
      socket.off('anon:comment', handleComment);
      socket.off('anon:reaction', handleReaction);
    };
  }, [socket]);

  // Vote on a thread
  const handleVote = async (postId, direction) => {
    const voterId = user?.id || 'anon_device_' + window.navigator.userAgent.slice(0, 15);
    try {
      const res = await fetch(`/api/anon/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: voterId, direction })
      });
      if (res.ok) {
        const data = await res.json();
        setDiscussions(prev => prev.map(p => p.id === postId ? data.post : p));
        if (selectedThread && selectedThread.id === postId) {
          setSelectedThread(data.post);
        }
      }
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  // Create new anonymous post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    const trimmedTitle = postTitle.trim();
    const trimmedContent = postContent.trim();
    if (trimmedTitle.length < 5) {
      showToast('⚠️ Title must be at least 5 characters long');
      return;
    }
    if (trimmedContent.length < 5) {
      showToast('⚠️ Discussion content must be at least 5 characters long');
      return;
    }

    let badge = 'Anonymous Member';
    if (useVerifiedBadge) {
      if (isEmployer) badge = 'Verified Employer / Recruiter';
      else if (user) badge = 'Verified Job Seeker';
      else badge = 'Verified Community Member';
    }

    try {
      const res = await fetch('/api/anon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          channel: postChannel,
          authorAlias: myPersona.alias,
          authorAvatarSeed: myPersona.seed,
          authorBadge: badge,
          userId: user?.id || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Failed to publish thread'}`);
        return;
      }

      setDiscussions(prev => {
        if (prev.some(d => d.id === data.discussion.id)) return prev;
        return [data.discussion, ...prev];
      });
      setIsPostModalOpen(false);
      setPostTitle('');
      setPostContent('');
      showToast('🚀 Thread published anonymously!');
    } catch (err) {
      console.error('Failed to create anon post:', err);
      showToast('⚠️ Network error while publishing thread');
    }
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    const trimmedComment = commentText.trim();
    if (!selectedThread || submittingComment) return;
    if (trimmedComment.length < 2) {
      showToast('⚠️ Reply must be at least 2 characters long');
      return;
    }

    setSubmittingComment(true);
    let badge = 'Anonymous Contributor';
    if (isEmployer) badge = 'Verified Recruiter';
    else if (user) badge = 'Verified Seeker';

    try {
      const res = await fetch(`/api/anon/${selectedThread.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmedComment,
          authorAlias: myPersona.alias,
          authorAvatarSeed: myPersona.seed,
          authorBadge: badge,
          userId: user?.id || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Failed to add reply'}`);
        return;
      }
      setCommentText('');
      showToast('💬 Anonymous reply added!');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // React with emoji to a comment
  const handleCommentReact = async (postId, commentId, emoji) => {
    try {
      await fetch(`/api/anon/${postId}/comments/${commentId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const currentVoterId = user?.id || 'anon_device_' + window.navigator.userAgent.slice(0, 15);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 md:pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[999] bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Top Banner / Privacy Guarantee */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 px-4 py-6 sm:py-8">
        <div className="max-w-[1400px] w-full mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  JobScout Community Forum
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  100% Encrypted & Anonymous
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>JobScout Anon Talk</span>
                <span className="text-slate-400 font-normal text-sm sm:text-base">(गुमनाम चर्चा)</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Discuss actual salaries, interview round leaks, workplace realities, and unvarnished career confessions. Your real name, phone number, and profile are completely stripped.
              </p>
            </div>

            {/* User Anonymous Persona Pill & New Thread Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex items-center justify-between bg-slate-950/80 px-3 py-2 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${myPersona.seed}`} 
                    alt="avatar" 
                    className="w-6 h-6 rounded-lg bg-orange-950/50 p-0.5 border border-orange-500/30"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-tight">Your Anon Alias:</span>
                    <strong className="text-orange-400 text-xs font-mono">{myPersona.alias}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newP = generateRandomAlias();
                    setMyPersona(newP);
                    showToast(`🎲 Switched to ${newP.alias}`);
                  }}
                  title="Randomize Anonymous Persona"
                  className="ml-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-orange-600/30 transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Start Anonymous Thread</span>
              </button>
            </div>
          </div>

          {/* Community Channel Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-5 pb-1 no-scrollbar text-xs">
            {CHANNELS.map(ch => {
              const Icon = ch.icon;
              const isActive = channelFilter === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setChannelFilter(ch.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    isActive 
                      ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20' 
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Stream Area */}
      <div className="max-w-[1400px] w-full mx-auto px-3 sm:px-4 mt-4">
        
        {/* Sort & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80 mb-4">
          
          {/* Community Sort Modes: Hot, New, Top */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs">
            <button
              onClick={() => setSortMode('hot')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                sortMode === 'hot' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Hot (चर्चित)</span>
            </button>
            <button
              onClick={() => setSortMode('new')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                sortMode === 'new' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>New (नवीनतम)</span>
            </button>
            <button
              onClick={() => setSortMode('top')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                sortMode === 'top' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Top (सबसे लोकप्रिय)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Search salaries, interviews, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-slate-900/40 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80">
            <Coffee className="w-10 h-10 text-orange-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white">No discussions found in this channel</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Be the first to ask a candid question, reveal interview secrets, or discuss salary packages anonymously!
            </p>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Post the first thread
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {discussions.map(item => {
              const hasUpvoted = (item.upvotedBy || []).includes(currentVoterId);
              const hasDownvoted = (item.downvotedBy || []).includes(currentVoterId);

              return (
                <div 
                  key={item.id}
                  className="flex bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all duration-150 group shadow-md"
                >
                  {/* Left Column: Community Upvote & Downvote Counter */}
                  <div className="w-11 sm:w-12 bg-slate-950/60 p-2 flex flex-col items-center justify-start border-r border-slate-800/80 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleVote(item.id, 1)}
                      title="Upvote"
                      className={`p-1 rounded-md transition-colors ${
                        hasUpvoted 
                          ? 'text-orange-500 bg-orange-500/10' 
                          : 'text-slate-400 hover:text-orange-400 hover:bg-slate-800'
                      }`}
                    >
                      <ArrowBigUp className={`w-5 h-5 ${hasUpvoted ? 'fill-orange-500' : ''}`} />
                    </button>

                    <span className={`text-xs font-black my-1 select-none font-mono ${
                      hasUpvoted ? 'text-orange-400' : hasDownvoted ? 'text-indigo-400' : 'text-slate-300'
                    }`}>
                      {item.score || 0}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleVote(item.id, -1)}
                      title="Downvote"
                      className={`p-1 rounded-md transition-colors ${
                        hasDownvoted 
                          ? 'text-indigo-500 bg-indigo-500/10' 
                          : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
                      }`}
                    >
                      <ArrowBigDown className={`w-5 h-5 ${hasDownvoted ? 'fill-indigo-500' : ''}`} />
                    </button>
                  </div>

                  {/* Right Column: Discussion Header, Content & Actions */}
                  <div className="flex-1 p-3.5 sm:p-4 cursor-pointer" onClick={() => setSelectedThread(item)}>
                    
                    {/* Channel & Author Meta Bar */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-orange-400 font-mono">
                        {item.channel?.startsWith('#') ? item.channel : `#${(item.channel || '').replace(/^r\//i, '')}`}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${item.authorAvatarSeed || 'fox'}`} 
                          alt="avatar" 
                          className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700"
                        />
                        <span className="font-semibold text-slate-300">{item.authorAlias}</span>
                        {item.authorBadge && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-medium border border-slate-700/60 hidden sm:inline">
                            {item.authorBadge}
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 inline" />
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-300 transition-colors leading-snug">
                      {item.title}
                    </h2>

                    {/* Content Excerpt */}
                    <p className="text-xs text-slate-300/90 mt-1.5 line-clamp-2 sm:line-clamp-3 leading-relaxed whitespace-pre-line font-sans">
                      {item.content}
                    </p>

                    {/* Action Footer */}
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-bold">{item.commentsCount || 0} Comments</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{item.views || 1} views</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                            showToast('📋 Discussion link copied to clipboard!');
                          }
                        }}
                        className="flex items-center gap-1 hover:text-white transition-colors ml-auto text-[11px]"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ============================================================= */}
      {/* 1. FULL THREAD DISCUSSION MODAL (COMMUNITY COMMENTS)           */}
      {/* ============================================================= */}
      {selectedThread && (
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl p-4 sm:p-6 my-auto max-h-[92dvh] flex flex-col animate-in zoom-in-95 duration-150">
            
            {/* Top-Left Back / Close Button */}
            <button
              type="button"
              onClick={() => setSelectedThread(null)}
              className="absolute top-4 left-4 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all flex items-center gap-1 shadow-md active:scale-95 z-20"
              title="Back / Close discussion"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
              <span>Back (वापस)</span>
            </button>

            {/* Top-Right Close Button */}
            <button
              type="button"
              onClick={() => setSelectedThread(null)}
              className="absolute top-4 right-4 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-all flex items-center gap-1 active:scale-95 z-20"
              title="Close discussion"
            >
              <span className="text-[11px] font-semibold hidden sm:inline">Close (बंद करें)</span>
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto pr-1 space-y-4 pt-8 sm:pt-6">
              
              {/* Thread Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-orange-400 font-mono">
                    {selectedThread.channel?.startsWith('#') ? selectedThread.channel : `#${(selectedThread.channel || '').replace(/^r\//i, '')}`}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedThread.authorAvatarSeed || 'fox'}`} 
                      alt="avatar" 
                      className="w-4 h-4 rounded-full bg-slate-800"
                    />
                    <span className="font-bold text-slate-200">{selectedThread.authorAlias}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-medium border border-slate-700">
                      {selectedThread.authorBadge || 'Verified'}
                    </span>
                  </div>
                </div>

                <h1 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  {selectedThread.title}
                </h1>
                
                <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-xs sm:text-sm text-slate-200 mt-2.5 whitespace-pre-line leading-relaxed">
                  {selectedThread.content}
                </div>

                {/* Vote Bar */}
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <div className="flex items-center bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleVote(selectedThread.id, 1)}
                      className="text-slate-400 hover:text-orange-400 p-0.5"
                    >
                      <ArrowBigUp className="w-4 h-4" />
                    </button>
                    <span className="font-black px-2 font-mono text-orange-400">{selectedThread.score || 0}</span>
                    <button
                      type="button"
                      onClick={() => handleVote(selectedThread.id, -1)}
                      className="text-slate-400 hover:text-indigo-400 p-0.5"
                    >
                      <ArrowBigDown className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                    <strong>{selectedThread.commentsCount || 0} Comments</strong>
                  </span>
                </div>
              </div>

              {/* Comment Composer */}
              <form onSubmit={handleAddComment} className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">Replying anonymously as:</span>
                    <strong className="text-orange-400 text-xs font-mono">{myPersona.alias}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMyPersona(generateRandomAlias())}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md"
                  >
                    <Dice5 className="w-3 h-3" /> Change Alias
                  </button>
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    required
                    placeholder="Add your anonymous insight, counter-opinion, or advice..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Threaded Comments List */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Community Discussion ({selectedThread.comments?.length || 0})
                </h3>

                {(selectedThread.comments || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No replies yet. Be the first to chime in!</p>
                ) : (
                  (selectedThread.comments || []).map(comment => (
                    <div 
                      key={comment.id}
                      className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-xs space-y-1.5 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <img 
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${comment.authorAvatarSeed || 'ninja'}`} 
                            alt="avatar" 
                            className="w-4 h-4 rounded-full bg-slate-800"
                          />
                          <strong className="text-slate-200">{comment.authorAlias}</strong>
                          {comment.authorBadge && (
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                              {comment.authorBadge}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-500">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-slate-300 leading-relaxed pl-5 whitespace-pre-line">
                        {comment.content}
                      </p>

                      {/* Emoji Reactions Bar */}
                      <div className="flex items-center gap-1.5 pl-5 pt-1">
                        {['🔥', '💡', '👏', '💯', '💀'].map(emoji => {
                          const count = comment.reactions?.[emoji] || 0;
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleCommentReact(selectedThread.id, comment.id, emoji)}
                              className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold transition-transform active:scale-125 flex items-center gap-1 ${
                                count > 0 
                                  ? 'bg-slate-800/80 border-slate-700 text-slate-200' 
                                  : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span className="text-[10px] font-mono">{count}</span>}
                            </button>
                          );
                        })}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. CREATE ANONYMOUS THREAD MODAL                               */}
      {/* ============================================================= */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl p-5 sm:p-6 my-auto max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
            
            {/* Top-Left Back / Close Button */}
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all flex items-center gap-1 shadow-md active:scale-95"
              title="Back / Close"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
              <span>Back</span>
            </button>

            {/* Top-Right Close Button */}
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-all flex items-center gap-1 active:scale-95"
              title="Close dialog"
            >
              <span className="text-[11px] font-semibold hidden sm:inline">Close (बंद करें)</span>
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pt-7 sm:pt-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                🔒 Anonymous Submission
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">
                Start an Anonymous Discussion
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Post without disclosing your name, phone, or company.
              </p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              
              {/* Persona Customizer Card */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${myPersona.seed}`} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-xl bg-orange-950/60 p-0.5 border border-orange-500/30"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Posting As:</span>
                    <strong className="text-orange-400 text-xs font-mono">{myPersona.alias}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMyPersona(generateRandomAlias())}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  <span>Re-roll Alias</span>
                </button>
              </div>

              {/* Topic Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Choose Community Channel (चैनल चुनें):
                </label>
                <select
                  value={postChannel}
                  onChange={(e) => setPostChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="#SalaryTalk">💰 #SalaryTalk — In-hand pay, increments, offers</option>
                  <option value="#InterviewLeaks">🎯 #InterviewLeaks — Exact interview questions asked</option>
                  <option value="#WorkCulture">🏢 #WorkCulture — Toxic managers, appraisal politics</option>
                  <option value="#CompanyReview">⭐ #CompanyReview — Honest Mumbai workplace reviews</option>
                  <option value="#TechSecrets">⚡ #TechSecrets — Architecture tricks, framework tips</option>
                  <option value="#ChaiCharcha">☕ #ChaiCharcha — Unfiltered career confessions & venting</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discussion Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Real in-hand salary for 3 YOE Fullstack Dev in Mumbai BKC"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Body Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detailed Experience / Question / Story *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Share breakdown of compensation, rounds of interview, or candid thoughts..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Verified Role Flair Toggle */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                <input
                  type="checkbox"
                  id="flairCheck"
                  checked={useVerifiedBadge}
                  onChange={(e) => setUseVerifiedBadge(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-orange-500 focus:ring-0"
                />
                <label htmlFor="flairCheck" className="cursor-pointer select-none">
                  Display verified flair badge: <span className="text-orange-400 font-bold">{isEmployer ? '[Verified Recruiter]' : '[Verified Seeker]'}</span> (identity stays 100% hidden)
                </label>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cancel / Back (रद्द करें)</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                >
                  <span>Publish Anonymously</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
