import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Users, UserPlus, Bot, TrendingUp, Clock, Star } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import { friendAPI } from '../services/api';
import Avatar from '../components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';

export default function HomePage() {
  const { user } = useAuthStore();
  const { chats, fetchChats } = useChatStore();
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
    friendAPI.getFriends().then(r => setFriends(r.friends?.slice(0, 6) || [])).catch(() => {});
  }, []);

  const recentChats = chats.slice(0, 5);
  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCounts?.find(u => u.user === user?._id)?.count || 0), 0);

  const getHour = () => new Date().getHours();
  const greeting = getHour() < 12 ? 'Good morning' : getHour() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-dark-900/50">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">{greeting}, {user?.displayName?.split(' ')[0]}! 👋</h1>
        <p className="text-white/40">
          {totalUnread > 0 ? `You have ${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: MessageCircle, label: 'Conversations', value: chats.length, color: 'text-primary-400', bg: 'bg-primary-600/10', path: '/app/messages' },
          { icon: Users, label: 'Friends', value: friends.length, color: 'text-green-400', bg: 'bg-green-600/10', path: '/app/friends' },
          { icon: Star, label: 'Unread', value: totalUnread, color: 'text-yellow-400', bg: 'bg-yellow-600/10', path: '/app/messages' },
          { icon: Bot, label: 'MeAI', value: 'Chat', color: 'text-purple-400', bg: 'bg-purple-600/10', path: '/app/ai' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={stat.path} className="glass-card p-4 flex flex-col gap-3 hover:border-white/20 transition-colors block">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent conversations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-primary-400" />
              Recent Conversations
            </h2>
            <Link to="/app/messages" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          {recentChats.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentChats.map(chat => {
                const other = chat.type === 'direct' ? chat.participants?.find(p => p._id !== user?._id) : null;
                const name = other?.displayName || chat.group?.name || 'Chat';
                const avatarUser = other || { displayName: chat.group?.name, avatar: chat.group?.avatar };
                return (
                  <button
                    key={chat._id}
                    onClick={() => { navigate('/app/messages'); }}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <Avatar user={avatarUser} size="sm" showStatus={chat.type === 'direct'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{name}</p>
                      <p className="text-xs text-white/40 truncate">{chat.lastMessage?.content || 'No messages'}</p>
                    </div>
                    {chat.lastActivity && (
                      <span className="text-xs text-white/30 flex-shrink-0">
                        {formatDistanceToNow(new Date(chat.lastActivity), { addSuffix: true })}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Online friends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users size={16} className="text-green-400" />
              Friends Online
            </h2>
            <Link to="/app/friends" className="text-xs text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          {friends.filter(f => f.friend?.status === 'online').length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No friends online</p>
              <Link to="/app/friends?tab=add" className="text-xs text-primary-400 hover:text-primary-300 mt-1 inline-flex items-center gap-1">
                <UserPlus size={12} /> Add friends
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {friends.filter(f => f.friend?.status === 'online').map(({ friend, chat }) => (
                <button
                  key={friend._id}
                  onClick={() => navigate('/app/messages')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Avatar user={friend} size="md" showStatus />
                  <span className="text-xs text-white/60 truncate w-full text-center">{friend.displayName?.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 glass-card p-5"
      >
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: MessageCircle, label: 'New Message', path: '/app/messages', color: 'primary' },
            { icon: UserPlus, label: 'Add Friend', path: '/app/friends?tab=add', color: 'green' },
            { icon: Users, label: 'Create Group', path: '/app/groups', color: 'yellow' },
            { icon: Bot, label: 'Ask MeAI', path: '/app/ai', color: 'purple' },
          ].map(({ icon: Icon, label, path, color }) => (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-3 p-3 rounded-xl bg-${color}-600/10 hover:bg-${color}-600/20 transition-colors`}
            >
              <Icon size={18} className={`text-${color}-400`} />
              <span className="text-sm text-white/70">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
