'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

type NotificationType =
  | 'comment_on_post'
  | 'comment_on_market'
  | 'comment_on_property'
  | 'content_removed'
  | 'content_restored';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  target_type: string | null;
  target_id: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; iconClass: string }> = {
  comment_on_post: { icon: MessageSquare, iconClass: 'text-primary bg-primary-light' },
  comment_on_market: { icon: MessageSquare, iconClass: 'text-success bg-success-light' },
  comment_on_property: { icon: MessageSquare, iconClass: 'text-primary bg-primary-light' },
  content_removed: { icon: ShieldAlert, iconClass: 'text-danger bg-danger-light' },
  content_restored: { icon: ShieldCheck, iconClass: 'text-success-dark bg-success-light' },
};

function getTargetLink(targetType: string | null, targetId: string | null): string | null {
  if (!targetType || !targetId) return null;
  switch (targetType) {
    case 'discover_post': return `/discover/${targetId}`;
    case 'market_listing': return `/market/${targetId}`;
    case 'property_listing': return `/property/${targetId}`;
    default: return null;
  }
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, target_type, target_id, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function markAllRead() {
    const supabase = createClient();
    await supabase.rpc('mark_all_notifications_read');
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.rpc('mark_notification_read', { p_notification_id: id });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  }

  if (!authLoading && !user) {
    return (
      <div className="px-4 py-16 text-center">
        <Bell size={32} className="text-border mx-auto mb-3" />
        <p className="text-sm text-muted mb-4">Log in to see your notifications</p>
        <Link href="/login?redirect=%2Fnotifications" className="text-sm text-primary font-semibold hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-muted">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-border/50 rounded-xl p-4 shadow-card">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-border/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border/60 rounded w-3/4" />
                  <div className="h-3 bg-border/60 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={40} className="text-border mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No notifications yet</p>
          <p className="text-xs text-muted">
            You&apos;ll get notified when someone comments on your posts or listings
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.comment_on_post;
            const Icon = config.icon;
            const link = getTargetLink(notif.target_type, notif.target_id);

            const content = (
              <div
                className={cn(
                  'flex gap-3 p-3 rounded-xl border shadow-soft transition-all duration-200',
                  notif.is_read
                    ? 'bg-white border-border/50'
                    : 'bg-primary-light/30 border-primary/20',
                )}
              >
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', config.iconClass)}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm leading-snug', notif.is_read ? 'text-foreground' : 'text-foreground font-semibold')}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{notif.body}</p>
                  <p className="text-[11px] text-muted/60 mt-1">{timeAgo(notif.created_at)}</p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            );

            if (link) {
              return (
                <Link
                  key={notif.id}
                  href={link}
                  onClick={() => { if (!notif.is_read) markRead(notif.id); }}
                  className="block"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={notif.id}
                onClick={() => { if (!notif.is_read) markRead(notif.id); }}
                className="cursor-pointer"
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
