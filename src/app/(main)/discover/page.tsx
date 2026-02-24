'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Calendar,
  Briefcase,
  Users,
  MapPin,
  Image as ImageIcon,
  BadgeCheck,
  MessageSquare,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useRegion } from '@/context/RegionContext';
import { DiscoverFeedSkeleton } from '@/components/Skeletons';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { DiscoverPostWithDetails, PostType } from '@/types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const POST_TYPE_CONFIG: Record<
  PostType,
  { label: string; bgClass: string; textClass: string; icon: typeof AlertTriangle }
> = {
  alert: {
    label: 'Alert',
    bgClass: 'bg-danger-light',
    textClass: 'text-danger',
    icon: AlertTriangle,
  },
  event: {
    label: 'Event',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600',
    icon: Calendar,
  },
  business: {
    label: 'Business',
    bgClass: 'bg-accent-light',
    textClass: 'text-amber-700',
    icon: Briefcase,
  },
  community: {
    label: 'Community',
    bgClass: 'bg-primary-light',
    textClass: 'text-primary-dark',
    icon: Users,
  },
};

const FILTER_TABS: { label: string; value: PostType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Alerts', value: 'alert' },
  { label: 'Events', value: 'event' },
  { label: 'Business', value: 'business' },
  { label: 'Community', value: 'community' },
];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function PostTypeBadge({ type }: { type: PostType }) {
  const config = POST_TYPE_CONFIG[type];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
        config.bgClass,
        config.textClass,
      )}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function PostCard({ post, commentCount }: { post: DiscoverPostWithDetails; commentCount: number }) {
  const hasImage = post.discover_post_images.length > 0;

  return (
    <Link href={`/discover/${post.id}`} className="block">
      <article className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
        {/* Top row: badge + region */}
        <div className="flex items-center justify-between mb-2">
          <PostTypeBadge type={post.post_type} />
          <span className="flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} />
            {post.regions.name}
          </span>
        </div>

        {/* Content area */}
        <div className={cn('flex gap-3', hasImage && 'items-start')}>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">
              {post.title}
            </h3>
            <p className="text-xs text-muted leading-relaxed line-clamp-2">
              {post.description}
            </p>
          </div>

          {hasImage && (
            <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-surface border border-border overflow-hidden flex items-center justify-center">
              {post.discover_post_images[0].image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.discover_post_images[0].image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={24} className="text-border" />
              )}
            </div>
          )}
        </div>

        {/* Author row */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
          {/* Avatar placeholder */}
          <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-dark">
              {post.profiles.name.charAt(0)}
            </span>
          </div>
          <span className="text-xs text-foreground font-medium truncate">
            {post.profiles.name}
          </span>
          {post.profiles.is_verified_business && (
            <BadgeCheck size={14} className="text-amber-500 flex-shrink-0" />
          )}
          <div className="flex items-center gap-3 ml-auto flex-shrink-0">
            {commentCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
                <MessageSquare size={12} />
                {commentCount}
              </span>
            )}
            <span className="text-xs text-muted">
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState<PostType | 'all'>('all');
  const { discoverPosts, loading, commentCounts } = useData();
  const { selectedRegion } = useRegion();

  const filteredPosts = discoverPosts.filter((p) => {
    const matchesType = activeFilter === 'all' || p.post_type === activeFilter;
    const matchesRegion = selectedRegion === 'all' || p.regions.slug === selectedRegion;
    return matchesType && matchesRegion;
  });

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll(filteredPosts);

  return (
    <div className="px-4 py-4">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-foreground">Discover</h1>
        <p className="text-xs text-muted mt-0.5">
          What&apos;s happening in your community
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted border border-border hover:border-primary hover:text-primary',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Posts feed */}
      {loading ? (
        <DiscoverFeedSkeleton />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-muted">No posts in this category yet.</p>
            </div>
          ) : (
            <>
              {visibleItems.map((post) => <PostCard key={post.id} post={post} commentCount={commentCounts.get(post.id) ?? 0} />)}
              {hasMore && <div ref={sentinelRef} className="h-4" />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
