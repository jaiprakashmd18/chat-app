import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin w-full h-full text-primary-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center shadow-glow"
        >
          <span className="text-2xl font-bold text-white">M</span>
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold gradient-text">MeCHAT</h1>
          <p className="text-white/40 text-sm">Connect. Chat. Create.</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500"
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <div className="w-8 h-8 rounded-full shimmer-bg flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="w-24 h-3 rounded shimmer-bg" />
        <div className="w-48 h-8 rounded-xl shimmer-bg" />
      </div>
    </div>
  );
}
