'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Briefcase,
  Users,
  MapPin,
  BadgeCheck,
  Share2,
  Flag,
  Image as ImageIcon,
} from 'lucide-react';
import { cn, timeAgo, memberSince, formatWhatsAppLink } from '@/lib/utils';
import { useData } from '@/context/DataContext';
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

function PostTypeBadge({ type }: { type: PostType }) {
  const config = POST_TYPE_CONFIG[type];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        config.bgClass,
        config.textClass,
      )}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getDiscoverPost } = useData();
  const post = getDiscoverPost(id);

  if (!post) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted text-sm">Post not found.</p>
        <Link
          href="/discover"
          className="inline-block mt-4 text-sm text-primary font-medium"
        >
          Back to Discover
        </Link>
      </div>
    );
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/discover/${post.id}`
      : `/discover/${post.id}`;

  const whatsappShareLink = formatWhatsAppLink(
    '5926001234',
    `Check out this post on YuhPlace: ${post.title} - ${shareUrl}`,
  );

  const hasImages = post.discover_post_images.length > 0;

  return (
    <div className="px-4 py-4">
      {/* Back button */}
      <Link
        href="/discover"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </Link>

      {/* Post card */}
      <article className="bg-white border border-border rounded-xl overflow-hidden">
        {/* Image gallery placeholder */}
        {hasImages && (
          <div className="w-full aspect-video bg-surface flex items-center justify-center border-b border-border">
            <div className="text-center">
              <ImageIcon size={40} className="text-border mx-auto mb-2" />
              <p className="text-xs text-muted">
                {post.discover_post_images.length} photo{post.discover_post_images.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Badges row */}
          <div className="flex items-center justify-between mb-3">
            <PostTypeBadge type={post.post_type} />
            <span className="flex items-center gap-1 text-xs text-muted">
              <MapPin size={13} />
              {post.regions.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-foreground leading-snug mb-2">
            {post.title}
          </h1>

          {/* Timestamp */}
          <p className="text-xs text-muted mb-4">{timeAgo(post.created_at)}</p>

          {/* Description */}
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-6">
            {post.description}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-6">
            <a
              href={whatsappShareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <Share2 size={16} />
              Share on WhatsApp
            </a>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface text-muted rounded-lg text-sm font-medium border border-border hover:text-danger hover:border-danger transition-colors">
              <Flag size={16} />
              Report
            </button>
          </div>

          {/* Author card */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted uppercase tracking-wide mb-3 font-medium">
              Posted by
            </p>
            <div className="flex items-center gap-3">
              {/* Avatar placeholder */}
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-dark">
                  {post.profiles.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {post.profiles.name}
                  </span>
                  {post.profiles.is_verified_business && (
                    <BadgeCheck size={16} className="text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted">
                  Member since {memberSince(post.profiles.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
