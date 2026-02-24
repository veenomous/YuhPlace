'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

type TargetType = 'discover_post' | 'market_listing' | 'property_listing';

export default function FavoriteButton({
  targetType,
  targetId,
  size = 'default',
}: {
  targetType: TargetType;
  targetId: string;
  size?: 'default' | 'small';
}) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Don't check favorites for demo posts
  const isRealPost = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

  const checkFavorite = useCallback(async () => {
    if (!user || !isRealPost) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .maybeSingle();
    setIsFavorited(!!data);
  }, [user, targetType, targetId, isRealPost]);

  useEffect(() => { checkFavorite(); }, [checkFavorite]);

  async function handleToggle() {
    if (!user || !isRealPost || loading) return;
    setLoading(true);
    const supabase = createClient();
    const { data: newState, error } = await supabase.rpc('toggle_favorite', {
      p_target_type: targetType,
      p_target_id: targetId,
    });
    if (!error) {
      setIsFavorited(newState as boolean);
    }
    setLoading(false);
  }

  if (!user || !isRealPost) return null;

  const iconSize = size === 'small' ? 14 : 18;

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggle(); }}
      disabled={loading}
      className={cn(
        'flex items-center justify-center rounded-full transition-all',
        size === 'small' ? 'w-8 h-8' : 'w-10 h-10',
        isFavorited
          ? 'text-red-500 bg-red-50 hover:bg-red-100'
          : 'text-muted bg-surface hover:text-red-400 hover:bg-red-50',
      )}
      title={isFavorited ? 'Remove from saved' : 'Save'}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <Heart size={iconSize} className={isFavorited ? 'fill-red-500' : ''} />
      )}
    </button>
  );
}
