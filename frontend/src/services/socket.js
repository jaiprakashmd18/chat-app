import { io } from 'socket.io-client';

let socket = null;

/**
 * Socket.IO server URL.
 *
 * On Vercel:  Set VITE_SOCKET_URL to a dedicated backend (e.g. Railway/Render)
 *             for full WebSocket support. If not set, Socket.IO falls back to
 *             HTTP long-polling via the same Vercel domain (works, higher latency).
 *
 * Local dev:  Leave VITE_SOCKET_URL unset — Vite proxies /socket.io to :5000.
 */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    // Try WebSocket first; Vercel serverless will fall back to polling automatically.
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    // Required when Socket.IO server is on a different origin (VITE_SOCKET_URL set)
    withCredentials: true,
  });

  socket.on('connect',       () => console.log('[socket] connected:', socket.id));
  socket.on('disconnect',    (r) => console.log('[socket] disconnected:', r));
  socket.on('connect_error', (e) => console.warn('[socket] error:', e.message));

  return socket;
};

export const getSocket       = () => socket;
export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const socketEvents = {
  MESSAGE_SEND:      'message:send',
  MESSAGE_NEW:       'message:new',
  MESSAGE_READ:      'message:read',
  MESSAGE_READ_RECEIPT: 'message:read_receipt',
  MESSAGE_EDIT:      'message:edit',
  MESSAGE_EDITED:    'message:edited',
  MESSAGE_DELETE:    'message:delete',
  MESSAGE_DELETED:   'message:deleted',
  MESSAGE_DELIVERED: 'message:delivered',
  TYPING_START:      'typing:start',
  TYPING_STOP:       'typing:stop',
  TYPING_UPDATE:     'typing:update',
  REACTION_ADD:      'reaction:add',
  REACTION_UPDATED:  'reaction:updated',
  USER_STATUS:       'user:status',
  CALL_INITIATE:     'call:initiate',
  CALL_INCOMING:     'call:incoming',
  CALL_ACCEPT:       'call:accept',
  CALL_ACCEPTED:     'call:accepted',
  CALL_REJECT:       'call:reject',
  CALL_REJECTED:     'call:rejected',
  CALL_END:          'call:end',
  CALL_ENDED:        'call:ended',
  WEBRTC_OFFER:      'webrtc:offer',
  WEBRTC_ANSWER:     'webrtc:answer',
  WEBRTC_ICE:        'webrtc:ice-candidate',
};
