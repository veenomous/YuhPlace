'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Trash2, Loader2, BadgeCheck } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { CommentWithProfile } from '@/types/database';

type TargetType = 'discover_post' | 'market_listing' | 'property_listing';

export default function CommentSection({
  targetType,
  targetId,
}: {
  targetType: TargetType;
  targetId: string;
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Don't load comments for demo posts
  const isRealPost = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

  const fetchComments = useCallback(async () => {
    if (!isRealPost) { setLoading(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(id, name, avatar_url, is_verified_business)')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });
    setComments((data ?? []) as unknown as CommentWithProfile[]);
    setLoading(false);
  }, [targetType, targetId, isRealPost]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function handlePost() {
    if (!text.trim() || posting) return;
    setPosting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('add_comment', {
      p_target_type: targetType,
      p_target_id: targetId,
      p_content: text.trim(),
    });
    setPosting(false);
    if (!error) {
      setText('');
      fetchComments();
    }
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId);
    const supabase = createClient();
    const { error } = await supabase.rpc('delete_comment', { p_comment_id: commentId });
    setDeletingId(null);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }

  if (!isRealPost) return null;

  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} className="text-muted" />
        <h3 className="text-sm font-semibold text-foreground">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={18} className="animate-spin text-muted" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => {
            const isOwner = user && comment.user_id === user.id;
            const initials = comment.profiles.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div key={comment.id} className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary-dark">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-semibold text-foreground">{comment.profiles.name}</span>
                    {comment.profiles.is_verified_business && (
                      <BadgeCheck size={12} className="text-amber-500 flex-shrink-0" />
                    )}
                    <span className="text-[10px] text-muted">{timeAgo(comment.created_at)}</span>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="ml-auto text-muted hover:text-danger transition-colors"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comment input */}
      {user ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePost()}
            placeholder="Write a comment..."
            maxLength={1000}
            className="flex-1 px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            onClick={handlePost}
            disabled={!text.trim() || posting}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl transition-all',
              text.trim() && !posting
                ? 'bg-primary text-white'
                : 'bg-surface text-muted',
            )}
          >
            {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted text-center py-2">
          Sign in to leave a comment
        </p>
      )}
    </div>
  );
}
