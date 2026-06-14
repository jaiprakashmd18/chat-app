import { useRef, useCallback } from 'react';
import { socketEvents } from '../services/socket';
import useAuthStore from '../store/useAuthStore';

export const useTyping = (chatId) => {
  const { socket } = useAuthStore();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    if (!socket || !chatId || isTypingRef.current) return;
    isTypingRef.current = true;
    socket.emit(socketEvents.TYPING_START, { chatId });
  }, [socket, chatId]);

  const stopTyping = useCallback(() => {
    if (!socket || !chatId || !isTypingRef.current) return;
    isTypingRef.current = false;
    socket.emit(socketEvents.TYPING_STOP, { chatId });
  }, [socket, chatId]);

  const handleTyping = useCallback(() => {
    startTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  }, [startTyping, stopTyping]);

  return { handleTyping, stopTyping };
};
