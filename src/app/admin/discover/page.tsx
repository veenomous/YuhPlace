'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  ChevronDown,
  Loader2,
  Filter,
  Flag,
} from 'lucide-react';
import Link from 'next/link';
import { cn, timeAgo } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminDiscoverPost {
  id: string;
  title: string;
  post_type: string;
  status: 'active' | 'hidden' | 'removed';
  created_at: string;
  author_name: string;
  author_id: string;
  region_name: string;
  report_count: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const POST_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  community: { label: 'Community', className: 'bg-blue-50 text-blue-700' },
  event: { label: 'Event', className: 'bg-purple-50 text-purple-700' },
  business: { label: 'Business', className: 'bg-primary-light text-primary-dark' },
  alert: { label: 'Alert', className: 'bg-red-50 text-red-700' },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-800' },
  hidden: { label: 'Hidden', className: 'bg-yellow-100 text-yellow-800' },
  removed: { label: 'Removed', className: 'bg-red-100 text-red-800' },
};

const STATUS_FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'Removed', value: 'removed' },
];

const TYPE_FILTER_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'Community', value: 'community' },
  { label: 'Event', value: 'event' },
  { label: 'Business', value: 'business' },
  { label: 'Alert', value: 'alert' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDiscoverPage() {
  const [posts, setPosts] = useState<AdminDiscoverPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc('get_admin_discover_posts');
    if (data) setPosts(data as AdminDiscoverPost[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    let results = [...posts];
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) => p.title.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') results = results.filter((p) => p.status === statusFilter);
    if (typeFilter !== 'all') results = results.filter((p) => p.post_type === typeFilter);
    return results;
  }, [posts, search, statusFilter, typeFilter]);

  async function handleAction(postId: string, action: 'hide' | 'remove' | 'restore') {
    setActionLoading(postId);
    const supabase = createClient();
    let error;

    if (action === 'hide') {
      ({ error } = await supabase.rpc('admin_hide_content', { p_target_type: 'discover_post', p_target_id: postId }));
    } else if (action === 'remove') {
      ({ error } = await supabase.rpc('admin_remove_content', { p_target_type: 'discover_post', p_target_id: postId }));
    } else {
      ({ error } = await supabase.rpc('admin_restore_content', { p_target_type: 'discover_post', p_target_id: postId }));
    }

    if (!error) {
      const newStatus = action === 'hide' ? 'hidden' : action === 'remove' ? 'removed' : 'active';
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: newStatus as AdminDiscoverPost['status'] } : p)));
    }
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Discover Posts</h1>
        <p className="text-sm text-muted mt-1">Manage community posts across the platform</p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
        <span className="text-muted">{posts.length} total posts</span>
        <span className="text-muted">{posts.filter((p) => p.status === 'active').length} active</span>
        {posts.filter((p) => p.status === 'hidden').length > 0 && (
          <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            {posts.filter((p) => p.status === 'hidden').length} hidden
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted"><Filter size={16} /></div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 bg-white border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
          />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-white border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground cursor-pointer hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            {STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="appearance-none bg-white border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground cursor-pointer hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            {TYPE_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        {(statusFilter !== 'all' || typeFilter !== 'all' || search.trim()) && (
          <button onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearch(''); }} className="text-sm text-primary hover:underline font-medium">Clear filters</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Post</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Author</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Region</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    {posts.length === 0 ? 'No discover posts yet.' : 'No posts match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const typeCfg = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.community;
                  const statusCfg = STATUS_CONFIG[post.status];
                  const isProcessing = actionLoading === post.id;

                  return (
                    <tr key={post.id} className={cn('border-b border-border last:border-b-0 transition-colors', post.status !== 'active' ? 'bg-surface/20' : 'hover:bg-surface/30')}>
                      <td className="px-5 py-3 align-top">
                        <div>
                          <Link href={`/discover/${post.id}`} target="_blank" className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                            {post.title}
                          </Link>
                          <p className="text-xs text-muted mt-0.5">{timeAgo(post.created_at)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', typeCfg.className)}>{typeCfg.label}</span>
                      </td>
                      <td className="px-5 py-3 text-foreground align-top">{post.author_name}</td>
                      <td className="px-5 py-3 text-muted align-top">{post.region_name}</td>
                      <td className="px-5 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.className)}>{statusCfg.label}</span>
                          {post.report_count > 0 && (
                            <span className="flex items-center gap-1 text-xs text-danger">
                              <Flag size={11} />
                              {post.report_count}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {isProcessing ? (
                            <Loader2 size={16} className="animate-spin text-muted" />
                          ) : (
                            <>
                              <Link href={`/discover/${post.id}`} target="_blank" className="p-1.5 text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-colors" title="View post">
                                <Eye size={16} />
                              </Link>
                              {post.status === 'active' && (
                                <>
                                  <button onClick={() => handleAction(post.id, 'hide')} className="p-1.5 text-muted hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Hide post">
                                    <EyeOff size={16} />
                                  </button>
                                  <button onClick={() => handleAction(post.id, 'remove')} className="p-1.5 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors" title="Remove post">
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                              {(post.status === 'hidden' || post.status === 'removed') && (
                                <button onClick={() => handleAction(post.id, 'restore')} className="p-1.5 text-muted hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Restore post">
                                  <RotateCcw size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
