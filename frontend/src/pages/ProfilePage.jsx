import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, MessageCircle, UserPlus, UserMinus, Clock, Mail, Shield } from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../store/useAuthStore';
import Avatar from '../components/common/Avatar';

const statusColors = { online: 'text-green-400', away: 'text-yellow-400', busy: 'text-red-400', offline: 'text-gray-400' };
const statusDots = { online: 'bg-green-400', away: 'bg-yellow-400', busy: 'bg-red-400', offline: 'bg-gray-400' };

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="flex-1 overflow-y-auto bg-dark-900/50">
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 relative">
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')]" />
      </div>

      {/* Profile header */}
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <Avatar user={user} size="2xl" className="ring-4 ring-dark-900" />
            <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-dark-900 ${statusDots[user?.status || 'offline']}`} />
          </div>
          <div className="flex gap-2 pb-1">
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Edit3 size={15} />
              Edit Profile
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-bold text-white">{user?.displayName}</h1>
            {user?.isAdmin && (
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield size={10} /> Admin
              </span>
            )}
          </div>
          <p className="text-white/50 mb-1">@{user?.username}</p>
          {user?.statusMessage && (
            <p className="text-white/70 text-sm italic mb-2">"{user.statusMessage}"</p>
          )}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusDots[user?.status || 'offline']}`} />
            <span className={`text-sm ${statusColors[user?.status || 'offline']}`}>
              {user?.status?.charAt(0).toUpperCase() + user?.status?.slice(1) || 'Offline'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Friends', value: '—' },
            { label: 'Groups', value: '—' },
            { label: 'Member since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : '—' },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center">
              <p className="font-bold text-white text-lg">{stat.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mt-6 mb-4">
          {['about', 'media'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'text-primary-400 border-b-2 border-primary-400' : 'text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {user?.bio && (
              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Bio</h3>
                <p className="text-sm text-white/80 leading-relaxed">{user.bio}</p>
              </div>
            )}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Account Info</h3>
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-white/40" />
                <span className="text-sm text-white/70">{user?.email}</span>
                {user?.isVerified && <span className="text-xs text-green-400">✓ Verified</span>}
              </div>
              <div className="flex items-center gap-3">
                <Clock size={15} className="text-white/40" />
                <span className="text-sm text-white/70">
                  Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Unknown'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'media' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-white/30">
            <p className="text-sm">No shared media yet</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
