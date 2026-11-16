import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Briefcase, 
  MapPin, 
  Settings, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Radio, 
  Send, 
  RefreshCw, 
  Sliders, 
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Clock,
  Building2,
  UserCheck,
  UserX,
  Phone,
  Mail,
  DollarSign,
  AlertTriangle,
  X,
  Check,
  Zap,
  Globe
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'jobs' | 'locations' | 'settings'

  // Global State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNewUserMode, setIsNewUserMode] = useState(false);

  // Jobs State
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isNewJobMode, setIsNewJobMode] = useState(false);

  // Locations State
  const [locations, setLocations] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');
  const [selectedLocationEntity, setSelectedLocationEntity] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Platform Features & Broadcast State
  const [features, setFeatures] = useState({
    autoApproveJobs: true,
    instantWhatsAppAlerts: true,
    instantTelegramAlerts: true,
    salaryVisible: true,
    liveMapRealtimeSync: true,
    maintenanceMode: false,
    customAnnouncement: ''
  });
  const [broadcastForm, setBroadcastForm] = useState({
    title: 'Platform Maintenance Notice',
    message: '',
    type: 'info'
  });
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Initial Load
  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, usersData, jobsData, locData, featData] = await Promise.all([
        adminService.getStats().catch(() => null),
        adminService.getUsers().catch(() => []),
        adminService.getJobs().catch(() => []),
        adminService.getLocations().catch(() => ({ locations: [] })),
        adminService.getFeatures().catch(() => null)
      ]);

      if (statsData) setStats(statsData);
      if (usersData) setUsers(usersData);
      if (jobsData) setJobs(jobsData);
      if (locData && locData.locations) setLocations(locData.locations);
      if (featData) setFeatures(featData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Error loading administrator control data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  // --- USER HANDLERS ---
  const handleToggleBlockUser = async (u) => {
    try {
      const res = await adminService.toggleBlockUser(u.id);
      setUsers(prev => prev.map(item => item.id === u.id ? { ...item, isBlocked: res.isBlocked } : item));
      showToast(res.message);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleToggleVerifyUser = async (u) => {
    try {
      const res = await adminService.toggleVerifyUser(u.id);
      setUsers(prev => prev.map(item => item.id === u.id ? { ...item, isVerified: res.isVerified } : item));
      showToast(res.message);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.email || u.phone})? All associated jobs and applications will also be removed.`)) {
      return;
    }
    try {
      await adminService.deleteUser(u.id);
      setUsers(prev => prev.filter(item => item.id !== u.id));
      showToast(`User "${u.name}" deleted successfully.`);
      loadAllData();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleSaveUserModal = async (e) => {
    e.preventDefault();
    try {
      if (isNewUserMode) {
        const created = await adminService.createUser(selectedUser);
        setUsers(prev => [created, ...prev]);
        showToast('New user created successfully');
      } else {
        const updated = await adminService.updateUser(selectedUser.id, selectedUser);
        setUsers(prev => prev.map(item => item.id === updated.id ? updated : item));
        showToast('User profile updated successfully');
      }
      setIsUserModalOpen(false);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // --- JOB HANDLERS ---
  const handleDeleteJob = async (job) => {
    if (!window.confirm(`Delete job listing "${job.title}" at "${job.company}"?`)) return;
    try {
      await adminService.deleteJob(job.id);
      setJobs(prev => prev.filter(j => j.id !== job.id));
      showToast('Job listing deleted successfully.');
      loadAllData();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleToggleJobStatus = async (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      const updated = await adminService.updateJob(job.id, { status: nextStatus });
      setJobs(prev => prev.map(j => j.id === job.id ? updated : j));
      showToast(`Job status changed to ${nextStatus.toUpperCase()}`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleSaveJobModal = async (e) => {
    e.preventDefault();
    try {
      if (isNewJobMode) {
        const created = await adminService.createJob(selectedJob);
        setJobs(prev => [created, ...prev]);
        showToast('Job created and published successfully');
      } else {
        const updated = await adminService.updateJob(selectedJob.id, selectedJob);
        setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
        showToast('Job updated successfully');
      }
      setIsJobModalOpen(false);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // --- LOCATION HANDLERS ---
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.updateLocation(
        selectedLocationEntity.type === 'job' ? 'job' : 'user',
        selectedLocationEntity.id,
        {
          lat: Number(selectedLocationEntity.lat),
          lng: Number(selectedLocationEntity.lng),
          address: selectedLocationEntity.address
        }
      );
      showToast(res.message);
      setIsLocationModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // --- FEATURE SETTINGS & BROADCAST HANDLERS ---
  const handleToggleFeature = async (key) => {
    const updated = { ...features, [key]: !features[key] };
    setFeatures(updated);
    try {
      await adminService.updateFeatures(updated);
      showToast(`Feature setting updated`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateFeatures(features);
      showToast('Announcement and settings saved to platform');
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.message.trim()) return;
    try {
      await adminService.broadcastMessage(broadcastForm);
      setBroadcastSuccess('Real-time announcement broadcasted to all active connected browsers!');
      setBroadcastForm(prev => ({ ...prev, message: '' }));
      setTimeout(() => setBroadcastSuccess(''), 5000);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Filters
  const filteredUsers = users.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userStatusFilter === 'blocked' && !u.isBlocked) return false;
    if (userStatusFilter === 'verified' && !u.isVerified) return false;
    if (userStatusFilter === 'incomplete' && u.isProfileComplete !== false) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const match = (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.companyName && u.companyName.toLowerCase().includes(q)) ||
        (u.title && u.title.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const filteredJobs = jobs.filter(j => {
    if (jobStatusFilter !== 'all' && j.status !== jobStatusFilter) return false;
    if (jobSearch.trim()) {
      const q = jobSearch.toLowerCase();
      const match = (j.title && j.title.toLowerCase().includes(q)) ||
        (j.company && j.company.toLowerCase().includes(q)) ||
        (j.address && j.address.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const filteredLocations = locations.filter(l => {
    if (locationTypeFilter !== 'all' && l.type !== locationTypeFilter) return false;
    if (locationSearch.trim()) {
      const q = locationSearch.toLowerCase();
      const match = ((l.title || l.name) && (l.title || l.name).toLowerCase().includes(q)) ||
        (l.address && l.address.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-rose-500/30 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-rose-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                JobScout Enterprise Master Admin
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-bold text-rose-300 uppercase tracking-widest">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage all platform users, live job listings, map pin coordinates & system features
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={loadAllData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
            title="Refresh All Realtime Metrics"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-rose-400' : ''} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('feed') : null}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-600/20 flex items-center gap-1.5"
          >
            <span>Exit to App</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </header>

      {/* Toast Feedback */}
      {error && (
        <div className="mx-4 sm:mx-8 mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}><X size={15} /></button>
        </div>
      )}
      {success && (
        <div className="mx-4 sm:mx-8 mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')}><X size={15} /></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="px-4 sm:px-8 mt-6">
        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
              activeTab === 'overview'
                ? 'border-rose-500 text-white bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={16} />
            <span>Dashboard & Health</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
              activeTab === 'users'
                ? 'border-rose-500 text-white bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={16} />
            <span>Users Management</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
              activeTab === 'jobs'
                ? 'border-rose-500 text-white bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase size={16} />
            <span>Jobs Directory</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
              activeTab === 'locations'
                ? 'border-rose-500 text-white bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin size={16} />
            <span>Locations & Radar Pins</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {locations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 ${
              activeTab === 'settings'
                ? 'border-rose-500 text-white bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={16} />
            <span>Features & Broadcast</span>
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <main className="px-4 sm:px-8 mt-6 max-w-7xl w-full mx-auto flex-1">
        
        {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Total Users Registered</span>
                  <Users size={16} className="text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats?.totalUsers || users.length}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                  <span className="text-cyan-400 font-semibold">{stats?.seekersCount || 0} Candidates</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{stats?.employersCount || 0} Companies</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Live Job Openings</span>
                  <Briefcase size={16} className="text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats?.totalJobs || jobs.length}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 mt-2 font-semibold">
                  <span>{stats?.openJobs || jobs.filter(j => j.status === 'open').length} Active & Searchable</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Applications & ATS</span>
                  <UserCheck size={16} className="text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats?.totalApplications || 0}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                  <span className="text-purple-400 font-semibold">{stats?.offeredApplications || 0} Offered</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{stats?.hiredApplications || 0} Hired</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Live Radar Map Pins</span>
                  <MapPin size={16} className="text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {locations.length}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-rose-400 mt-2 font-semibold">
                  <span>GPS Geocoded & Clustered</span>
                </div>
              </div>
            </div>

            {/* Server Health & Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <Cpu size={16} className="text-rose-400" />
                    Server & Microservices Health
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                      <span className="text-slate-400">Node.js Engine:</span>
                      <span className="font-mono text-slate-200">{stats?.systemHealth?.nodeVersion || 'v26.13.0'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                      <span className="text-slate-400">Server Uptime:</span>
                      <span className="font-mono text-emerald-400">{stats?.systemHealth?.uptimeSeconds || 0} seconds (Active)</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                      <span className="text-slate-400">Memory Heap Used:</span>
                      <span className="font-mono text-cyan-400">{stats?.systemHealth?.memoryHeapUsedMb || 45} MB</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                      <span className="text-slate-400">WebSocket / Signaling:</span>
                      <span className="font-mono text-emerald-400">Online & Broadcast Ready</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Database: JSON Atomic Sync with Backup Recovery</span>
                  <span className="text-emerald-400 font-bold">● Healthy</span>
                </div>
              </div>

              {/* Quick Admin Actions */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-amber-400" />
                    Quick Master Controls
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setIsNewUserMode(true);
                        setSelectedUser({
                          name: '',
                          email: '',
                          phone: '',
                          password: 'password123',
                          role: 'seeker',
                          title: '',
                          companyName: '',
                          address: 'BKC, Mumbai',
                          lat: 19.0760,
                          lng: 72.8777
                        });
                        setIsUserModalOpen(true);
                      }}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group"
                    >
                      <UserCheck size={18} className="text-indigo-400 mb-2 group-hover:scale-110 transition" />
                      <div className="text-xs font-bold text-white">+ Create User</div>
                      <div className="text-[10px] text-slate-400">Seeker / Employer</div>
                    </button>

                    <button
                      onClick={() => {
                        setIsNewJobMode(true);
                        setSelectedJob({
                          title: '',
                          company: 'JobScout Enterprise',
                          category: 'Technology',
                          jobType: 'Full-time',
                          salary: '₹15,00,000 / yr',
                          address: 'Andheri East, Mumbai',
                          lat: 19.1136,
                          lng: 72.8697,
                          description: '',
                          skills: ['React', 'Node.js'],
                          urgent: false
                        });
                        setIsJobModalOpen(true);
                      }}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group"
                    >
                      <Briefcase size={18} className="text-emerald-400 mb-2 group-hover:scale-110 transition" />
                      <div className="text-xs font-bold text-white">+ Post Job</div>
                      <div className="text-[10px] text-slate-400">Add to Live Board</div>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group"
                    >
                      <Radio size={18} className="text-rose-400 mb-2 group-hover:scale-110 transition" />
                      <div className="text-xs font-bold text-white">Broadcast Alert</div>
                      <div className="text-[10px] text-slate-400">To All Browsers</div>
                    </button>

                    <button
                      onClick={() => setActiveTab('locations')}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group"
                    >
                      <MapPin size={18} className="text-amber-400 mb-2 group-hover:scale-110 transition" />
                      <div className="text-xs font-bold text-white">Radar Map Pins</div>
                      <div className="text-[10px] text-slate-400">Manage Geo Pins</div>
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                  Logged in as: <strong className="text-white">{user?.name}</strong> ({user?.email})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name, email, phone number, company..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Roles</option>
                  <option value="seeker">Job Seekers</option>
                  <option value="emp">Employers</option>
                  <option value="admin">Administrators</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="blocked">Blocked Only</option>
                  <option value="incomplete">Profile Incomplete</option>
                </select>

                <button
                  onClick={() => {
                    setIsNewUserMode(true);
                    setSelectedUser({
                      name: '',
                      email: '',
                      phone: '',
                      password: 'password123',
                      role: 'seeker',
                      title: '',
                      companyName: '',
                      address: 'BKC, Mumbai',
                      lat: 19.0760,
                      lng: 72.8777
                    });
                    setIsUserModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                >
                  <Plus size={15} />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Users Table / Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Status Badges</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No users found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name || 'User')}`}
                                alt=""
                                className="w-8 h-8 rounded-full bg-slate-800 shrink-0 border border-slate-700"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{u.name || 'Unnamed User'}</span>
                                  {u.isVerified && <CheckCircle size={13} className="text-cyan-400" />}
                                  {u.isBlocked && <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold">BLOCKED</span>}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                  {u.role === 'emp' ? (u.companyName || u.company || 'Employer') : (u.title || 'Candidate')}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : u.role === 'emp'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}>
                              {u.role === 'admin' ? 'Super Admin' : u.role === 'emp' ? 'Employer' : 'Job Seeker'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-[11px]">
                            <div className="flex flex-col gap-0.5">
                              {u.email && <span className="text-slate-300">{u.email}</span>}
                              {u.phone && <span className="text-slate-500">{u.phone}</span>}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-[11px] text-slate-400">
                            <span className="truncate block max-w-[140px]">{u.address || 'Mumbai, India'}</span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleVerifyUser(u)}
                                className={`p-1 rounded-md transition ${u.isVerified ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                title={u.isVerified ? 'Remove verification' : 'Mark as verified'}
                              >
                                <ShieldCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleToggleBlockUser(u)}
                                className={`p-1 rounded-md transition ${u.isBlocked ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500 hover:text-rose-400'}`}
                                title={u.isBlocked ? 'Unblock user' : 'Block user'}
                              >
                                <UserX size={14} />
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setIsNewUserMode(false);
                                  setSelectedUser(u);
                                  setIsUserModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Edit user profile & details"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400 transition"
                                title="Permanently delete user"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JOBS MANAGEMENT */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Search job title, company name, skills or location..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open (Active)</option>
                  <option value="closed">Closed / Archived</option>
                </select>

                <button
                  onClick={() => {
                    setIsNewJobMode(true);
                    setSelectedJob({
                      title: '',
                      company: 'TechCorp India',
                      category: 'Technology',
                      jobType: 'Full-time',
                      salary: '₹18,00,000 / yr',
                      address: 'BKC, Mumbai',
                      lat: 19.0760,
                      lng: 72.8777,
                      description: 'Enter comprehensive job responsibilities and candidate perks...',
                      skills: ['React', 'Node.js', 'PostgreSQL'],
                      urgent: false
                    });
                    setIsJobModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                >
                  <Plus size={15} />
                  <span>Post Job</span>
                </button>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Job Role & Title</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Salary Package</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No jobs found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map(job => (
                        <tr key={job.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{job.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{job.jobType || 'Full-time'}</span>
                              <span>•</span>
                              <span className="text-indigo-400">{job.category || 'General'}</span>
                              {job.urgent && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold">
                                  URGENT
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-200">{job.company || job.employerName}</span>
                          </td>

                          <td className="py-3 px-4 font-mono text-emerald-400">
                            {job.salary || 'Competitive'}
                          </td>

                          <td className="py-3 px-4 text-slate-400 max-w-[160px] truncate">
                            {job.address || 'Mumbai, India'}
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleJobStatus(job)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 ${
                                job.status === 'open'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                              {job.status === 'open' ? 'Active' : 'Closed'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setIsNewJobMode(false);
                                  setSelectedJob(job);
                                  setIsJobModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Edit job details"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400 transition"
                                title="Delete job"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOCATIONS MANAGEMENT & RADAR PINS */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Filter map pins by title, address, or city..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={locationTypeFilter}
                  onChange={(e) => setLocationTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Map Entities</option>
                  <option value="job">Jobs Only</option>
                  <option value="seeker">Job Seekers Only</option>
                  <option value="employer">Employers Only</option>
                </select>
              </div>
            </div>

            {/* Location Pins List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Pin Entity</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Latitude / Longitude</th>
                      <th className="py-3 px-4">Full Address</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredLocations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No geocoded pins found.
                        </td>
                      </tr>
                    ) : (
                      filteredLocations.map((loc, idx) => (
                        <tr key={`${loc.type}_${loc.id}_${idx}`} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-bold text-white">
                            {loc.title || loc.name}
                            {loc.company && <span className="block text-[10px] text-slate-400 font-normal">{loc.company}</span>}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              loc.type === 'job' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : loc.type === 'employer'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {loc.type.toUpperCase()}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-300">
                            {Number(loc.lat).toFixed(4)}, {Number(loc.lng).toFixed(4)}
                          </td>

                          <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">
                            {loc.address || 'Mumbai, India'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedLocationEntity(loc);
                                setIsLocationModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition"
                            >
                              Update GPS Pin
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PLATFORM SETTINGS, CUSTOM FUNCTIONALITY & BROADCAST */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Flags Configuration */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders size={18} className="text-rose-400" />
                  Platform Features & Functionality Toggles
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enable or disable enterprise platform modules in real-time across the platform
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Instant WhatsApp Job Alerts</span>
                    <span className="text-[10px] text-slate-400">Generate WhatsApp direct hiring alerts for candidates</span>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('instantWhatsAppAlerts')}
                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${features.instantWhatsAppAlerts ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block shadow" />
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Instant Telegram Deep-Link Alerts</span>
                    <span className="text-[10px] text-slate-400">Dispatch live bot announcements directly to Telegram groups</span>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('instantTelegramAlerts')}
                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${features.instantTelegramAlerts ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block shadow" />
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Salary Transparency on Map</span>
                    <span className="text-[10px] text-slate-400">Show exact compensation figures in live pins</span>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('salaryVisible')}
                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${features.salaryVisible ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block shadow" />
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Real-Time Vector Map Sync</span>
                    <span className="text-[10px] text-slate-400">Hardware-accelerated CartoDB & dual window position tracking</span>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('liveMapRealtimeSync')}
                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${features.liveMapRealtimeSync ? 'bg-amber-600 justify-end' : 'bg-slate-800 justify-start'}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block shadow" />
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">System Maintenance Mode</span>
                    <span className="text-[10px] text-slate-400">Temporarily restrict applicant operations for scheduled upgrades</span>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('maintenanceMode')}
                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${features.maintenanceMode ? 'bg-rose-600 justify-end' : 'bg-slate-800 justify-start'}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block shadow" />
                  </button>
                </div>
              </div>

              {/* Global Announcement Banner */}
              <form onSubmit={handleSaveAnnouncement} className="pt-4 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-white">
                  Persistent Platform Header Announcement
                </label>
                <input
                  type="text"
                  value={features.customAnnouncement || ''}
                  onChange={(e) => setFeatures({ ...features, customAnnouncement: e.target.value })}
                  placeholder="e.g. 🎉 JobScout 2.0 Live Radar Engine is now online across India!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Save Announcement Banner
                </button>
              </form>
            </div>

            {/* Realtime Alert Broadcaster */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio size={18} className="text-rose-500 animate-pulse" />
                  Instant WebSocket Alert Broadcaster
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Deliver high-priority announcements directly to all currently active user browser windows
                </p>

                {broadcastSuccess && (
                  <div className="p-3 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2 animate-fadeIn">
                    <CheckCircle size={15} />
                    <span>{broadcastSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSendBroadcast} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Alert Heading / Title
                    </label>
                    <input
                      type="text"
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      placeholder="e.g. Critical Grid Update"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Alert Severity & Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['info', 'success', 'warning', 'urgent'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBroadcastForm({ ...broadcastForm, type: t })}
                          className={`py-1.5 text-center text-xs font-bold rounded-xl uppercase tracking-wider transition ${
                            broadcastForm.type === t
                              ? 'bg-rose-600 text-white shadow'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Broadcast Message Content
                    </label>
                    <textarea
                      rows={4}
                      value={broadcastForm.message}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      placeholder="Type the message that will pop up on all seeker and employer screens..."
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 transition"
                  >
                    <Send size={15} />
                    <span>Dispatch Real-Time Broadcast Now</span>
                  </button>
                </form>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-[11px] text-slate-400 mt-4">
                💡 Broadcasts are delivered via Socket.io event <code>system:broadcast</code> and show up as toast alerts on dual active devices.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: USER CREATE / EDIT MODAL */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-rose-400" />
                {isNewUserMode ? 'Create New User Account' : `Edit User: ${selectedUser.name}`}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUserModal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={selectedUser.name || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={selectedUser.phone || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">System Role</label>
                  <select
                    value={selectedUser.role || 'seeker'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  >
                    <option value="seeker">Job Seeker</option>
                    <option value="emp">Employer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {selectedUser.role === 'emp' ? 'Company Name' : 'Job Title'}
                  </label>
                  <input
                    type="text"
                    value={selectedUser.role === 'emp' ? (selectedUser.companyName || '') : (selectedUser.title || '')}
                    onChange={(e) => selectedUser.role === 'emp' 
                      ? setSelectedUser({ ...selectedUser, companyName: e.target.value })
                      : setSelectedUser({ ...selectedUser, title: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
              </div>

              {isNewUserMode && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={selectedUser.password || 'password123'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={selectedUser.lat || 19.0760}
                    onChange={(e) => setSelectedUser({ ...selectedUser, lat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={selectedUser.lng || 72.8777}
                    onChange={(e) => setSelectedUser({ ...selectedUser, lng: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={selectedUser.address || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedUser.isVerified)}
                    onChange={(e) => setSelectedUser({ ...selectedUser, isVerified: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-rose-500"
                  />
                  <span>Verified Badge</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedUser.isBlocked)}
                    onChange={(e) => setSelectedUser({ ...selectedUser, isBlocked: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-rose-500"
                  />
                  <span>Block User Access</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: JOB CREATE / EDIT MODAL */}
      {isJobModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase size={18} className="text-emerald-400" />
                {isNewJobMode ? 'Create New Job Listing' : `Edit Job: ${selectedJob.title}`}
              </h3>
              <button onClick={() => setIsJobModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveJobModal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Job Title</label>
                <input
                  type="text"
                  value={selectedJob.title || ''}
                  onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={selectedJob.company || ''}
                    onChange={(e) => setSelectedJob({ ...selectedJob, company: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Salary Package</label>
                  <input
                    type="text"
                    value={selectedJob.salary || ''}
                    onChange={(e) => setSelectedJob({ ...selectedJob, salary: e.target.value })}
                    placeholder="₹15,00,000 / yr"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={selectedJob.category || 'Technology'}
                    onChange={(e) => setSelectedJob({ ...selectedJob, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Support">Support</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Job Type</label>
                  <select
                    value={selectedJob.jobType || 'Full-time'}
                    onChange={(e) => setSelectedJob({ ...selectedJob, jobType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract / Gig">Contract / Gig</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={selectedJob.lat || 19.0760}
                    onChange={(e) => setSelectedJob({ ...selectedJob, lat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={selectedJob.lng || 72.8777}
                    onChange={(e) => setSelectedJob({ ...selectedJob, lng: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={selectedJob.address || ''}
                  onChange={(e) => setSelectedJob({ ...selectedJob, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(selectedJob.skills) ? selectedJob.skills.join(', ') : (selectedJob.skills || '')}
                  onChange={(e) => setSelectedJob({ ...selectedJob, skills: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="React, Node.js, WebSockets"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJob.status === 'open'}
                    onChange={(e) => setSelectedJob({ ...selectedJob, status: e.target.checked ? 'open' : 'closed' })}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                  />
                  <span>Job Status: Active (Open)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedJob.urgent)}
                    onChange={(e) => setSelectedJob({ ...selectedJob, urgent: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-rose-500"
                  />
                  <span>Urgent Hiring Flag</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  Save Job Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOCATION PIN MODIFIER */}
      {isLocationModalOpen && selectedLocationEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin size={18} className="text-amber-400" />
                Update GPS Coordinates
              </h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                <span className="font-bold text-white block">{selectedLocationEntity.title || selectedLocationEntity.name}</span>
                <span className="text-[10px] text-amber-400 uppercase font-semibold">Entity Type: {selectedLocationEntity.type}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={selectedLocationEntity.lat || 19.0760}
                    onChange={(e) => setSelectedLocationEntity({ ...selectedLocationEntity, lat: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={selectedLocationEntity.lng || 72.8777}
                    onChange={(e) => setSelectedLocationEntity({ ...selectedLocationEntity, lng: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={selectedLocationEntity.address || ''}
                  onChange={(e) => setSelectedLocationEntity({ ...selectedLocationEntity, address: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/30"
                >
                  Update Pin on Live Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
