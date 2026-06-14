import { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Flag, Hash, BarChart2, Shield,
  TrendingUp, MessageSquare, Ban, Trash2, Check, X, ChevronLeft,
  Activity, Server, UserX, Crown
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import Avatar from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

function StatCard({ icon: Icon, label, value, change, color }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/10`}>
          <Icon size={20} className={`text-${color}-400`} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => { setStats(r.stats); setIsLoading(false); }).catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!stats) return <div className="text-center py-20 text-white/30">Failed to load stats</div>;

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="primary" />
        <StatCard icon={Activity} label="Online Now" value={stats.onlineUsers} color="green" />
        <StatCard icon={MessageSquare} label="Total Messages" value={stats.totalMessages} color="blue" />
        <StatCard icon={Flag} label="Pending Reports" value={stats.pendingReports} color="red" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="New This Week" value={stats.newUsersThisWeek} color="yellow" />
        <StatCard icon={MessageSquare} label="Messages/Week" value={stats.messagesThisWeek} color="purple" />
        <StatCard icon={Hash} label="Groups" value={stats.totalGroups} color="indigo" />
        <StatCard icon={Server} label="Communities" value={stats.totalCommunities} color="pink" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Daily Messages (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.dailyActive}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1a202c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="messages" stroke="#7c3aed" fill="url(#msgGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">User Growth (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.userGrowth?.filter((_, i) => i % 5 === 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1a202c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="users" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async (s = '') => {
    setIsLoading(true);
    try {
      const { users: u } = await adminAPI.getUsers({ search: s });
      setUsers(u);
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId, isBanned) => {
    try {
      const reason = !isBanned ? prompt('Ban reason:') : undefined;
      await adminAPI.banUser(userId, { banned: !isBanned, reason });
      toast.success(isBanned ? 'User unbanned' : 'User banned');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !isBanned } : u));
    } catch { toast.error('Failed'); }
  };

  const toggleAdmin = async (userId) => {
    try {
      const { isAdmin } = await adminAPI.makeAdmin(userId);
      toast.success(isAdmin ? 'Admin granted' : 'Admin revoked');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isAdmin } : u));
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => { setSearch(e.target.value); loadUsers(e.target.value); }}
          className="input max-w-sm"
        />
      </div>
      {isLoading ? <div className="flex justify-center py-8"><LoadingSpinner /></div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['User', 'Email', 'Status', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u._id} className={`hover:bg-white/5 ${u.isBanned ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size="sm" showStatus />
                      <div>
                        <p className="text-sm font-medium text-white">{u.displayName}</p>
                        <p className="text-xs text-white/40">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {u.isBanned ? 'Banned' : u.isVerified ? 'Verified' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.isAdmin ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/40'}`}>
                      {u.isAdmin ? '👑 Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40">
                    {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => banUser(u._id, u.isBanned)} title={u.isBanned ? 'Unban' : 'Ban'} className={`p-1.5 rounded text-xs ${u.isBanned ? 'hover:bg-green-500/20 text-green-400' : 'hover:bg-red-500/20 text-red-400'}`}>
                        <Ban size={14} />
                      </button>
                      <button onClick={() => toggleAdmin(u._id)} title={u.isAdmin ? 'Revoke Admin' : 'Make Admin'} className="p-1.5 rounded hover:bg-yellow-500/20 text-yellow-400">
                        <Crown size={14} />
                      </button>
                      <button onClick={() => deleteUser(u._id)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportsAdmin() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    adminAPI.getReports({ status: filter }).then(r => { setReports(r.reports || []); setIsLoading(false); }).catch(() => setIsLoading(false));
  }, [filter]);

  const resolve = async (id, status) => {
    const resolution = status === 'resolved' ? prompt('Resolution:') : 'Dismissed';
    try {
      await adminAPI.resolveReport(id, { status, resolution });
      toast.success('Report updated');
      setReports(prev => prev.filter(r => r._id !== id));
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['pending', 'reviewing', 'resolved', 'dismissed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === s ? 'bg-primary-600 text-white' : 'glass text-white/50 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>
      {isLoading ? <div className="flex justify-center py-8"><LoadingSpinner /></div> : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r._id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar user={r.reporter} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">{r.reporter?.displayName} reported</p>
                    <p className="text-xs text-white/40 capitalize">{r.reason?.replace('_', ' ')} • {r.reportType}</p>
                    {r.description && <p className="text-xs text-white/50 mt-1 italic">"{r.description}"</p>}
                  </div>
                </div>
                {filter === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => resolve(r._id, 'resolved')} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      <Check size={12} /> Resolve
                    </button>
                    <button onClick={() => resolve(r._id, 'dismissed')} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-white/50">
                      <X size={12} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {reports.length === 0 && <div className="text-center py-8 text-white/30 text-sm">No {filter} reports</div>}
        </div>
      )}
    </div>
  );
}

const adminNav = [
  { path: '', icon: LayoutDashboard, label: 'Dashboard' },
  { path: 'users', icon: Users, label: 'Users' },
  { path: 'reports', icon: Flag, label: 'Reports' },
  { path: 'groups', icon: Hash, label: 'Groups' },
];

export default function AdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState('');

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/50 mb-4">Admin access required</p>
          <Link to="/app" className="btn-primary px-6 py-2">Back to App</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Admin sidebar */}
      <div className="w-56 bg-dark-800/90 border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Shield size={16} className="text-yellow-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Admin Panel</p>
              <p className="text-xs text-white/40">MeCHAT</p>
            </div>
          </div>
        </div>

        <nav className="p-3 flex-1 space-y-0.5">
          {adminNav.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => { setActivePath(path); navigate(`/admin${path ? `/${path}` : ''}`); }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activePath === path ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <Link to="/app" className="flex items-center gap-2 text-white/50 hover:text-white text-sm px-3 py-2">
            <ChevronLeft size={16} />
            Back to App
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<><h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1><Dashboard /></>} />
          <Route path="/users" element={<><h1 className="text-2xl font-bold text-white mb-6">User Management</h1><UsersAdmin /></>} />
          <Route path="/reports" element={<><h1 className="text-2xl font-bold text-white mb-6">Reports</h1><ReportsAdmin /></>} />
        </Routes>
      </div>
    </div>
  );
}
