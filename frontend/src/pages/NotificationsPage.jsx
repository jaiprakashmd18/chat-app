import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, MessageCircle, UserPlus, Users, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useNotificationStore from '../store/useNotificationStore';
import Avatar from '../components/common/Avatar';

const typeIcons = {
  message: MessageCircle,
  friend_request: UserPlus,
  friend_accept: Heart,
  group_invite: Users,
  mention: Bell,
  default: Bell,
};

const typeColors = {
  message: 'text-blue-400 bg-blue-500/10',
  friend_request: 'text-green-400 bg-green-500/10',
  friend_accept: 'text-pink-400 bg-pink-500/10',
  group_invite: 'text-purple-400 bg-purple-500/10',
  default: 'text-primary-400 bg-primary-500/10',
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotificationStore();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-dark-900/50">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-white/40 mt-1">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={() => markAsRead()} className="btn-secondary text-sm flex items-center gap-2 px-3 py-2">
                <Check size={14} />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="btn-ghost text-sm flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300">
                <Trash2 size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 text-white/30"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="opacity-50" />
            </div>
            <h3 className="font-semibold text-white/40 text-lg mb-2">No notifications</h3>
            <p className="text-sm">You're all caught up!</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map(n => {
                const Icon = typeIcons[n.type] || typeIcons.default;
                const colorClass = typeColors[n.type] || typeColors.default;
                return (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => !n.isRead && markAsRead([n._id])}
                    className={`glass-card p-4 flex items-start gap-4 cursor-pointer hover:border-white/20 transition-all ${
                      !n.isRead ? 'border-primary-500/20 bg-primary-500/5' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${n.isRead ? 'text-white/70' : 'text-white'}`}>
                        {n.title}
                      </p>
                      {n.body && <p className="text-xs text-white/40 mt-0.5">{n.body}</p>}
                      <p className="text-xs text-white/20 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {n.sender && (
                      <Avatar user={n.sender} size="sm" className="flex-shrink-0" />
                    )}
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
