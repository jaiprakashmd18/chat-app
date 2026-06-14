import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Check, CheckCheck, MoreHorizontal, Reply, Trash2,
  Edit3, Pin, Star, Forward, Smile, Copy
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import { socketEvents } from '../../services/socket';
import toast from 'react-hot-toast';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function FileAttachment({ file, type }) {
  if (type === 'image') {
    return (
      <a href={file.url} target="_blank" rel="noopener noreferrer">
        <img src={file.url} alt={file.name} className="max-w-xs rounded-lg object-cover" style={{ maxHeight: 280 }} />
      </a>
    );
  }
  if (type === 'video') {
    return <video src={file.url} controls className="max-w-xs rounded-lg" style={{ maxHeight: 280 }} />;
  }
  if (type === 'audio' || type === 'voice') {
    return <audio src={file.url} controls className="max-w-xs" />;
  }
  return (
    <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 glass rounded-lg px-4 py-3 hover:bg-white/10">
      <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
        <span className="text-lg">📎</span>
      </div>
      <div>
        <p className="text-sm font-medium text-white truncate max-w-48">{file.name}</p>
        <p className="text-xs text-white/40">{file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Download'}</p>
      </div>
    </a>
  );
}

function ReactionDisplay({ reactions, onReact }) {
  if (!reactions?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map(r => (
        <button
          key={r.emoji}
          onClick={() => onReact(r.emoji)}
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-full px-2 py-0.5 text-xs transition-colors"
        >
          <span>{r.emoji}</span>
          <span className="text-white/60">{r.users?.length}</span>
        </button>
      ))}
    </div>
  );
}

export default function MessageBubble({ message, prevMessage, onReply }) {
  const { user, socket } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const menuRef = useRef(null);

  const isSent = (message.sender?._id || message.sender) === user?._id;
  const isConsecutive = prevMessage && (prevMessage.sender?._id || prevMessage.sender) === (message.sender?._id || message.sender);
  const isSystem = message.type === 'system';
  const isDeleted = message.isDeleted;

  const handleReact = (emoji) => {
    if (!socket) return;
    socket.emit(socketEvents.REACTION_ADD, { messageId: message._id, emoji });
    setShowReactions(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Copied!');
    setShowMenu(false);
  };

  const handleDelete = (deleteFor) => {
    if (!socket) return;
    socket.emit(socketEvents.MESSAGE_DELETE, { messageId: message._id, deleteFor, chatId: message.chat });
    setShowMenu(false);
  };

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-white/30 bg-white/5 rounded-full px-3 py-1">{message.content}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex ${isSent ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 px-4 ${isConsecutive ? 'pt-0.5' : 'pt-3'}`}
    >
      {!isSent && (
        <div className="flex-shrink-0 mb-1">
          {!isConsecutive ? <Avatar user={message.sender} size="sm" /> : <div className="w-8" />}
        </div>
      )}

      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[75%] relative`}>
        {!isConsecutive && !isSent && (
          <p className="text-xs text-white/40 mb-1 ml-1">{message.sender?.displayName}</p>
        )}

        {message.replyTo && (
          <div className={`flex items-center gap-2 mb-1 px-3 py-1.5 rounded-lg bg-white/5 border-l-2 border-primary-500 text-xs text-white/50 max-w-full ${isSent ? 'border-r-2 border-l-0' : ''}`}>
            <Reply size={12} />
            <span className="truncate">{message.replyTo?.content || 'Original message'}</span>
          </div>
        )}

        <div className="relative">
          <div
            className={isDeleted ? 'italic text-white/30 glass rounded-2xl px-4 py-2.5 text-sm' : isSent ? 'message-bubble-sent' : 'message-bubble-received'}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => { setShowMenu(false); setShowReactions(false); }}
          >
            {message.file && !isDeleted && (
              <div className="mb-2">
                <FileAttachment file={message.file} type={message.type} />
              </div>
            )}
            {message.content && !isDeleted && (
              <p className="text-sm leading-relaxed break-words">{message.content}</p>
            )}
            {isDeleted && <p className="text-sm">This message was deleted</p>}

            <div className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-xs ${isSent ? 'text-white/50' : 'text-white/30'}`}>
                {format(new Date(message.createdAt), 'h:mm a')}
              </span>
              {message.isEdited && <span className="text-xs text-white/30 italic">edited</span>}
              {isSent && (
                <span className="text-xs">
                  {message.readBy?.length > 1
                    ? <CheckCheck size={12} className="text-primary-300" />
                    : <Check size={12} className="text-white/50" />
                  }
                </span>
              )}
            </div>
          </div>

          {/* Hover actions */}
          <AnimatePresence>
            {showMenu && !isDeleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute top-0 ${isSent ? 'right-full mr-2' : 'left-full ml-2'} flex items-center gap-1 glass rounded-xl p-1`}
              >
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                  >
                    <Smile size={15} />
                  </button>
                  {showReactions && (
                    <div
                      className={`absolute bottom-full mb-1 ${isSent ? 'right-0' : 'left-0'} flex gap-1 glass rounded-xl p-1.5`}
                      onMouseEnter={() => setShowReactions(true)}
                      onMouseLeave={() => setShowReactions(false)}
                    >
                      {QUICK_REACTIONS.map(emoji => (
                        <button key={emoji} onClick={() => handleReact(emoji)} className="text-lg hover:scale-125 transition-transform">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => onReply?.(message)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
                  <Reply size={15} />
                </button>
                {message.content && (
                  <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
                    <Copy size={15} />
                  </button>
                )}
                {isSent && (
                  <button onClick={() => handleDelete('everyone')} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400">
                    <Trash2 size={15} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ReactionDisplay reactions={message.reactions} onReact={handleReact} />
      </div>
    </motion.div>
  );
}
