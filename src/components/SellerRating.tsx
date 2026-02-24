'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface SellerRatingProps {
  sellerId: string;
  size?: 'small' | 'default';
}

export default function SellerRating({ sellerId, size = 'default' }: SellerRatingProps) {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  const fetchRating = useCallback(async () => {
    const isRealId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sellerId);
    if (!isRealId) return;

    const supabase = createClient();
    const { data } = await supabase.rpc('get_seller_rating', { p_seller_id: sellerId });
    if (data && data.length > 0) {
      setAvgRating(data[0].avg_rating ? Number(data[0].avg_rating) : null);
      setReviewCount(Number(data[0].review_count) || 0);
    }
  }, [sellerId]);

  useEffect(() => { fetchRating(); }, [fetchRating]);

  if (reviewCount === 0) return null;

  const iconSize = size === 'small' ? 12 : 14;

  return (
    <div className={cn('flex items-center gap-1', size === 'small' ? 'text-[11px]' : 'text-xs')}>
      <Star size={iconSize} className="text-amber-400 fill-amber-400" />
      <span className="font-semibold text-foreground">{avgRating}</span>
      <span className="text-muted">({reviewCount})</span>
    </div>
  );
}
