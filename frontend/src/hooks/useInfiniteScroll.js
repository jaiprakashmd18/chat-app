import { useRef, useCallback } from 'react';

export const useInfiniteScroll = (callback, hasMore) => {
  const observer = useRef(null);

  const ref = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    if (!node || !hasMore) return;
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) callback();
    });
    observer.current.observe(node);
  }, [callback, hasMore]);

  return ref;
};
