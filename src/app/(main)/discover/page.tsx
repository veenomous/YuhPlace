'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  Briefcase,
  Users,
  Compass,
  MapPin,
  Image as ImageIcon,
  BadgeCheck,
  MessageSquare,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useRegion } from '@/context/RegionContext';
import { DiscoverFeedSkeleton } from '@/components/Skeletons';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import VerifiedPartner from '@/components/VerifiedPartner';
import type { DiscoverPostWithDetails, PostType } from '@/types/database';

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

// ─── Post type config (new palette) ──────────────────────────────────────────

const POST_TYPE_CONFIG: Record<
  PostType,
  { label: string; bg: string; fg: string; icon: typeof AlertTriangle }
> = {
  alert: { label: 'Alert', bg: '#FFF4EC', fg: '#E9792E', icon: AlertTriangle },
  event: { label: 'Event', bg: '#EEE9FF', fg: '#7C5CFA', icon: Calendar },
  business: { label: 'Business', bg: '#F1FBF4', fg: '#196a24', icon: Briefcase },
  community: { label: 'Community', bg: '#EFF6FF', fg: '#1667B7', icon: Users },
};

const FILTER_TABS: { label: string; value: PostType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Alerts', value: 'alert' },
  { label: 'Events', value: 'event' },
  { label: 'Business', value: 'business' },
  { label: 'Community', value: 'community' },
];

// ─── Components ──────────────────────────────────────────────────────────────

function PostTypeBadge({ type }: { type: PostType }) {
  const config = POST_TYPE_CONFIG[type];
  const Icon = config.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: config.bg, color: config.fg }}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
}

function PostCard({ post, commentCount }: { post: DiscoverPostWithDetails; commentCount: number }) {
  const hasImage = post.discover_post_images.length > 0;

  return (
    <Link href={`/discover/${post.id}`} className="block group">
      <article
        className="rounded-2xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        style={{ backgroundColor: '#ffffff', border: '1px solid rgba(191,202,186,0.35)' }}
      >
        {/* Top row: badge + region */}
        <div className="flex items-center justify-between mb-2.5">
          <PostTypeBadge type={post.post_type} />
          <span className="flex items-center gap-1 text-[11px]" style={{ color: '#40493d' }}>
            <MapPin size={11} />
            {post.regions.name}
          </span>
        </div>

        {/* Content */}
        <div className={cn('flex gap-3', hasImage && 'items-start')}>
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-bold leading-snug mb-1"
              style={{ color: '#1c1b1b', fontFamily: 'var(--font-headline)' }}
            >
              {post.title}
            </h3>
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#40493d' }}>
              {post.description}
            </p>
          </div>

          {hasImage && (
            <div
              className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: '#f6f3f2' }}
            >
              {post.discover_post_images[0].image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.discover_post_images[0].image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={22} style={{ color: 'rgba(64,73,61,0.2)' }} />
              )}
            </div>
          )}
        </div>

        {/* Author row */}
        <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid rgba(191,202,186,0.3)' }}>
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#F1FBF4' }}
          >
            <span className="text-[10px] font-bold" style={{ color: '#196a24' }}>
              {post.profiles.name.charAt(0)}
            </span>
          </div>
          <span className="text-xs font-medium truncate" style={{ color: '#1c1b1b' }}>
            {post.profiles.name}
          </span>
          {post.profiles.is_verified_partner ? (
            <VerifiedPartner partnerName={post.profiles.partner_name ?? null} size="xs" />
          ) : post.profiles.is_verified_business ? (
            <BadgeCheck size={13} style={{ color: '#F2B134' }} className="flex-shrink-0" />
          ) : null}
          <div className="flex items-center gap-3 ml-auto flex-shrink-0">
            {commentCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#196a24' }}>
                <MessageSquare size={12} />
                {commentCount}
              </span>
            )}
            <span className="text-[11px]" style={{ color: '#40493d' }}>
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
    <div style={{ backgroundColor: '#fcf9f8', color: '#1c1b1b' }}>
      {/* ── Hero ── */}
      <section className="-mx-4 px-4 pt-6 pb-5" style={{ backgroundColor: '#fcf9f8' }}>
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold mb-3 tracking-widest uppercase"
            style={{ backgroundColor: '#F1FBF4', color: '#196a24' }}
          >
            <Compass size={10} /> GT This Week
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-black tracking-tighter leading-[0.95] mb-2"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            What&rsquo;s happening <br />
            <span style={{ color: '#196a24' }}>back home.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-sm max-w-md" style={{ color: '#40493d' }}>
            Local alerts, events, and community updates from across Guyana. Whether yuh home or abroad, this is your pulse.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Filter + create ── */}
      <section className="pt-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1 -mx-4 px-4">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: isActive ? '#196a24' : '#ffffff',
                    color: isActive ? '#ffffff' : '#40493d',
                    border: isActive ? '1px solid #196a24' : '1px solid rgba(191,202,186,0.4)',
                    fontFamily: 'var(--font-headline)',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <Link
            href="/post"
            className="ml-2 flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-full flex-shrink-0"
            style={{ backgroundColor: '#196a24', fontFamily: 'var(--font-headline)' }}
          >
            <Plus size={13} />
            Post
          </Link>
        </div>
      </section>

      {/* ── Feed ── */}
      <section className="pb-8">
        {loading ? (
          <DiscoverFeedSkeleton />
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#f0edec' }}
            >
              <Compass size={22} style={{ color: '#40493d' }} />
            </div>
            <p className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-headline)' }}>
              Nothing here yet
            </p>
            <p className="text-xs" style={{ color: '#40493d' }}>
              Try switching region or category
            </p>
          </div>
        ) : (
          <motion.div
            className="flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {visibleItems.map((post) => (
              <motion.div key={post.id} variants={fadeUp}>
                <PostCard post={post} commentCount={commentCounts.get(post.id) ?? 0} />
              </motion.div>
            ))}
            {hasMore && <div ref={sentinelRef} className="h-4" />}
          </motion.div>
        )}
      </section>

      {/* ── Diaspora nudge at bottom ── */}
      <section className="-mx-4 px-4 py-8" style={{ backgroundColor: '#f6f3f2' }}>
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #196a24, #36843a)' }}>
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <ShieldCheck size={18} className="mb-2" style={{ color: '#f1e340' }} />
            <h3 className="text-lg font-black mb-1" style={{ fontFamily: 'var(--font-headline)' }}>
              Reading this from abroad?
            </h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#a3f69e' }}>
              Send somebody home to check on what yuh reading about. Property viewings, supplies drop-offs, trusted handymen &mdash; all in one request.
            </p>
            <Link
              href="/home-services"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold"
              style={{ backgroundColor: '#f1e340', color: '#6c6400' }}
            >
              See home services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
