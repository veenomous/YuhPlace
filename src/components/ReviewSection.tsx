'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, BadgeCheck, Loader2 } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

type TargetType = 'discover_post' | 'market_listing' | 'property_listing';

interface Review {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_verified: boolean;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ReviewSectionProps {
  sellerId: string;
  targetType: TargetType;
  targetId: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            'transition-colors',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
          )}
        >
          <Star
            size={size}
            className={cn(
              star <= value ? 'text-amber-400 fill-amber-400' : 'text-border',
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ sellerId, targetType, targetId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isRealId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
  const isOwner = user?.id === sellerId;
  const hasReviewed = reviews.some((r) => r.reviewer_id === user?.id);

  const fetchReviews = useCallback(async () => {
    if (!isRealId) { setLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase.rpc('get_seller_reviews', { p_seller_id: sellerId });
    if (data) setReviews(data as Review[]);
    setLoading(false);
  }, [sellerId, isRealId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    setSubmitting(true);
    setError('');

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc('submit_review', {
      p_seller_id: sellerId,
      p_target_type: targetType,
      p_target_id: targetId,
      p_rating: rating,
      p_comment: comment.trim() || null,
    });

    if (rpcError) {
      setError(rpcError.message);
    } else {
      setShowForm(false);
      setRating(0);
      setComment('');
      fetchReviews();
    }
    setSubmitting(false);
  }

  if (!isRealId) return null;

  // Filter reviews for this specific listing
  const listingReviews = reviews.filter(
    (r) => r.reviewer_id !== undefined,
  );

  const avgRating = listingReviews.length > 0
    ? (listingReviews.reduce((sum, r) => sum + r.rating, 0) / listingReviews.length).toFixed(1)
    : null;

  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Reviews</h3>
          {avgRating && (
            <div className="flex items-center gap-1 text-xs">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold">{avgRating}</span>
              <span className="text-muted">({listingReviews.length})</span>
            </div>
          )}
        </div>
        {user && !isOwner && !hasReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-primary font-semibold hover:underline"
          >
            Write a review
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-3 mb-4 space-y-3">
          <div>
            <label className="text-xs text-muted font-medium block mb-1">Your rating</label>
            <StarRating value={rating} onChange={setRating} size={22} />
          </div>
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={3}
              className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setRating(0); setComment(''); setError(''); }}
              className="flex-1 px-3 py-2 bg-white text-foreground text-sm font-medium rounded-lg border border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-border/60" />
                <div className="h-3 w-20 bg-border/60 rounded" />
              </div>
              <div className="h-3 w-full bg-border/60 rounded" />
            </div>
          ))}
        </div>
      ) : listingReviews.length === 0 && !showForm ? (
        <p className="text-xs text-muted py-2">No reviews yet</p>
      ) : (
        <div className="space-y-3">
          {listingReviews.map((review) => (
            <div key={review.id} className="py-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary-dark">
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {review.reviewer_name}
                </span>
                {review.reviewer_verified && (
                  <BadgeCheck size={13} className="text-accent" />
                )}
                <StarRating value={review.rating} readonly size={12} />
              </div>
              {review.comment && (
                <p className="text-xs text-muted leading-relaxed ml-8">
                  {review.comment}
                </p>
              )}
              <p className="text-[10px] text-muted/60 ml-8 mt-1">
                {timeAgo(review.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
