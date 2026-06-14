import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, MoreVertical, Search, Pin, Users, Info, ChevronDown, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../../store/useAuthStore';
import useChatStore from '../../store/useChatStore';
import { chatAPI } from '../../services/api';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from '../common/TypingIndicator';
import Avatar from '../common/Avatar';
import { SkeletonMessage } from '../common/LoadingSpinner';
import { socketEvents } from '../../services/socket';

function DateDivider({ date }) {
  return (
    <div className="flex items-center gap-3 px-6 py-2">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-white/30 bg-dark-800/80 px-3 py-1 rounded-full">
        {format(new Date(date), 'MMMM d, yyyy')}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

function EmptyChatState({ chat }) {
  const { user } = useAuthStore();
  const other = chat?.participants?.find(p => (p._id || p) !== user?._id);
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-white/30 px-8">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600/30 to-purple-600/30 flex items-center justify-center">
        {other ? <Avatar user={other} size="2xl" /> : <MessageCircle size={32} />}
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-white/50 mb-1">
          {other?.displayName || chat?.group?.name || 'New Chat'}
        </h3>
        <p className="text-sm">No messages yet. Say hello! 👋</p>
      </div>
    </div>
  );
}

export default function ChatWindow({ chat, onShowProfile }) {
  const { user, socket } = useAuthStore();
  const { messages, fetchMessages, isLoadingMessages, typingUsers, markChatAsRead } = useChatStore();
  const [replyTo, setReplyTo] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const chatMessages = messages[chat?._id] || [];
  const chatTypingUsers = typingUsers[chat?._id] || {};
  const otherUser = chat?.type === 'direct'
    ? chat.participants?.find(p => (p._id || p) !== user?._id)
    : null;

  const chatName = chat?.type === 'direct'
    ? (otherUser?.displayName || 'Unknown')
    : (chat?.group?.name || 'Group');

  const scrollToBottom = useCallback((smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (!chat?._id) return;
    setPage(1);
    fetchMessages(chat._id).then(({ hasMore }) => {
      setHasMore(hasMore);
      setTimeout(() => scrollToBottom(), 100);
    });
    markChatAsRead(chat._id);
    chatAPI.markAsRead(chat._id).catch(() => {});
  }, [chat?._id]);

  useEffect(() => {
    if (chatMessages.length) scrollToBottom(true);
  }, [chatMessages.length]);

  useEffect(() => {
    if (!socket || !chat?._id) return;
    socket.emit('chat:join', chat._id);
    const ids = chatMessages.filter(m => !m.readBy?.includes(user?._id)).map(m => m._id);
    if (ids.length) socket.emit(socketEvents.MESSAGE_READ, { chatId: chat._id, messageIds: ids });
    return () => socket.emit('chat:leave', chat._id);
  }, [socket, chat?._id]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const { hasMore: more } = await fetchMessages(chat._id, { page: nextPage });
    setPage(nextPage);
    setHasMore(more);
    setIsLoadingMore(false);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
    if (scrollTop < 50 && !isLoadingMore) loadMore();
  };

  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let lastDate = null;
    msgs.forEach(msg => {
      const msgDate = format(new Date(msg.createdAt), 'yyyy-MM-dd');
      if (msgDate !== lastDate) { groups.push({ type: 'date', date: msg.createdAt }); lastDate = msgDate; }
      groups.push({ type: 'message', message: msg });
    });
    return groups;
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-900/50 gap-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600/20 to-purple-600/20 flex items-center justify-center">
          <MessageCircle size={40} className="text-primary-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Select a conversation</h2>
          <p className="text-white/40 text-sm">Choose from your existing chats or start a new one</p>
        </div>
      </div>
    );
  }

  const grouped = groupMessagesByDate(chatMessages);

  return (
    <div className="flex-1 flex flex-col bg-dark-900/50 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-800/80 backdrop-blur-md border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onShowProfile?.()}>
          <div className="relative">
            <Avatar user={otherUser || { displayName: chat.group?.name, avatar: chat.group?.avatar }} size="md" showStatus={chat.type === 'direct'} />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">{chatName}</h2>
            <p className="text-xs text-white/40">
              {chat.type === 'direct'
                ? otherUser?.statusMessage || (otherUser?.status === 'online' ? 'Online' : `Last seen ${format(new Date(otherUser?.lastSeen || Date.now()), 'h:mm a')}`)
                : `${chat.group?.members?.length || 0} members`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <Phone size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <Video size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <Search size={18} />
          </button>
          <button onClick={() => onShowProfile?.()} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto py-2"
        onScroll={handleScroll}
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}

        {isLoadingMessages && chatMessages.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonMessage key={i} />)
        ) : chatMessages.length === 0 ? (
          <EmptyChatState chat={chat} />
        ) : (
          grouped.map((item, i) => {
            if (item.type === 'date') return <DateDivider key={`date-${i}`} date={item.date} />;
            const msg = item.message;
            const prev = grouped[i - 1]?.message;
            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                prevMessage={prev}
                onReply={setReplyTo}
              />
            );
          })
        )}

        <TypingIndicator typingUsers={chatTypingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-24 right-8 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-500 transition-colors z-10"
        >
          <ChevronDown size={18} />
        </motion.button>
      )}

      {/* Input */}
      <MessageInput chatId={chat._id} replyTo={replyTo} onClearReply={() => setReplyTo(null)} />
    </div>
  );
}
