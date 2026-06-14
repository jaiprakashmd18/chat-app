import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Lock, Palette, Globe, Shield, LogOut, Save, Eye, EyeOff, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { userAPI, authAPI } from '../services/api';
import Avatar from '../components/common/Avatar';
import { useTheme } from '../contexts/ThemeContext';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    statusMessage: user?.statusMessage || '',
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({});

  const [notifications, setNotifications] = useState(user?.notifications || {
    messages: true, mentions: true, friendRequests: true, groupInvites: true, sound: true, desktop: true,
  });

  const [privacy, setPrivacy] = useState(user?.privacy || {
    showLastSeen: true, showOnlineStatus: true, allowFriendRequests: true, profileVisibility: 'everyone',
  });

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      const { user: updated } = await userAPI.updateProfile(profileForm);
      updateUser(updated);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async () => {
    setIsLoading(true);
    try {
      const { user: updated } = await userAPI.updateProfile({ notifications });
      updateUser(updated);
      toast.success('Notification settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const savePrivacy = async () => {
    setIsLoading(true);
    try {
      const { user: updated } = await userAPI.updateProfile({ privacy });
      updateUser(updated);
      toast.success('Privacy settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.new.length < 8) return toast.error('Password must be at least 8 characters');
    setIsLoading(true);
    try {
      await authAPI.updatePassword({ currentPassword: passwords.current, newPassword: passwords.new });
      setPasswords({ current: '', new: '', confirm: '' });
      toast.success('Password updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { avatar } = await userAPI.updateAvatar(formData);
      updateUser({ avatar });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to update avatar');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar user={user} size="2xl" />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="text-xs text-white text-center">Change</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div>
                <p className="font-semibold text-white">{user?.displayName}</p>
                <p className="text-sm text-white/40">@{user?.username}</p>
                <label className="btn-secondary text-xs mt-2 inline-flex items-center gap-1 cursor-pointer">
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Display Name</label>
                <input type="text" value={profileForm.displayName} onChange={e => setProfileForm(p => ({ ...p, displayName: e.target.value }))} className="input" maxLength={50} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Username</label>
                <input type="text" value={user?.username} disabled className="input opacity-50 cursor-not-allowed" />
                <p className="text-xs text-white/30 mt-1">Username cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Bio</label>
                <textarea value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell people about yourself..." className="input h-24 resize-none" maxLength={200} />
                <p className="text-xs text-white/20 mt-1">{profileForm.bio.length}/200</p>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Status Message</label>
                <input type="text" value={profileForm.statusMessage} onChange={e => setProfileForm(p => ({ ...p, statusMessage: e.target.value }))} placeholder="What's on your mind?" className="input" maxLength={100} />
              </div>
              <button onClick={saveProfile} disabled={isLoading} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <p className="text-white/50 text-sm">Choose what you want to be notified about</p>
            {Object.entries(notifications).map(([key, value]) => {
              const labels = { messages: 'New Messages', mentions: 'Mentions', friendRequests: 'Friend Requests', groupInvites: 'Group Invites', sound: 'Sound Effects', desktop: 'Desktop Notifications' };
              return (
                <div key={key} className="flex items-center justify-between p-4 glass rounded-xl">
                  <span className="text-sm font-medium text-white">{labels[key]}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={value} onChange={e => setNotifications(p => ({ ...p, [key]: e.target.checked }))} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary-600' : 'bg-white/20'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </label>
                </div>
              );
            })}
            <button onClick={saveNotifications} disabled={isLoading} className="btn-primary flex items-center gap-2">
              <Save size={16} />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            {[
              { key: 'showLastSeen', label: 'Show Last Seen', desc: 'Let others see when you were last active' },
              { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Let others see when you are online' },
              { key: 'allowFriendRequests', label: 'Allow Friend Requests', desc: 'Let others send you friend requests' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between p-4 glass rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" className="sr-only" checked={privacy[key]} onChange={e => setPrivacy(p => ({ ...p, [key]: e.target.checked }))} />
                  <div className={`w-11 h-6 rounded-full transition-colors ${privacy[key] ? 'bg-primary-600' : 'bg-white/20'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${privacy[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>
            ))}
            <div className="p-4 glass rounded-xl">
              <p className="text-sm font-medium text-white mb-3">Profile Visibility</p>
              <div className="space-y-2">
                {[
                  { value: 'everyone', label: 'Everyone', desc: 'Anyone can see your profile' },
                  { value: 'friends', label: 'Friends Only', desc: 'Only friends can see your profile' },
                  { value: 'nobody', label: 'Nobody', desc: 'No one can find your profile in search' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                    <input type="radio" name="visibility" value={opt.value} checked={privacy.profileVisibility === opt.value} onChange={e => setPrivacy(p => ({ ...p, profileVisibility: e.target.value }))} />
                    <div>
                      <p className="text-sm text-white">{opt.label}</p>
                      <p className="text-xs text-white/40">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={savePrivacy} disabled={isLoading} className="btn-primary flex items-center gap-2">
              <Save size={16} />
              {isLoading ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div className="glass-card p-4 space-y-4">
              <h3 className="font-semibold text-white">Change Password</h3>
              {['current', 'new', 'confirm'].map(key => (
                <div key={key}>
                  <label className="block text-sm text-white/60 mb-1.5">{key === 'current' ? 'Current' : key === 'new' ? 'New' : 'Confirm'} Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords[key] ? 'text' : 'password'}
                      value={passwords[key]}
                      onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                      className="input pr-10"
                    />
                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                      {showPasswords[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={changePassword} disabled={isLoading} className="btn-primary">
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-semibold text-white mb-3">Sessions</h3>
              <p className="text-sm text-white/50 mb-3">Sign out from all devices to secure your account</p>
              <button
                onClick={async () => { await authAPI.logoutAll(); logout(); }}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium"
              >
                <Smartphone size={16} />
                Sign out from all devices
              </button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-white mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'dark', label: 'Dark', desc: 'Easier on the eyes', preview: 'bg-dark-900' },
                  { value: 'light', label: 'Light', desc: 'Classic bright theme', preview: 'bg-gray-100' },
                  { value: 'system', label: 'System', desc: 'Match OS preference', preview: 'bg-gradient-to-br from-dark-900 to-gray-100' },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${theme === t.value ? 'border-primary-500 bg-primary-600/10' : 'border-white/10 glass hover:border-white/20'}`}
                  >
                    <div className={`w-full h-16 rounded-lg mb-3 ${t.preview}`} />
                    <p className="text-sm font-medium text-white">{t.label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-4">
            <p className="text-sm text-white/50">Choose your preferred language</p>
            <div className="space-y-2">
              {[['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['ja', '日本語'], ['zh', '中文']].map(([code, name]) => (
                <button
                  key={code}
                  className="flex items-center justify-between w-full p-4 glass rounded-xl hover:bg-white/10 transition-colors"
                  onClick={() => { userAPI.updateProfile({ language: code }); updateUser({ language: code }); toast.success('Language updated!'); }}
                >
                  <span className="text-sm font-medium text-white">{name}</span>
                  {user?.language === code && <span className="text-xs text-primary-400 font-medium">Active</span>}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-dark-900/50">
      {/* Sidebar */}
      <div className="w-56 border-r border-white/5 bg-dark-800/60 py-6">
        <h2 className="font-bold text-white px-4 mb-4">Settings</h2>
        <nav className="space-y-0.5 px-2">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeSection === id ? 'bg-primary-600/20 text-primary-400' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
          <div className="h-px bg-white/10 mx-1 my-2" />
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-lg"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            {sections.find(s => s.id === activeSection)?.label}
          </h2>
          {renderSection()}
        </motion.div>
      </div>
    </div>
  );
}
