'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useViewCount(targetTable: string, targetId: string | undefined) {
  useEffect(() => {
    if (!targetId) return;
    const key = `viewed_${targetTable}_${targetId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    const supabase = createClient();
    supabase.rpc('increment_view_count', {
      target_table: targetTable,
      target_id: targetId,
    });
  }, [targetTable, targetId]);
}
