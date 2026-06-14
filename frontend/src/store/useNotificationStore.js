import { create } from 'zustand';
import { notificationAPI } from '../services/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { notifications, unreadCount } = await notificationAPI.getNotifications();
      set({ notifications, unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
    if (Notification.permission === 'granted' && document.hidden) {
      new Notification(notification.title, { body: notification.body, icon: '/mechat-icon.svg' });
    }
  },

  markAsRead: async (ids) => {
    try {
      await notificationAPI.markAsRead(ids);
      set((state) => ({
        notifications: state.notifications.map(n =>
          !ids || ids.includes(n._id) ? { ...n, isRead: true } : n
        ),
        unreadCount: ids ? Math.max(0, state.unreadCount - ids.length) : 0,
      }));
    } catch {}
  },

  clearAll: async () => {
    try {
      await notificationAPI.clearAll();
      set({ notifications: [], unreadCount: 0 });
    } catch {}
  },
}));

export default useNotificationStore;
