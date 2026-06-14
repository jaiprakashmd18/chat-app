import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import useChatStore from '../store/useChatStore';
import useNotificationStore from '../store/useNotificationStore';
import FriendsPage from './FriendsPage';
import GroupsPage from './GroupsPage';
import AIPage from './AIPage';
import SettingsPage from './SettingsPage';
import ProfilePage from './ProfilePage';
import SearchPage from './SearchPage';
import NotificationsPage from './NotificationsPage';
import HomePage from './HomePage';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { activeChat, setActiveChat } = useChatStore();
  const { fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    if (Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    navigate('/app/messages');
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-dark-900 relative">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-3 left-3 z-30 p-2 bg-dark-800 rounded-lg text-white/60 hover:text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 fixed md:relative z-30 h-full
          transition-transform duration-300 ease-in-out
        `}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/messages" element={
            <div className="flex flex-1 overflow-hidden">
              <ChatList activeChat={activeChat} onChatSelect={handleChatSelect} />
              <div className="flex-1 flex flex-col relative overflow-hidden">
                <ChatWindow chat={activeChat} onShowProfile={() => setShowProfile(!showProfile)} />
              </div>
            </div>
          } />
          <Route path="/friends/*" element={<FriendsPage />} />
          <Route path="/groups/*" element={<GroupsPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </div>
    </div>
  );
}
