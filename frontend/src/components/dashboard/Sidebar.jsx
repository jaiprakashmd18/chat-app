import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MessageCircle, Users, UserPlus, Hash, Mic, Bot,
  Settings, LogOut, Bell, Search, Plus, ChevronDown, Menu
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useNotificationStore from '../../store/useNotificationStore';
import Avatar from '../common/Avatar';

const navItems = [
  { icon: Home, label: 'Home', path: '/app' },
  { icon: MessageCircle, label: 'Messages', path: '/app/messages' },
  { icon: Users, label: 'Friends', path: '/app/friends' },
  { icon: Hash, label: 'Groups', path: '/app/groups' },
  { icon: Users, label: 'Communities', path: '/app/communities' },
  { icon: Mic, label: 'Voice', path: '/app/voice' },
  { icon: Bot, label: 'MeAI', path: '/app/ai' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

export default function Sidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-64 bg-dark-800/90 backdrop-blur-md border-r border-white/5 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <Link to="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center shadow-glow-sm">
            <MessageCircle size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">MeCHAT</span>
        </Link>
      </div>

      {/* Search */}
      <div className="p-3">
        <Link to="/app/search" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-sm">
          <Search size={16} />
          <span>Search...</span>
          <kbd className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto no-scrollbar">
        <div className="space-y-0.5">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path || (path !== '/app' && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                onClick={onNavigate}
                className={`sidebar-item relative ${isActive ? 'sidebar-item-active' : ''}`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {label === 'Messages' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 rounded-full text-xs flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="section-title">Quick Actions</div>
          <button className="sidebar-item w-full">
            <div className="w-6 h-6 rounded-md bg-primary-600/20 flex items-center justify-center">
              <Plus size={14} className="text-primary-400" />
            </div>
            <span className="text-sm">New Group</span>
          </button>
          <Link to="/app/friends?tab=add" className="sidebar-item">
            <div className="w-6 h-6 rounded-md bg-green-600/20 flex items-center justify-center">
              <UserPlus size={14} className="text-green-400" />
            </div>
            <span className="text-sm">Add Friend</span>
          </Link>
          <Link to="/app/notifications" className="sidebar-item">
            <div className="relative w-6 h-6 rounded-md bg-blue-600/20 flex items-center justify-center">
              <Bell size={14} className="text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center" />
              )}
            </div>
            <span className="text-sm">Notifications</span>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-white/5">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="relative">
              <Avatar user={user} size="sm" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-dark-800" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
              <p className="text-xs text-white/40 truncate">@{user?.username}</p>
            </div>
            <ChevronDown size={14} className={`text-white/40 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full left-0 right-0 mb-2 glass-card py-2"
              >
                <Link to="/app/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm" onClick={() => setShowUserMenu(false)}>
                  <Avatar user={user} size="xs" />
                  View Profile
                </Link>
                <Link to="/app/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm" onClick={() => setShowUserMenu(false)}>
                  <Settings size={14} />
                  Settings
                </Link>
                {user?.isAdmin && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-yellow-400 transition-colors text-sm" onClick={() => setShowUserMenu(false)}>
                    <Hash size={14} />
                    Admin Panel
                  </Link>
                )}
                <div className="h-px bg-white/10 mx-3 my-1" />
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/20 text-red-400 transition-colors text-sm w-full">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
