import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Smile, Mic, Image, FileText,
  X, Reply, CornerDownRight
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import useChatStore from '../../store/useChatStore';
import { socketEvents } from '../../services/socket';
import { messageAPI } from '../../services/api';
import EmojiPicker from '../common/EmojiPicker';
import { useTyping } from '../../hooks/useTyping';

export default function MessageInput({ chatId, replyTo, onClearReply }) {
  const { user, socket } = useAuthStore();
  const { addMessage } = useChatStore();
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);
  const { handleTyping, stopTyping } = useTyping(chatId);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const handleSend = async () => {
    if ((!message.trim() && !files.length) || isSending) return;
    stopTyping();
    setIsSending(true);

    try {
      if (files.length) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          if (message.trim()) formData.append('content', message.trim());
          if (replyTo) formData.append('replyTo', replyTo._id);
          const { message: msg } = await messageAPI.sendMessage(chatId, formData);
          addMessage(msg);
        }
        setFiles([]);
      } else if (socket) {
        const tempId = `temp_${Date.now()}`;
        socket.emit(socketEvents.MESSAGE_SEND, {
          chatId,
          content: message.trim(),
          type: 'text',
          replyTo: replyTo?._id,
          tempId,
        });
      }

      setMessage('');
      onClearReply?.();
      textareaRef.current?.focus();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value) handleTyping();
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 128) + 'px'; }
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="border-t border-white/5 bg-dark-800/80 backdrop-blur-md">
      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute inset-0 bg-primary-600/20 border-2 border-dashed border-primary-500 rounded-xl flex items-center justify-center z-10">
          <p className="text-primary-400 font-medium">Drop files to send</p>
        </div>
      )}

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-white/5"
          >
            <Reply size={16} className="text-primary-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary-400 font-medium">{replyTo.sender?.displayName}</p>
              <p className="text-xs text-white/50 truncate">{replyTo.content || `${replyTo.type} message`}</p>
            </div>
            <button onClick={onClearReply} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-white/5"
          >
            {files.map((file, i) => (
              <div key={i} className="relative flex-shrink-0 w-16 h-16 group">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-full rounded-lg bg-white/10 flex items-center justify-center">
                    <FileText size={24} className="text-white/50" />
                  </div>
                )}
                <button onClick={() => removeFile(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div {...getRootProps()} className="flex items-end gap-2 p-3">
        <input {...getInputProps()} />

        {/* Attach */}
        <label className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer flex-shrink-0">
          <Paperclip size={20} />
          <input type="file" className="hidden" multiple onChange={e => setFiles(Array.from(e.target.files).slice(0, 5))} />
        </label>

        {/* Emoji */}
        <div className="flex-shrink-0">
          <EmojiPicker onEmojiSelect={(emoji) => setMessage(prev => prev + emoji)} />
        </div>

        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 text-sm resize-none max-h-32 leading-relaxed"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* Send */}
        <motion.button
          onClick={handleSend}
          disabled={(!message.trim() && !files.length) || isSending}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-500 flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-glow-sm"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} className="text-white" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
