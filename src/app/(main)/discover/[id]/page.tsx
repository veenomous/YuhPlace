'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  Pencil,
} from 'lucide-react';
import { cn, timeAgo, memberSince } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import type { PostType } from '@/types/database';
import ReportModal from '@/components/ReportModal';
import CommentSection from '@/components/CommentSection';
import FavoriteButton from '@/components/FavoriteButton';

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
  const router = useRouter();
  const { getDiscoverPost, deleteDiscoverPost } = useData();
  const { user } = useAuth();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showReport, setShowReport] = useState(false);

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

  const isOwner = user && post.user_id === user.id;
  const images = post.discover_post_images.filter((img) => img.image_url);
  const hasImages = images.length > 0;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/discover/${post.id}`
      : `/discover/${post.id}`;

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    const { error } = await deleteDiscoverPost(post.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
    } else {
      router.back();
    }
  };

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
        {/* Image gallery */}
        {hasImages && (
          <div className="relative w-full aspect-video bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentImageIdx].image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIdx((i) => (i > 0 ? i - 1 : images.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/30 text-white rounded-full"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentImageIdx((i) => (i < images.length - 1 ? i + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/30 text-white rounded-full"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIdx(i)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        i === currentImageIdx ? 'bg-white w-4' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
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
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: `Check out this post on YuhPlace: ${post.title}`,
                    url: shareUrl,
                  });
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
            <FavoriteButton targetType="discover_post" targetId={post.id} />
            {!isOwner && (
              <button
                onClick={() => setShowReport(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface text-muted rounded-lg text-sm font-medium border border-border hover:text-danger hover:border-danger transition-colors"
              >
                <Flag size={16} />
                Report
              </button>
            )}
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="border-t border-border pt-4 mb-4 flex items-center gap-4">
              <Link
                href={`/discover/${post.id}/edit`}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
              >
                <Pencil size={14} />
                Edit post
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-danger hover:text-danger/80 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}

          {/* Author card */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted uppercase tracking-wide mb-3 font-medium">
              Posted by
            </p>
            <div className="flex items-center gap-3">
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
                    <BadgeCheck size={16} className="text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted">
                  Member since {memberSince(post.profiles.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Comments */}
        <div className="p-4">
          <CommentSection targetType="discover_post" targetId={post.id} />
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5">
            <h3 className="text-base font-semibold text-foreground mb-2">Delete Post?</h3>
            <p className="text-sm text-muted mb-4">
              This will permanently remove your post from Discover. This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-danger mb-3 bg-danger-light p-2 rounded-lg">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-surface text-foreground text-sm font-medium rounded-xl border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-danger text-white text-sm font-medium rounded-xl"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <ReportModal
          targetType="discover_post"
          targetId={post.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
