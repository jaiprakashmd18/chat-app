import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Plus, Trash2, Sparkles, MessageSquare, Zap, Globe, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { aiAPI } from '../services/api';

const SUGGESTED_PROMPTS = [
  { icon: Sparkles, text: 'What can you help me with?', category: 'intro' },
  { icon: Globe, text: 'Translate "Hello, how are you?" to Spanish', category: 'translate' },
  { icon: Zap, text: 'Write a short bio for my profile', category: 'content' },
  { icon: BookOpen, text: 'Explain quantum computing simply', category: 'learn' },
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3 mb-4`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-primary-600 text-white rounded-br-sm' : 'glass text-white rounded-bl-sm'}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-white/50' : 'text-white/30'}`}>
          {format(new Date(msg.timestamp || Date.now()), 'h:mm a')}
        </p>
      </div>
    </motion.div>
  );
}

export default function AIPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    aiAPI.getConversations().then(r => setConversations(r.conversations || [])).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text = null) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { response, conversationId } = await aiAPI.sendMessage({ message: msg, conversationId: activeConvId });
      const aiMsg = { role: 'assistant', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      if (!activeConvId) {
        setActiveConvId(conversationId);
        const { conversation } = await aiAPI.getConversation(conversationId);
        setConversations(prev => [conversation, ...prev]);
      }
    } catch {
      toast.error('MeAI is unavailable. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const startNew = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const loadConversation = async (conv) => {
    setActiveConvId(conv._id);
    try {
      const { conversation } = await aiAPI.getConversation(conv._id);
      setMessages(conversation.messages || []);
    } catch {
      toast.error('Failed to load conversation');
    }
  };

  const deleteConversation = async (id) => {
    try {
      await aiAPI.deleteConversation(id);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (activeConvId === id) startNew();
    } catch {}
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-dark-900/50">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 bg-dark-800/60 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">MeAI</h2>
              <p className="text-xs text-white/40">Your AI Assistant</p>
            </div>
          </div>
          <button onClick={startNew} className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm">
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm px-4">
              No conversations yet
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv._id}
                onClick={() => loadConversation(conv)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 text-left group transition-colors ${activeConvId === conv._id ? 'bg-primary-600/10 text-primary-400' : 'text-white/60'}`}
              >
                <MessageSquare size={14} className="flex-shrink-0" />
                <span className="text-xs truncate flex-1">{conv.title || 'New Conversation'}</span>
                <button
                  onClick={e => { e.stopPropagation(); deleteConversation(conv._id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-dark-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center shadow-glow-sm">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">MeAI Assistant</h1>
              <p className="text-xs text-white/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Ready to help
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-8 max-w-xl mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-glow animate-float">
                  <Bot size={36} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Hi! I'm MeAI</h2>
                <p className="text-white/50 text-sm">I can help you with questions, translations, content creation, and more!</p>
              </motion.div>

              <div className="grid grid-cols-2 gap-3 w-full">
                {SUGGESTED_PROMPTS.map(({ icon: Icon, text, category }) => (
                  <motion.button
                    key={text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => handleSend(text)}
                    className="glass-card p-4 text-left hover:border-primary-500/30 transition-all group"
                  >
                    <Icon size={20} className="text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-white/70">{text}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)
          )}

          {isLoading && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white/40 typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-dark-800/60">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask MeAI anything..."
              rows={1}
              className="input flex-1 resize-none max-h-32 py-3"
              style={{ minHeight: '48px' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="btn-primary px-4 flex items-center justify-center rounded-xl disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-xs text-white/20 mt-2">MeAI can make mistakes. Consider checking important information.</p>
        </div>
      </div>
    </div>
  );
}
