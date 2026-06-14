import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Hash, Lock, Globe, Crown, Shield, Settings, LogOut, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupAPI } from '../services/api';
import useChatStore from '../store/useChatStore';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

function CreateGroupModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', isPublic: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Group name required');
    setIsLoading(true);
    try {
      const { group } = await groupAPI.createGroup(form);
      toast.success('Group created!');
      onCreated(group);
      onClose();
      setForm({ name: '', description: '', isPublic: false });
    } catch (err) {
      toast.error(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Group Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="My Awesome Group"
            className="input"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="What's this group about?"
            className="input h-24 resize-none"
            maxLength={500}
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))}
            className="rounded"
          />
          <div>
            <span className="text-sm text-white font-medium">Make group public</span>
            <p className="text-xs text-white/40">Anyone can find and join this group</p>
          </div>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function GroupCard({ group, onOpen }) {
  const memberCount = group.members?.length || 0;
  const myMember = group.members?.find(m => m.user?._id === group._currentUserId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 hover:border-white/20 transition-colors"
    >
      <div className="flex items-start gap-3 mb-3">
        {group.avatar?.url ? (
          <img src={group.avatar.url} alt={group.name} className="w-12 h-12 rounded-xl object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600/30 to-purple-600/30 flex items-center justify-center">
            <Hash size={20} className="text-primary-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{group.name}</h3>
            {group.isPublic ? <Globe size={12} className="text-green-400 flex-shrink-0" /> : <Lock size={12} className="text-yellow-400 flex-shrink-0" />}
          </div>
          <p className="text-xs text-white/40 mt-0.5">{memberCount} members</p>
        </div>
      </div>

      {group.description && (
        <p className="text-sm text-white/50 mb-3 line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {group.members?.slice(0, 4).map((m, i) => (
            <Avatar key={i} user={m.user} size="xs" className="ring-2 ring-dark-800" />
          ))}
          {memberCount > 4 && (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/50 ring-2 ring-dark-800">
              +{memberCount - 4}
            </div>
          )}
        </div>
        <button onClick={() => onOpen(group)} className="btn-primary text-xs px-3 py-1.5">
          Open
        </button>
      </div>
    </motion.div>
  );
}

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const { getOrCreateDirectChat } = useChatStore();
  const navigate = useNavigate();

  const openGroup = async (group) => {
    try {
      navigate('/app/messages');
    } catch (err) {
      toast.error('Failed to open group chat');
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;
    try {
      const { group } = await groupAPI.joinByInvite(joinCode.trim());
      toast.success(`Joined ${group.name}!`);
      setJoinCode('');
      openGroup(group);
    } catch (err) {
      toast.error(err.message || 'Invalid invite code');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-dark-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Groups</h1>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Create Group</span>
          </button>
        </div>

        {/* Join by invite */}
        <div className="glass-card p-4 mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Enter invite code to join a group..."
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && joinGroup()}
            className="input flex-1"
          />
          <button onClick={joinGroup} className="btn-primary px-4 flex items-center gap-2">
            <LinkIcon size={16} /> Join
          </button>
        </div>

        {/* Groups grid */}
        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-white/50 text-lg mb-2">No groups yet</h3>
            <p className="text-sm mb-6">Create a group or join one with an invite code</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary px-6 py-2">
              Create your first group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(group => (
              <GroupCard key={group._id} group={group} onOpen={openGroup} />
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(group) => setGroups(prev => [group, ...prev])}
      />
    </div>
  );
}
