import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Phone, 
  Video, 
  User, 
  Search, 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  CheckCheck, 
  ExternalLink,
  ShieldCheck,
  Building,
  Briefcase,
  Users,
  Radio,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const FullPageChat = ({ onOpenProfile }) => {
  const { user, token } = useAuth();
  const { 
    activeChatUser, 
    setActiveChatUser, 
    sendMessage, 
    incomingMessage, 
    startCall 
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [threads, setThreads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('threads'); // 'threads' | 'contacts'

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Fetch Threads and Contacts
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
    fetchThreads();
  }, [token]);

  // 2. Fetch conversation history when activeChatUser changes
  useEffect(() => {
    if (!activeChatUser || !token) {
      setMessages([]);
      return;
    }

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
    // Clear unread badge in threads locally
    setThreads(prev =>
      prev.map(t => (t.userId === activeChatUser.id ? { ...t, unreadCount: 0 } : t))
    );
  }, [activeChatUser, token]);

  // 3. Listen to incoming live messages
  useEffect(() => {
    if (!incomingMessage) return;

    // If incoming message belongs to active chat, append it
    if (
      activeChatUser && 
      (incomingMessage.senderId === activeChatUser.id || incomingMessage.receiverId === activeChatUser.id)
    ) {
      setMessages(prev => {
        if (prev.some(m => m.id === incomingMessage.id)) return prev;
        return [...prev, incomingMessage];
      });
    }

    // Refresh or update thread preview
    fetchThreads();
  }, [incomingMessage]);

  // 4. Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  // Handle Send Message
  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChatUser || !user) return;

    const messageText = inputText.trim();
    setInputText('');

    // Send through WebSocket
    sendMessage(activeChatUser.id, messageText);

    // Optimistic UI push
    const tempMsg = {
      id: `tmp_${Date.now()}`,
      senderId: user.id,
      receiverId: activeChatUser.id,
      senderName: user.name,
      message: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    // Update thread preview
    setThreads(prev => {
      const idx = prev.findIndex(t => t.userId === activeChatUser.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: messageText,
          timestamp: new Date().toISOString()
        };
        return updated;
      }
      return prev;
    });

    inputRef.current?.focus();
  };

  // Filter threads and contacts
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

  const quickPresets = [
    'Hi! I would like to discuss this opening.',
    'Are you available for a quick call today?',
    'Could you share your updated resume / portfolio?',
    'Thanks! I will review and get back to you shortly.'
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-6 animate-in fade-in duration-200">
      
      {/* Outer Card Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[calc(100dvh-60px-56px-1rem)] md:h-[calc(100vh-8.5rem)] min-h-[380px] sm:min-h-[520px]">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: CHAT LIST & DIRECTORY                           */}
        {/* (Hidden on mobile if activeChatUser is selected)             */}
        {/* ============================================================ */}
        <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-800 bg-slate-950/60 flex-shrink-0 ${
          activeChatUser ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-white tracking-tight">Messaging</h2>
                  <p className="text-[11px] text-slate-400">Real-time conversations & calls</p>
                </div>
              </div>
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                  {totalUnread} new
                </span>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search messages or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* 2 Tabs: Conversations vs Directory */}
            <div className="flex items-center gap-1 mt-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('threads')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'threads'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Chats</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full border border-slate-700">
                  {threads.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'contacts'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Users</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full border border-slate-700">
                  {contacts.length}
                </span>
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {loadingThreads ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading conversations...</div>
            ) : activeTab === 'threads' ? (
              filteredThreads.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">No conversations yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Select a user from the "All Users" tab to start chatting!
                  </p>
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="mt-3 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold border border-indigo-500/30 transition-all"
                  >
                    View Directory
                  </button>
                </div>
              ) : (
                filteredThreads.map((t) => {
                  const isSelected = activeChatUser?.id === t.userId;
                  return (
                    <div
                      key={t.userId}
                      onClick={() => setActiveChatUser(t.user)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                          : 'hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={t.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(t.user?.name || 'User')}`}
                          alt={t.user?.name}
                          className="w-11 h-11 rounded-2xl object-cover bg-slate-800 border border-slate-700"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-bold text-xs text-white truncate">
                            {t.user?.name || 'User'}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            {t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 truncate mb-1">
                          {t.user?.companyName || t.user?.title || (t.user?.role === 'emp' ? 'Employer' : 'Job Seeker')}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-300 truncate max-w-[170px]">
                            {t.lastMessage}
                          </p>
                          {t.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black">
                              {t.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No matching contacts found.</div>
              ) : (
                filteredContacts.map((c) => {
                  const isSelected = activeChatUser?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveChatUser(c)}
                      className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                          : 'hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={c.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(c.name)}`}
                            alt={c.name}
                            className="w-10 h-10 rounded-2xl object-cover bg-slate-800 border border-slate-700"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">{c.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {c.companyName || c.title || (c.role === 'emp' ? 'Employer' : 'Candidate')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChatUser(c);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-bold border border-indigo-500/30 transition-all whitespace-nowrap"
                      >
                        Chat
                      </button>
                    </div>
                  );
                })
              )
            )}
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: ACTIVE CONVERSATION PANE                       */}
        {/* (Hidden on mobile if no activeChatUser selected)             */}
        {/* ============================================================ */}
        <div className={`flex-1 flex flex-col bg-slate-900/95 min-w-0 ${
          !activeChatUser ? 'hidden md:flex' : 'flex'
        }`}>
          
          {activeChatUser ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shadow-md z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button (Mobile) */}
                  <button
                    onClick={() => setActiveChatUser(null)}
                    className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Back to conversation list"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div 
                    onClick={() => onOpenProfile && onOpenProfile(activeChatUser)}
                    className="relative flex-shrink-0 cursor-pointer group"
                    title="View Profile"
                  >
                    <img
                      src={activeChatUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(activeChatUser.name || 'User')}`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-2xl object-cover bg-slate-800 border-2 border-slate-700 group-hover:border-indigo-500 transition-colors"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                  </div>

                  <div className="min-w-0">
                    <div 
                      onClick={() => onOpenProfile && onOpenProfile(activeChatUser)}
                      className="flex items-center gap-1.5 cursor-pointer group"
                    >
                      <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-400 truncate transition-colors">
                        {activeChatUser.name || 'User'}
                      </h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {activeChatUser.companyName || activeChatUser.title || (activeChatUser.role === 'emp' ? 'Hiring Organization' : 'Candidate')}
                      {' • '}
                      <span className="text-emerald-400 font-semibold">Active Now</span>
                    </p>
                  </div>
                </div>

                {/* Top Action Buttons (Calling & Profile) */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onOpenProfile && onOpenProfile(activeChatUser)}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                    title="View Profile"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Profile</span>
                  </button>

                  {/* Voice Call */}
                  <button
                    onClick={() => startCall(activeChatUser, false)}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    title="Start WebRTC Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">Voice</span>
                  </button>

                  {/* Video Call */}
                  <button
                    onClick={() => startCall(activeChatUser, true)}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                    title="Start WebRTC HD Video Call"
                  >
                    <Video className="w-4 h-4" />
                    <span className="hidden sm:inline">Video Call</span>
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-950/40">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Loading conversation history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h4 className="font-extrabold text-sm text-white mb-1">
                      Direct Connection with {activeChatUser.name}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                      Say hello or discuss openings. All messages and speed calls are end-to-end synchronized.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-md">
                      {quickPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInputText(preset)}
                          className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 transition-colors"
                        >
                          "{preset}"
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center my-2">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                        WebRTC Real-time Encrypted Chat
                      </span>
                    </div>

                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id || idx}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-md leading-relaxed break-words ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80'
                            }`}
                          >
                            {msg.message}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1">
                            <span>
                              {msg.createdAt
                                ? new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Just now'}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Quick Preset Prompts Bar */}
              {messages.length > 0 && (
                <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  {quickPresets.slice(0, 2).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(p)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/70 whitespace-nowrap transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Write a message to ${activeChatUser.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold transition-all shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Empty State when no conversation is selected (Desktop) */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center mb-4 text-indigo-400 shadow-xl">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-1">Your Full-Page Messaging Hub</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                Select an active conversation on the left, or browse the directory to connect directly with hiring managers and candidate talent.
              </p>
              <button
                onClick={() => setActiveTab('contacts')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Browse All Users Directory</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
