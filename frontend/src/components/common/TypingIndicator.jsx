import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';

export default function TypingIndicator({ typingUsers }) {
  const users = Object.values(typingUsers || {});
  if (users.length === 0) return null;

  const text = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing`
    : `${users.length} people are typing`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-2 px-4 py-1"
      >
        <div className="glass rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/50 typing-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <span className="text-xs text-white/50">{text}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
