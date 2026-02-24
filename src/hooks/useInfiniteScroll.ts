import { useState, useEffect, useRef, useCallback } from 'react';

const PAGE_SIZE = 12;

/**
 * Simple client-side infinite scroll hook.
 * Takes a full array of items and reveals them in pages as the user scrolls.
 */
export function useInfiniteScroll<T>(items: T[], pageSize = PAGE_SIZE) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset when items change (e.g. filter change)
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
  }, [items.length, pageSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return { visibleItems, hasMore, sentinelRef };
}
