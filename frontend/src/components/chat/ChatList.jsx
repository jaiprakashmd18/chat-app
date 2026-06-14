import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Archive, Bell, BellOff, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import { SkeletonMessage } from '../common/LoadingSpinner';

function ChatItem({ chat, isActive, onClick }) {
  const { user } = useAuthStore();
  const { unreadCounts } = useChatStore();

  const otherUser = chat.type === 'direct'
    ? chat.participants?.find(p => (p._id || p) !== user?._id)
    : null;

  const displayName = chat.type === 'direct'
    ? (otherUser?.displayName || 'Unknown')
    : (chat.group?.name || chat.name || 'Group');

  const avatarUser = chat.type === 'direct' ? otherUser : { displayName: chat.group?.name, avatar: chat.group?.avatar };
  const lastMsg = chat.lastMessage;
  const unread = unreadCounts[chat._id] || 0;
  const isMuted = chat.mutedBy?.includes(user?._id);

  const getLastMessagePreview = () => {
    if (!lastMsg) return 'No messages yet';
    if (lastMsg.isDeleted) return '🚫 Message deleted';
    const isMe = (lastMsg.sender?._id || lastMsg.sender) === user?._id;
    const prefix = isMe ? 'You: ' : '';
    if (lastMsg.type === 'text') return prefix + (lastMsg.content?.slice(0, 50) || '');
    if (lastMsg.type === 'image') return prefix + '📷 Photo';
    if (lastMsg.type === 'video') return prefix + '🎥 Video';
    if (lastMsg.type === 'audio') return prefix + '🎵 Audio';
    if (lastMsg.type === 'voice') return prefix + '🎤 Voice message';
    if (lastMsg.type === 'document') return prefix + '📎 Document';
    return prefix + 'Message';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl mx-2 transition-all ${
        isActive ? 'bg-primary-600/20 border border-primary-500/30' : 'hover:bg-white/5'
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar user={avatarUser} size="md" showStatus={chat.type === 'direct'} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-white/90'}`}>
            {displayName}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isMuted && <BellOff size={11} className="text-white/30" />}
            {lastMsg?.createdAt && (
              <span className="text-xs text-white/30">
                {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false }).replace('about ', '').replace(' minutes', 'm').replace(' hours', 'h').replace(' days', 'd')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs truncate ${unread > 0 ? 'text-white/70 font-medium' : 'text-white/40'}`}>
            {getLastMessagePreview()}
          </p>
          {unread > 0 && (
            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary-600 rounded-full text-xs flex items-center justify-center font-bold">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatList({ activeChat, onChatSelect }) {
  const { chats, fetchChats, isLoadingChats } = useChatStore();
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => { fetchChats(); }, []);

  const filtered = chats.filter(c => {
    const name = c.type === 'direct'
      ? c.participants?.find(p => p._id !== c.participants?.[0]?._id)?.displayName
      : c.group?.name || c.name;
    return (!search || name?.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="w-80 border-r border-white/5 bg-dark-800/60 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white text-lg">Messages</h2>
          <div className="flex gap-1">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Archived chats"
            >
              <Archive size={16} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
        {isLoadingChats ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonMessage key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white/30 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Search size={24} />
            </div>
            <p className="text-sm">{search ? 'No conversations found' : 'No conversations yet. Start chatting!'}</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map(chat => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isActive={activeChat?._id === chat._id}
                onClick={() => onChatSelect(chat)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
