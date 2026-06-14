import { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import useNotificationStore from '../store/useNotificationStore';
import { socketEvents } from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { socket, user } = useAuthStore();
  const { addMessage, updateMessage, removeMessage, setTyping, updateReactions, updateUserStatus } = useChatStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!socket || !user) return;

    socket.on(socketEvents.MESSAGE_NEW, (message) => {
      addMessage(message);
    });

    socket.on(socketEvents.MESSAGE_EDITED, ({ messageId, content, editedAt }) => {
      updateMessage(messageId, { content, isEdited: true, editedAt });
    });

    socket.on(socketEvents.MESSAGE_DELETED, ({ messageId, deletedFor, chatId }) => {
      removeMessage(messageId, chatId, deletedFor);
    });

    socket.on(socketEvents.MESSAGE_DELIVERED, ({ messageId }) => {
      updateMessage(messageId, { delivered: true });
    });

    socket.on(socketEvents.MESSAGE_READ_RECEIPT, ({ messageId, readBy }) => {
      updateMessage(messageId, { readBy: [readBy] });
    });

    socket.on(socketEvents.TYPING_UPDATE, ({ chatId, userId, displayName, isTyping }) => {
      if (userId !== user._id) setTyping(chatId, userId, displayName, isTyping);
    });

    socket.on(socketEvents.REACTION_UPDATED, ({ messageId, reactions }) => {
      updateReactions(messageId, reactions);
    });

    socket.on(socketEvents.USER_STATUS, ({ userId, status, lastSeen }) => {
      updateUserStatus(userId, status, lastSeen);
    });

    return () => {
      Object.values(socketEvents).forEach(event => socket.off(event));
    };
  }, [socket, user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
