import { create } from 'zustand';
import { chatAPI, messageAPI } from '../services/api';

const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  isLoadingChats: false,
  isLoadingMessages: false,
  unreadCounts: {},

  fetchChats: async () => {
    set({ isLoadingChats: true });
    try {
      const { chats } = await chatAPI.getChats();
      const unreadCounts = {};
      chats.forEach(chat => {
        const userUnread = chat.unreadCounts?.find(u => u.user === get().currentUserId);
        unreadCounts[chat._id] = userUnread?.count || 0;
      });
      set({ chats, isLoadingChats: false, unreadCounts });
    } catch (error) {
      set({ isLoadingChats: false });
    }
  },

  setActiveChat: (chat) => set({ activeChat: chat }),

  fetchMessages: async (chatId, params = {}) => {
    set({ isLoadingMessages: true });
    try {
      const { messages, hasMore } = await messageAPI.getMessages(chatId, params);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: params.page > 1
            ? [...messages, ...(state.messages[chatId] || [])]
            : messages,
        },
        isLoadingMessages: false,
      }));
      return { hasMore };
    } catch {
      set({ isLoadingMessages: false });
      return { hasMore: false };
    }
  },

  addMessage: (message) => {
    const chatId = message.chat?._id || message.chat;
    set((state) => {
      const existing = state.messages[chatId] || [];
      const isDuplicate = existing.some(m => m._id === message._id);
      if (isDuplicate) return state;
      const updated = [...existing, message];
      const updatedChats = state.chats.map(c =>
        c._id === chatId ? { ...c, lastMessage: message, lastActivity: message.createdAt } : c
      ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
      return { messages: { ...state.messages, [chatId]: updated }, chats: updatedChats };
    });
  },

  updateMessage: (messageId, updates) => {
    set((state) => {
      const newMessages = { ...state.messages };
      Object.keys(newMessages).forEach(chatId => {
        newMessages[chatId] = newMessages[chatId].map(m =>
          m._id === messageId ? { ...m, ...updates } : m
        );
      });
      return { messages: newMessages };
    });
  },

  removeMessage: (messageId, chatId, deletedFor) => {
    if (deletedFor === 'everyone') {
      get().updateMessage(messageId, { isDeleted: true, content: 'This message was deleted' });
    } else {
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] || []).filter(m => m._id !== messageId),
        },
      }));
    }
  },

  setTyping: (chatId, userId, displayName, isTyping) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: isTyping
          ? { ...(state.typingUsers[chatId] || {}), [userId]: displayName }
          : Object.fromEntries(Object.entries(state.typingUsers[chatId] || {}).filter(([k]) => k !== userId)),
      },
    }));
  },

  updateReactions: (messageId, reactions) => {
    get().updateMessage(messageId, { reactions });
  },

  markChatAsRead: (chatId) => {
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [chatId]: 0 },
      chats: state.chats.map(c => c._id === chatId
        ? { ...c, unreadCounts: (c.unreadCounts || []).map(u => ({ ...u, count: 0 })) }
        : c
      ),
    }));
  },

  updateUserStatus: (userId, status, lastSeen) => {
    set((state) => ({
      chats: state.chats.map(chat => ({
        ...chat,
        participants: (chat.participants || []).map(p =>
          (p._id || p) === userId ? { ...p, status, ...(lastSeen && { lastSeen }) } : p
        ),
      })),
    }));
  },

  getOrCreateDirectChat: async (userId) => {
    try {
      const { chat } = await chatAPI.getOrCreateDirect(userId);
      set((state) => {
        const exists = state.chats.find(c => c._id === chat._id);
        return exists ? { activeChat: chat } : { chats: [chat, ...state.chats], activeChat: chat };
      });
      return chat;
    } catch (error) {
      throw error;
    }
  },
}));

export default useChatStore;
