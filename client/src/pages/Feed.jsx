import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Send, 
  Image as ImageIcon, 
  Briefcase, 
  Sparkles, 
  Smile, 
  MoreHorizontal, 
  MapPin, 
  UserPlus, 
  Check, 
  Phone, 
  Video, 
  ExternalLink,
  Flame,
  Globe,
  Radio,
  Bookmark,
  TrendingUp,
  X,
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const Feed = ({ 
  onSelectSeeker, 
  onSelectJob, 
  onNavigateToMap, 
  onNavigateToAnon,
  onNavigateToApplications,
  onOpenProfile 
}) => {
  const { user, isEmployer, isSeeker } = useAuth();
  const { startCall, setActiveChatUser } = useSocket();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  
  // Active comments drawer per post
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  // Connected state simulation
  const [connectedUsers, setConnectedUsers] = useState({});

  // Fetch feed posts
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setPostError('');
    const trimmedContent = newContent.trim();
    if (trimmedContent.length < 2) {
      setPostError('Please write at least 2 characters for your post.');
      return;
    }

    let cleanedImage = null;
    if (newImage.trim()) {
      try {
        const parsed = new URL(newImage.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          setPostError('Image URL must start with http:// or https://');
          return;
        }
        const extracted = parsed.searchParams.get('mediaurl') || parsed.searchParams.get('imgurl');
        cleanedImage = extracted ? decodeURIComponent(extracted) : newImage.trim();
      } catch {
        setPostError('Please enter a valid Image URL (starting with https://)');
        return;
      }
    }

    setSubmitting(true);
    try {
      const tags = [];
      if (isEmployer) tags.push('#Hiring');
      if (isSeeker) tags.push('#OpenToWork');
      if (selectedTag) tags.push(selectedTag);

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user?.id || 'guest',
          authorName: user?.name || (isEmployer ? 'Tech Recruiter' : 'Software Candidate'),
          authorRole: user?.role || 'seeker',
          authorTitle: user?.title || user?.companyName || (isEmployer ? 'Talent Acquisition' : 'Full-Stack Developer'),
          authorAvatar: user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'user')}`,
          content: trimmedContent,
          image: cleanedImage,
          tags
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setPostError(data.error || 'Failed to create post');
        return;
      }

      setPosts([data.post, ...posts]);
      setNewContent('');
      setNewImage('');
      setSelectedTag('');
      setPostError('');
      setIsCreateOpen(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setPostError('Network error while creating post');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Like
  const handleLike = async (postId) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const isLiked = p.likedBy?.includes(user?.id);
          const newLikedBy = isLiked 
            ? p.likedBy.filter(id => id !== user?.id)
            : [...(p.likedBy || []), user?.id];
          return {
            ...p,
            likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
            likedBy: newLikedBy
          };
        }
        return p;
      }));

      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'guest' })
      });
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: user?.name || 'Community Member',
          authorAvatar: user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'user')}`,
          text
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? data.post : p));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const toggleConnectUser = (targetId) => {
    setConnectedUsers(prev => ({
      ...prev,
      [targetId]: !prev[targetId]
    }));
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
      
      {/* Professional Feed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================== */}
        {/* LEFT COLUMN: USER PROFILE MINI CARD & STATS */}
        {/* ========================================================== */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          
          {/* Profile Identity Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
            {/* Cover photo */}
            <div className="h-20 bg-gradient-to-r from-indigo-100 via-indigo-50 to-emerald-50 relative">
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] text-emerald-700 font-bold backdrop-blur-md border border-emerald-200 shadow-xs">
                Live GPS Active
              </span>
            </div>

            {/* Avatar & Info */}
            <div className="px-4 pb-4 -mt-10 flex flex-col items-center text-center">
              <div className="relative mb-2">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'visitor'}`}
                  alt={user?.name || 'User'}
                  className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md bg-slate-100 ring-2 ring-indigo-500/20"
                />
                {/* Profile Signature Frame */}
                {isSeeker && (
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-600 border-2 border-white text-[8px] font-extrabold text-white tracking-wider shadow-xs">
                    #OPENTOWORK
                  </span>
                )}
                {isEmployer && (
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-indigo-600 border-2 border-white text-[8px] font-extrabold text-white tracking-wider shadow-xs">
                    #HIRING
                  </span>
                )}
              </div>

              <h3 
                onClick={() => onOpenProfile && onOpenProfile(user)}
                className="font-extrabold text-sm text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
              >
                {user?.name || 'Guest Professional'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {user?.title || user?.companyName || (isEmployer ? 'Recruiter & Hiring Lead' : 'Full Stack Developer')}
              </p>
              
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5 mb-2">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span className="truncate">{user?.address ? user.address.split(',')[0] : 'Mumbai BKC Hub'}</span>
              </div>

              {/* View Full Profile Button */}
              {user && (
                <button
                  onClick={() => onOpenProfile && onOpenProfile(user)}
                  className="w-full mt-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>View My Full Profile</span>
                </button>
              )}
            </div>

            {/* Professional Connection Metrics */}
            <div className="border-t border-slate-100 px-4 py-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
                <span>Connections</span>
                <span className="font-extrabold text-indigo-600">540+</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
                <span>Profile views</span>
                <span className="font-extrabold text-emerald-600">184</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
                <span>Post impressions</span>
                <span className="font-extrabold text-slate-700">1,280</span>
              </div>
            </div>

            {/* Quick Map Radar Jump */}
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={onNavigateToMap}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Open Live Map</span>
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm text-xs space-y-2.5">
            <h4 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mb-2">My Shortcuts</h4>
            <div className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              <span>Saved Jobs & Opportunities</span>
            </div>
            <div 
              onClick={() => onNavigateToApplications && onNavigateToApplications()}
              className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 cursor-pointer transition-colors"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Submitted Applications</span>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* CENTER COLUMN: CREATE POST + FEED POSTS */}
        {/* ========================================================== */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Start a Post Input Box */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'user'}`}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-slate-200 object-cover ring-2 ring-indigo-500/20"
              />
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex-1 text-left px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-2xl border border-slate-200/80 text-xs font-medium transition-all"
              >
                {isEmployer 
                  ? "Share a job opening, hiring announcement, or update..." 
                  : "Share a project, portfolio update, or #OpenToWork story..."}
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-around pt-3 mt-3 border-t border-slate-100">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 transition-colors font-semibold py-1 px-2 rounded-xl"
              >
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Media</span>
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 transition-colors font-semibold py-1 px-2 rounded-xl"
              >
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Job Post</span>
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-amber-600 transition-colors font-semibold py-1 px-2 rounded-xl"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Celebrate</span>
              </button>
            </div>
          </div>

          {/* Anon Talk Spotlight Banner */}
          <div className="bg-gradient-to-r from-amber-50/70 via-white to-orange-50/70 border border-orange-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">JobScout Anon Talk</span>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider border border-orange-200">
                    Anonymous Hub
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Want to discuss real in-hand salaries, interview leaks & culture 100% anonymously?
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToAnon && onNavigateToAnon()}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-sm whitespace-nowrap transition-all active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <span>Join Discussion</span>
              <span>👉</span>
            </button>
          </div>

          {/* Posts Feed List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 h-48 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 shadow-sm">
              No feed posts yet. Be the first to share an update!
            </div>
          ) : (
            posts.map((post) => {
              const isLiked = post.likedBy?.includes(user?.id);
              const isCommentsOpen = activeCommentsPostId === post.id;
              const isConnected = connectedUsers[post.authorId];

              return (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-5 shadow-sm transition-all"
                >
                  
                  {/* Post Author Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={post.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorName}`}
                          alt={post.authorName}
                          className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                        />
                        {post.authorRole === 'seeker' && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Open to Work" />
                        )}
                        {post.authorRole === 'emp' && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-full" title="Hiring" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 
                            onClick={() => onOpenProfile && onOpenProfile(post.authorId)}
                            className="font-bold text-sm text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            {post.authorName}
                          </h4>
                          {post.authorRole === 'emp' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                              HIRING
                            </span>
                          )}
                          {post.authorRole === 'seeker' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                              OPENTOWORK
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-1">{post.authorTitle}</p>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <Globe className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>

                    {/* Connect Button */}
                    {post.authorId !== user?.id && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleConnectUser(post.authorId)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            isConnected
                              ? 'bg-slate-100 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white'
                          }`}
                        >
                          {isConnected ? <Check className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                          <span>{isConnected ? 'Connected' : 'Connect'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-3 font-normal">
                    {post.content}
                  </div>

                  {/* Attached Media Image */}
                  {post.image && (
                    <div className="rounded-2xl overflow-hidden mb-3 border border-slate-200 max-h-96">
                      <img
                        src={post.image}
                        alt="Post media"
                        onError={(e) => {
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.style.display = 'none';
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Likes & Comments Counters */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 py-2 border-y border-slate-100 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="flex -space-x-1">
                        <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] text-white">👍</span>
                        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white">❤️</span>
                      </span>
                      <span>{post.likes} reactions</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span 
                        onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                        className="hover:text-indigo-600 cursor-pointer"
                      >
                        {post.comments ? post.comments.length : 0} comments
                      </span>
                    </div>
                  </div>

                  {/* Interaction Buttons Bar */}
                  <div className="flex items-center justify-around pt-1">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isLiked
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-indigo-600' : ''}`} />
                      <span>Like</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Comment</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href);
                        alert('Post link copied to clipboard!');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Drawer */}
                  {isCommentsOpen && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                      
                      {/* Comment Input */}
                      <div className="flex items-center gap-2">
                        <img
                          src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'user'}`}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                        />
                        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-indigo-500">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="p-1 text-indigo-600 hover:text-indigo-800 ml-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Comments List */}
                      {post.comments && post.comments.map((c) => (
                        <div key={c.id} className="flex items-start gap-2.5 pt-2">
                          <img
                            src={c.authorAvatar}
                            alt={c.authorName}
                            className="w-7 h-7 rounded-full border border-slate-200 object-cover mt-0.5"
                          />
                          <div className="flex-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900 text-[11px]">{c.authorName}</span>
                              <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-700 text-xs">{c.text}</p>
                          </div>
                        </div>
                      ))}

                    </div>
                  )}

                </article>
              );
            })
          )}

        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: INDUSTRY NEWS & RADAR */}
        {/* ========================================================== */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          
          {/* Industry News & Trends */}
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>JobScout Trends</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase">India Tech</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="cursor-pointer group">
                <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Mumbai BKC tech hiring surges 28%
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Top stories • 4,820 readers</p>
              </div>

              <div className="cursor-pointer group">
                <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  WebRTC P2P audio/video in high demand
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">2h ago • 2,150 readers</p>
              </div>

              <div className="cursor-pointer group">
                <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Immediate spot hiring for contract roles
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">4h ago • 1,320 readers</p>
              </div>

              <div className="cursor-pointer group">
                <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Leaflet location radars become industry standard
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">6h ago • 3,490 readers</p>
              </div>
            </div>
          </div>

          {/* Quick Connect People Widget */}
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-4 shadow-sm">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Recommended Professionals
            </h4>

            <div className="space-y-3">
              {[
                { name: 'Rohan Sharma', title: 'React & WebRTC Engineer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', id: 'usr_seek_1' },
                { name: 'Priya Patel', title: 'Product UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', id: 'usr_seek_2' },
                { name: 'Sneha Rao', title: 'Backend Python Engineer', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', id: 'usr_seek_4' }
              ].map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-emerald-600 font-medium truncate">{p.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleConnectUser(p.id)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-[10px] font-bold border border-indigo-200 hover:border-indigo-600 transition-all flex-shrink-0 shadow-sm"
                  >
                    {connectedUsers[p.id] ? 'Connected' : '+ Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================== */}
      {/* CREATE POST MODAL DIALOG */}
      {/* ========================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto my-auto text-slate-900">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setPostError(''); }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                  title="Back / Close"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-600" />
                  <span>Back</span>
                </button>
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'user'}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover flex-shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{user?.name || 'Share an Update'}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold">
                    {isEmployer ? 'Post as Employer (#Hiring)' : 'Post as Candidate (#OpenToWork)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setIsCreateOpen(false); setPostError(''); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex-shrink-0"
                title="Close dialog"
              >
                <span className="text-[11px] font-semibold hidden sm:inline">Close (बंद करें)</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {postError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {postError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                rows={5}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What do you want to talk about? Share an opening, portfolio update, or thought..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />

              {/* Image URL Input */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Paste image URL (optional)"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-xs"
                />
              </div>

              {/* Tag suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Add Trending Hashtags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['#Hiring', '#OpenToWork', '#ReactJS', '#FullStack', '#UIUX', '#TechJobs'].map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setNewContent(prev => `${prev} ${tag}`)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-indigo-700 hover:bg-indigo-50 border border-slate-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Submit Button & Cancel */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cancel / Back (रद्द करें)</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newContent.trim()}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                >
                  {submitting ? 'Posting...' : 'Post to Feed'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
