import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, MessageSquare, Hash, Filter } from 'lucide-react';
import { searchAPI } from '../services/api';
import Avatar from '../components/common/Avatar';
import useChatStore from '../store/useChatStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const typeOptions = [
  { value: '', label: 'All' },
  { value: 'users', label: 'Users' },
  { value: 'messages', label: 'Messages' },
  { value: 'groups', label: 'Groups' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const { getOrCreateDirectChat } = useChatStore();
  const navigate = useNavigate();

  const search = useCallback(async (q, t) => {
    if (q.length < 2) { setResults({}); return; }
    setIsSearching(true);
    try {
      const { results: r } = await searchAPI.global({ q, type: t });
      setResults(r);
    } catch {} finally {
      setIsSearching(false);
    }
  }, []);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    const timeout = setTimeout(() => search(q, type), 300);
    return () => clearTimeout(timeout);
  };

  const openUserChat = async (userId) => {
    try {
      await getOrCreateDirectChat(userId);
      navigate('/app/messages');
    } catch {
      toast.error('Failed to open chat');
    }
  };

  const hasResults = Object.values(results).some(arr => arr?.length > 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-dark-900/50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

        {/* Search input */}
        <div className="relative mb-4">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          )}
          <input
            type="text"
            placeholder="Search users, messages, groups..."
            value={query}
            onChange={handleChange}
            className="input pl-12 pr-10 py-3 text-base"
            autoFocus
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-6">
          {typeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setType(opt.value); search(query, opt.value); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                type === opt.value ? 'bg-primary-600 text-white' : 'glass text-white/50 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {query.length >= 2 && !isSearching && !hasResults ? (
          <div className="text-center py-16 text-white/30">
            <Search size={40} className="mx-auto mb-3 opacity-50" />
            <p>No results for "{query}"</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Users */}
            {results.users?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={14} /> Users ({results.users.length})
                </h2>
                <div className="space-y-2">
                  {results.users.map(u => (
                    <div key={u._id} className="glass-card p-4 flex items-center gap-4">
                      <Avatar user={u} size="md" showStatus />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{u.displayName}</p>
                        <p className="text-sm text-white/40">@{u.username}</p>
                      </div>
                      <button onClick={() => openUserChat(u._id)} className="btn-secondary text-xs px-3 py-2">
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            {results.messages?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare size={14} /> Messages ({results.messages.length})
                </h2>
                <div className="space-y-2">
                  {results.messages.map(msg => (
                    <div key={msg._id} className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar user={msg.sender} size="xs" />
                        <span className="text-xs font-medium text-white/70">{msg.sender?.displayName}</span>
                        <span className="text-xs text-white/30">
                          {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-white/80">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Groups */}
            {results.groups?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Hash size={14} /> Groups ({results.groups.length})
                </h2>
                <div className="space-y-2">
                  {results.groups.map(group => (
                    <div key={group._id} className="glass-card p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                        <Hash size={18} className="text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{group.name}</p>
                        <p className="text-xs text-white/40">{group.members?.length || 0} members</p>
                      </div>
                      <button className="btn-secondary text-xs px-3 py-2">Join</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-16 text-white/20">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-white/30">Search across MeCHAT</p>
            <p className="text-sm mt-1">Find users, messages, groups, and communities</p>
          </div>
        )}
      </div>
    </div>
  );
}
