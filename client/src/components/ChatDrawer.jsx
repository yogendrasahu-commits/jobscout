import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  Video, 
  User, 
  CheckCheck, 
  Briefcase, 
  Search, 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  Minimize2, 
  Maximize2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const ChatDrawer = ({ onOpenFullPageChat, currentTab }) => {
  const { user, token } = useAuth();
  const { 
    activeChatUser, 
    setActiveChatUser, 
    isChatDrawerOpen, 
    setIsChatDrawerOpen, 
    sendMessage, 
    incomingMessage, 
    startCall 
  } = useSocket();

  // View state: 'list' | 'chat'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Threads list state
  const [threads, setThreads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('threads'); // 'threads' | 'contacts'
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef(null);

  // 1. Fetch all threads and available contacts (Unconditional Hook)
  const fetchThreads = async () => {
    if (!token) return;
    setLoadingThreads(true);
    try {
      const res = await fetch('/api/messages/threads/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error('Failed to load chat threads:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchThreads();
    }
  }, [token]);

  // 2. Fetch conversation history when activeChatUser changes (Unconditional Hook)
  useEffect(() => {
    if (!activeChatUser || !token) return;

    const fetchHistory = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages/${activeChatUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchHistory();
  }, [activeChatUser, token]);

  // 3. Listen to incoming live messages (Unconditional Hook)
  useEffect(() => {
    if (!incomingMessage) return;

    // Refresh threads list when a new message comes in
    fetchThreads();

    if (activeChatUser) {
      if (
        (incomingMessage.senderId === activeChatUser.id && incomingMessage.receiverId === user?.id) ||
        (incomingMessage.senderId === user?.id && incomingMessage.receiverId === activeChatUser.id)
      ) {
        setMessages(prev => {
          if (prev.some(m => m.id === incomingMessage.id)) return prev;
          return [...prev, incomingMessage];
        });
      }
    }
  }, [incomingMessage, activeChatUser, user]);

  // 4. Auto-scroll chat to bottom (Unconditional Hook)
  useEffect(() => {
    if (activeChatUser) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChatUser]);

  // Handle Send Message
  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user || !activeChatUser) return;

    const messageText = inputText.trim();
    sendMessage(activeChatUser.id, messageText);

    // Optimistic append
    const tempMsg = {
      id: `temp_${Date.now()}`,
      senderId: user.id,
      receiverId: activeChatUser.id,
      senderName: user.name,
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, tempMsg]);
    setInputText('');

    // Also update threads list optimistically
    setThreads(prev => {
      const idx = prev.findIndex(t => t.userId === activeChatUser.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: messageText,
          lastTimestamp: new Date().toISOString()
        };
        return updated.sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
      } else {
        return [{
          userId: activeChatUser.id,
          user: activeChatUser,
          lastMessage: messageText,
          lastTimestamp: new Date().toISOString(),
          unreadCount: 0
        }, ...prev];
      }
    });
  };

  // Helper format time
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filtered threads & contacts by search query
  const filteredThreads = threads.filter(t => {
    const q = searchQuery.toLowerCase();
    const nameMatch = t.user?.name?.toLowerCase().includes(q);
    const msgMatch = t.lastMessage?.toLowerCase().includes(q);
    const titleMatch = t.user?.title?.toLowerCase().includes(q) || t.user?.companyName?.toLowerCase().includes(q);
    return nameMatch || msgMatch || titleMatch;
  });

  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.companyName && c.companyName.toLowerCase().includes(q))
    );
  });

  const totalUnread = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  // If already on dedicated Full Page messages tab, hide drawer
  if (currentTab === 'messages') {
    return null;
  }

  // ==========================================================
  // CASE 1: DRAWER IS CLOSED -> RENDER PERSISTENT FLOATING LAUNCHER (Desktop Only)
  // ==========================================================
  if (!isChatDrawerOpen) {
    if (!user) return null;
    return (
      <button
        onClick={() => setIsChatDrawerOpen(true)}
        className="hidden md:flex fixed bottom-5 right-6 z-30 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl px-3.5 py-2.5 shadow-2xl items-center gap-2 border border-indigo-400/30 active:scale-95 transition-all select-none group"
        title="Open Chat List (चैट लिस्ट)"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-white" />
          {totalUnread > 0 ? (
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-[10px] font-black text-white px-1.5 py-0.2 rounded-full border border-slate-900 animate-pulse">
              {totalUnread}
            </span>
          ) : (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
          )}
        </div>
        <span className="text-xs font-bold">
          Messaging (चैट लिस्ट)
        </span>
      </button>
    );
  }

  // ==========================================================
  // CASE 2: MINIMIZED FLOATING BAR (Desktop Only)
  // ==========================================================
  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="hidden md:flex fixed bottom-4 right-6 z-40 bg-slate-900 border border-indigo-500/40 rounded-2xl p-3 shadow-2xl items-center gap-3 cursor-pointer hover:bg-slate-850 hover:border-indigo-400 transition-all select-none animate-in fade-in"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          {totalUnread > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-[10px] font-extrabold text-white px-1.5 rounded-full animate-pulse">
              {totalUnread}
            </span>
          )}
        </div>
        <div className="text-xs font-bold text-white">
          {activeChatUser?.name || 'Messaging (चैट)'}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsChatDrawerOpen(false); }}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ==========================================================
  // CASE 3: FULL CHAT DRAWER OPEN
  // ==========================================================
  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-6 z-[950] w-full sm:w-[410px] h-full sm:h-[560px] max-h-[100dvh] sm:max-h-[90vh] bg-slate-900 border-0 sm:border border-slate-700/80 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
      
      {/* ========================================================== */}
      {/* VIEW A: 1-ON-1 CONVERSATION VIEW (when activeChatUser is set) */}
      {/* ========================================================== */}
      {activeChatUser ? (
        <>
          {/* Chat Header */}
          <div className="p-3 bg-slate-800/95 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {/* Back to Chat List */}
              <button
                type="button"
                onClick={() => setActiveChatUser(null)}
                title="Back to Chat List (चैट लिस्ट पर लौटें)"
                className="py-1 px-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-400" />
                <span>Back</span>
              </button>

              {/* Contact Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={activeChatUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(activeChatUser.name || 'User')}`}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-slate-600 bg-slate-800"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>

              {/* Contact Info */}
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white truncate leading-tight">
                  {activeChatUser.name || 'User'}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">
                  {activeChatUser.companyName || activeChatUser.title || (activeChatUser.role === 'emp' ? 'Recruiter' : 'Job Seeker')}
                </p>
              </div>
            </div>

            {/* Calling & Window controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => startCall(activeChatUser, false)}
                title="Start Voice Call"
                className="p-2 rounded-xl bg-slate-700/60 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() => startCall(activeChatUser, true)}
                title="Start Video Call"
                className="p-2 rounded-xl bg-slate-700/60 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Video className="w-4 h-4" />
              </button>

              {onOpenFullPageChat && (
                <button
                  onClick={() => {
                    setIsChatDrawerOpen(false);
                    onOpenFullPageChat();
                  }}
                  title="Open Full Page Chat (फुल पेज चैट)"
                  className="p-2 rounded-xl bg-slate-700/60 hover:bg-indigo-600/30 text-indigo-300 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize"
                className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors hidden sm:block"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setActiveChatUser(null); setIsChatDrawerOpen(false); }}
                title="Close"
                className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/60">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                <Briefcase className="w-10 h-10 mb-2 opacity-30 text-indigo-400" />
                <h5 className="font-bold text-slate-300 text-xs mb-1">
                  Start Conversation with {activeChatUser.name || 'User'}
                </h5>
                <p className="text-[11px] max-w-[240px] text-slate-400">
                  Send a direct message or start a live WebRTC audio/video call.
                </p>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                  {[
                    '👋 Hello!',
                    'Interested in your role',
                    'Available for a quick call?'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(chip)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-indigo-600/30 hover:text-indigo-300 border border-slate-700 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm break-words ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                      }`}
                    >
                      {m.message || m.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 px-1">
                      <span>{new Date(m.timestamp || m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeChatUser?.name ? activeChatUser.name.split(' ')[0] : 'User'}...`}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      ) : (
        /* ========================================================== */
        /* VIEW B: CHAT LIST VIEW (चैट लिस्ट) */
        /* ========================================================== */
        <>
          {/* List Header */}
          <div className="p-3.5 bg-slate-800/95 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>Chat List</span>
                  <span className="text-[10px] text-slate-400 font-normal">(चैट लिस्ट)</span>
                  {totalUnread > 0 && (
                    <span className="bg-rose-500 text-[10px] text-white px-1.5 rounded-full font-bold">
                      {totalUnread}
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onOpenFullPageChat && (
                <button
                  onClick={() => {
                    setIsChatDrawerOpen(false);
                    onOpenFullPageChat();
                  }}
                  title="Open Full Page Messaging (फुल पेज चैट)"
                  className="p-1.5 rounded-xl hover:bg-slate-700 text-indigo-300 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize"
                className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors hidden sm:block"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(false)}
                title="Close chat drawer (चैट बंद करें)"
                className="py-1 px-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Contacts & Threads */}
          <div className="p-2.5 bg-slate-900 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search messages or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all"
              />
            </div>

            {/* Segmented Switcher: Conversations vs All Contacts */}
            <div className="flex items-center gap-1 mt-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setActiveTab('threads')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'threads'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Conversations ({threads.length})
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'contacts'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Users ({contacts.length})
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 bg-slate-950/40">
            
            {/* TAB 1: CONVERSATIONS / ACTIVE THREADS */}
            {activeTab === 'threads' && (
              <>
                {loadingThreads ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Loading conversations...
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-400" />
                    <p className="text-xs font-semibold text-slate-300">No conversations found</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Switch to "All Users" tab to start a new chat with any candidate or employer.
                    </p>
                    <button
                      onClick={() => setActiveTab('contacts')}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
                    >
                      View Available Users ({contacts.length})
                    </button>
                  </div>
                ) : (
                  filteredThreads.map((thread) => (
                    <div
                      key={thread.userId}
                      onClick={() => setActiveChatUser(thread.user)}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={thread.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(thread.user?.name || 'User')}`}
                          alt={thread.user?.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-700 bg-slate-800"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-white group-hover:text-indigo-300 truncate transition-colors">
                            {thread.user?.name || 'User'}
                          </h4>
                          <span className="text-[10px] text-slate-500 flex-shrink-0">
                            {formatTime(thread.lastTimestamp)}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {thread.user?.companyName || thread.user?.title || (thread.user?.role === 'emp' ? 'Employer' : 'Candidate')}
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[11px] text-slate-300 truncate max-w-[210px] leading-tight">
                            {thread.lastMessage}
                          </p>
                          {thread.unreadCount > 0 && (
                            <span className="bg-rose-500 text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Instant Call Quick Action */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); startCall(thread.user, false); }}
                          title="Quick Audio Call"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-emerald-400 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); startCall(thread.user, true); }}
                          title="Quick Video Call"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-indigo-400 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </>
            )}

            {/* TAB 2: ALL CONTACTS / START NEW CHAT */}
            {activeTab === 'contacts' && (
              <>
                {filteredContacts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No contacts match "{searchQuery}"
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setActiveChatUser(contact)}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={contact.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(contact.name || 'User')}`}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-white group-hover:text-indigo-300 truncate">
                            {contact.name || 'User'}
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            contact.role === 'emp'
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {contact.role === 'emp' ? 'Recruiter' : 'Seeker'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {contact.companyName || contact.title || 'Tech Professional'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {contact.address ? contact.address.split(',')[0] : 'Mumbai BKC'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); startCall(contact, false); }}
                          title="Call"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-emerald-400 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); startCall(contact, true); }}
                          title="Video"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-indigo-400 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </>
            )}

          </div>

          {/* List Footer */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-center text-[10px] text-slate-500">
            Realtime messaging powered by Socket.IO & WebSockets
          </div>

        </>
      )}

    </div>
  );
};
