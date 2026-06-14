import { create } from 'zustand';
import { authAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('mechat_token'),
  isLoading: false,
  isAuthenticated: false,
  socket: null,

  initialize: async () => {
    const token = localStorage.getItem('mechat_token');
    if (!token) return;
    try {
      set({ isLoading: true });
      const { user } = await authAPI.getMe();
      const socket = initSocket(token);
      set({ user, token, isAuthenticated: true, socket });
    } catch {
      localStorage.removeItem('mechat_token');
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authAPI.login(credentials);
      localStorage.setItem('mechat_token', token);
      const socket = initSocket(token);
      set({ user, token, isAuthenticated: true, socket, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authAPI.register(data);
      localStorage.setItem('mechat_token', token);
      const socket = initSocket(token);
      set({ user, token, isAuthenticated: true, socket, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem('mechat_token');
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false, socket: null });
  },

  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

  getSocket: () => get().socket,
}));

export default useAuthStore;
