import { motion } from 'framer-motion';

const statusColors = {
  online: 'bg-green-400',
  away: 'bg-yellow-400',
  busy: 'bg-red-400',
  offline: 'bg-gray-500',
};

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const dotSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

export default function Avatar({ user, size = 'md', showStatus = false, className = '' }) {
  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {user?.avatar?.url ? (
        <img
          src={user.avatar.url}
          alt={user.displayName || user.username}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white/10`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center font-semibold text-white ring-2 ring-white/10`}>
          {initials}
        </div>
      )}
      {showStatus && user?.status && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} ${statusColors[user.status] || statusColors.offline} rounded-full border-2 border-dark-800`} />
      )}
    </div>
  );
}
