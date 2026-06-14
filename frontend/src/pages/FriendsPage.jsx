import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, Clock, Check, X, MessageCircle, UserMinus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { friendAPI, userAPI } from '../services/api';
import useChatStore from '../store/useChatStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const tabs = [
  { id: 'all', label: 'All Friends', icon: Users },
  { id: 'online', label: 'Online', icon: Check },
  { id: 'pending', label: 'Requests', icon: Clock },
  { id: 'add', label: 'Add Friend', icon: UserPlus },
];

export default function FriendsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { getOrCreateDirectChat } = useChatStore();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        friendAPI.getFriends(),
        friendAPI.getPendingRequests(),
      ]);
      setFriends(friendsRes.friends || []);
      setPendingRequests(requestsRes.requests || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const { users } = await userAPI.searchUsers(q);
      setSearchResults(users);
    } finally {
      setIsSearching(false);
    }
  };

  const sendRequest = async (userId) => {
    try {
      await friendAPI.sendRequest(userId);
      toast.success('Friend request sent!');
      setSearchResults(prev => prev.map(u => u._id === userId ? { ...u, requestSent: true } : u));
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      await friendAPI.respondToRequest(requestId, action);
      toast.success(action === 'accept' ? 'Friend request accepted!' : 'Request declined');
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
      if (action === 'accept') loadData();
    } catch {
      toast.error('Failed to respond to request');
    }
  };

  const removeFriend = async (userId) => {
    try {
      await friendAPI.removeFriend(userId);
      toast.success('Friend removed');
      setFriends(prev => prev.filter(f => f.friend._id !== userId));
    } catch {
      toast.error('Failed to remove friend');
    }
  };

  const openChat = async (userId) => {
    try {
      const chat = await getOrCreateDirectChat(userId);
      navigate('/app/messages');
    } catch {
      toast.error('Failed to open chat');
    }
  };

  const filteredFriends = friends.filter(({ friend }) => {
    const matches = !searchQuery || friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'online') return matches && friend.status === 'online';
    return matches;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-dark-900/50">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Friends</h1>
          {pendingRequests.length > 0 && (
            <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {pendingRequests.length} pending
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass rounded-xl p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === id ? 'bg-primary-600 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
              {id === 'pending' && pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Add Friend Tab */}
        {activeTab === 'add' && (
          <div>
            <div className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search by username or name..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="input pl-11 py-3"
                autoFocus
              />
            </div>
            {isSearching ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map(u => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 flex items-center gap-4"
                  >
                    <Avatar user={u} size="md" showStatus />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{u.displayName}</p>
                      <p className="text-sm text-white/40">@{u.username}</p>
                      {u.bio && <p className="text-xs text-white/40 mt-1 truncate">{u.bio}</p>}
                    </div>
                    {u.requestSent ? (
                      <span className="text-xs text-white/40 flex items-center gap-1"><Check size={12} /> Sent</span>
                    ) : (
                      <button onClick={() => sendRequest(u._id)} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                        <UserPlus size={14} /> Add
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-12 text-white/30">
                <Search size={40} className="mx-auto mb-3 opacity-50" />
                <p>No users found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="text-center py-12 text-white/30">
                <UserPlus size={40} className="mx-auto mb-3 opacity-50" />
                <p>Search for users to add as friends</p>
              </div>
            )}
          </div>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <Clock size={40} className="mx-auto mb-3 opacity-50" />
                <p>No pending friend requests</p>
              </div>
            ) : (
              pendingRequests.map(req => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <Avatar user={req.from} size="md" showStatus />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{req.from?.displayName}</p>
                    <p className="text-sm text-white/40">@{req.from?.username}</p>
                    {req.message && <p className="text-xs text-white/50 mt-1 italic">"{req.message}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => respondToRequest(req._id, 'accept')} className="btn-primary text-sm px-3 py-2 flex items-center gap-1">
                      <Check size={14} />
                    </button>
                    <button onClick={() => respondToRequest(req._id, 'reject')} className="btn-secondary text-sm px-3 py-2 text-red-400 hover:text-red-300">
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* All Friends / Online Tab */}
        {(activeTab === 'all' || activeTab === 'online') && (
          <div>
            {(activeTab === 'all' || activeTab === 'online') && friends.length > 0 && (
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input pl-9 py-2 text-sm"
                />
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <Users size={40} className="mx-auto mb-3 opacity-50" />
                <p>{activeTab === 'online' ? 'No friends online' : 'No friends yet'}</p>
                <button onClick={() => setActiveTab('add')} className="btn-primary text-sm px-4 py-2 mt-4">
                  Add Friends
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-white/30 mb-3">{filteredFriends.length} {activeTab === 'online' ? 'online' : 'friend'}{filteredFriends.length !== 1 ? 's' : ''}</p>
                {filteredFriends.map(({ friend, chat, friendship }) => (
                  <motion.div
                    key={friend._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 flex items-center gap-4 hover:border-white/20 transition-colors"
                  >
                    <Avatar user={friend} size="md" showStatus />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{friend.displayName}</p>
                      <p className="text-sm text-white/40">@{friend.username}</p>
                      {friend.statusMessage && <p className="text-xs text-white/30 mt-0.5 truncate">{friend.statusMessage}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openChat(friend._id)} className="btn-secondary text-sm px-3 py-2 flex items-center gap-1.5">
                        <MessageCircle size={14} />
                        <span className="hidden sm:inline">Message</span>
                      </button>
                      <button onClick={() => removeFriend(friend._id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
