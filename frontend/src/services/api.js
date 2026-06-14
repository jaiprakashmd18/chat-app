import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mechat_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mechat_token');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (formData) => api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteAvatar: () => api.delete('/users/avatar'),
  updateStatus: (data) => api.put('/users/status', data),
  searchUsers: (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`),
  blockUser: (userId) => api.post(`/users/block/${userId}`),
  unblockUser: (userId) => api.delete(`/users/block/${userId}`),
  getBlockedUsers: () => api.get('/users/blocked'),
};

export const chatAPI = {
  getChats: () => api.get('/chats'),
  getChatById: (id) => api.get(`/chats/${id}`),
  getOrCreateDirect: (userId) => api.post(`/chats/direct/${userId}`),
  muteChat: (id) => api.put(`/chats/${id}/mute`),
  archiveChat: (id) => api.put(`/chats/${id}/archive`),
  markAsRead: (id) => api.put(`/chats/${id}/read`),
  getPinnedMessages: (id) => api.get(`/chats/${id}/pinned`),
};

export const messageAPI = {
  getMessages: (chatId, params) => api.get(`/messages/${chatId}`, { params }),
  sendMessage: (chatId, formData) => api.post(`/messages/${chatId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  editMessage: (messageId, content) => api.put(`/messages/${messageId}/edit`, { content }),
  deleteMessage: (messageId, deleteFor) => api.delete(`/messages/${messageId}`, { data: { deleteFor } }),
  addReaction: (messageId, emoji) => api.post(`/messages/${messageId}/react`, { emoji }),
  pinMessage: (messageId) => api.put(`/messages/${messageId}/pin`),
  starMessage: (messageId) => api.put(`/messages/${messageId}/star`),
  getStarredMessages: () => api.get('/messages/starred'),
  searchMessages: (params) => api.get('/messages/search', { params }),
};

export const friendAPI = {
  getFriends: () => api.get('/friends'),
  sendRequest: (userId, message) => api.post(`/friends/request/${userId}`, { message }),
  respondToRequest: (requestId, action) => api.put(`/friends/request/${requestId}`, { action }),
  removeFriend: (userId) => api.delete(`/friends/${userId}`),
  getPendingRequests: () => api.get('/friends/requests/pending'),
  getSentRequests: () => api.get('/friends/requests/sent'),
  cancelRequest: (userId) => api.delete(`/friends/request/${userId}/cancel`),
};

export const groupAPI = {
  createGroup: (data) => api.post('/groups', data),
  getGroup: (id) => api.get(`/groups/${id}`),
  updateGroup: (id, data) => api.put(`/groups/${id}`, data),
  addMember: (id, userId) => api.post(`/groups/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
  leaveGroup: (id) => api.post(`/groups/${id}/leave`),
  updateMemberRole: (id, userId, role) => api.put(`/groups/${id}/members/role`, { userId, role }),
  getInviteLink: (id) => api.get(`/groups/${id}/invite`),
  joinByInvite: (code) => api.get(`/groups/join/${code}`),
};

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (ids) => api.put('/notifications/read', { notificationIds: ids }),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/all'),
};

export const aiAPI = {
  getConversations: () => api.get('/ai/conversations'),
  getConversation: (id) => api.get(`/ai/conversations/${id}`),
  sendMessage: (data) => api.post('/ai/chat', data),
  deleteConversation: (id) => api.delete(`/ai/conversations/${id}`),
  smartReply: (context) => api.post('/ai/smart-reply', { context }),
};

export const searchAPI = {
  global: (params) => api.get('/search', { params }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (userId, data) => api.put(`/admin/users/${userId}/ban`, data),
  makeAdmin: (userId) => api.put(`/admin/users/${userId}/admin`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  getGroups: (params) => api.get('/admin/groups', { params }),
};

export default api;
