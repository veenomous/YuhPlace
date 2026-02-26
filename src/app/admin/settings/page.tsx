'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Database,
  Server,
  ExternalLink,
  Image,
  Compass,
  ShoppingBag,
  Home,
  Users,
  Flag,
  Loader2,
  Eye,
  MessageSquare,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentStats {
  discover_active: number;
  discover_hidden: number;
  discover_removed: number;
  market_active: number;
  market_hidden: number;
  market_removed: number;
  property_active: number;
  property_hidden: number;
  property_removed: number;
  users_active: number;
  users_suspended: number;
  reports_open: number;
  reports_resolved: number;
  total_comments: number;
  total_reviews: number;
  total_favorites: number;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminSettingsPage() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const supabase = createClient();

    const [
      discoverRes,
      marketRes,
      propertyRes,
      usersActiveRes,
      usersSuspendedRes,
      reportsOpenRes,
      reportsResolvedRes,
      commentsRes,
      reviewsRes,
      favoritesRes,
    ] = await Promise.all([
      supabase.from('discover_posts').select('status', { count: 'exact', head: true }),
      supabase.from('market_listings').select('status', { count: 'exact', head: true }),
      supabase.from('property_listings').select('status', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).neq('status', 'open'),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('favorites').select('*', { count: 'exact', head: true }),
    ]);

    // Get per-status counts for content tables
    const [dActive, dHidden, dRemoved] = await Promise.all([
      supabase.from('discover_posts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('discover_posts').select('*', { count: 'exact', head: true }).eq('status', 'hidden'),
      supabase.from('discover_posts').select('*', { count: 'exact', head: true }).eq('status', 'removed'),
    ]);
    const [mActive, mHidden, mRemoved] = await Promise.all([
      supabase.from('market_listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('market_listings').select('*', { count: 'exact', head: true }).eq('status', 'hidden'),
      supabase.from('market_listings').select('*', { count: 'exact', head: true }).eq('status', 'removed'),
    ]);
    const [pActive, pHidden, pRemoved] = await Promise.all([
      supabase.from('property_listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('property_listings').select('*', { count: 'exact', head: true }).eq('status', 'hidden'),
      supabase.from('property_listings').select('*', { count: 'exact', head: true }).eq('status', 'removed'),
    ]);

    setStats({
      discover_active: dActive.count ?? 0,
      discover_hidden: dHidden.count ?? 0,
      discover_removed: dRemoved.count ?? 0,
      market_active: mActive.count ?? 0,
      market_hidden: mHidden.count ?? 0,
      market_removed: mRemoved.count ?? 0,
      property_active: pActive.count ?? 0,
      property_hidden: pHidden.count ?? 0,
      property_removed: pRemoved.count ?? 0,
      users_active: usersActiveRes.count ?? 0,
      users_suspended: usersSuspendedRes.count ?? 0,
      reports_open: reportsOpenRes.count ?? 0,
      reports_resolved: reportsResolvedRes.count ?? 0,
      total_comments: commentsRes.count ?? 0,
      total_reviews: reviewsRes.count ?? 0,
      total_favorites: favoritesRes.count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted mt-1">
          Platform overview and configuration
        </p>
      </div>

      {/* Platform Overview */}
      <div className="bg-white border border-border rounded-xl mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Platform Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {[
            { label: 'Site URL', value: 'yuhplace.vercel.app', icon: Globe, color: 'text-primary' },
            { label: 'Hosting', value: 'Vercel', icon: Server, color: 'text-blue-600' },
            { label: 'Database', value: 'Supabase', icon: Database, color: 'text-emerald-600' },
            { label: 'Framework', value: 'Next.js 16', icon: Globe, color: 'text-foreground' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="px-5 py-4 flex items-center gap-3">
                <Icon size={18} className={item.color} />
                <div>
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Breakdown */}
      <div className="bg-white border border-border rounded-xl mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Content Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Content Type
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Active
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Hidden
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Removed
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: 'Discover Posts',
                  icon: Compass,
                  color: 'text-purple-600',
                  active: stats?.discover_active ?? 0,
                  hidden: stats?.discover_hidden ?? 0,
                  removed: stats?.discover_removed ?? 0,
                },
                {
                  label: 'Market Listings',
                  icon: ShoppingBag,
                  color: 'text-primary',
                  active: stats?.market_active ?? 0,
                  hidden: stats?.market_hidden ?? 0,
                  removed: stats?.market_removed ?? 0,
                },
                {
                  label: 'Property Listings',
                  icon: Home,
                  color: 'text-teal-600',
                  active: stats?.property_active ?? 0,
                  hidden: stats?.property_hidden ?? 0,
                  removed: stats?.property_removed ?? 0,
                },
              ].map((row) => {
                const Icon = row.icon;
                const total = row.active + row.hidden + row.removed;
                return (
                  <tr key={row.label} className="border-b border-border last:border-b-0 hover:bg-surface/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={row.color} />
                        <span className="font-medium text-foreground">{row.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-green-700 font-medium">{row.active}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-yellow-700 font-medium">{row.hidden}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-red-600 font-medium">{row.removed}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-foreground">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Users', value: stats?.users_active ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Suspended Users', value: stats?.users_suspended ?? 0, icon: Users, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Open Reports', value: stats?.reports_open ?? 0, icon: Flag, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Total Comments', value: stats?.total_comments ?? 0, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Reviews', value: stats?.total_reviews ?? 0, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Favorites', value: stats?.total_favorites ?? 0, icon: Eye, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-border rounded-xl p-5 flex items-start gap-4"
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', stat.bg)}>
                <Icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Limits */}
      <div className="bg-white border border-border rounded-xl mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Content Limits
          </h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[
            { label: 'Max images per discover post', value: '4' },
            { label: 'Max images per market listing', value: '6' },
            { label: 'Max images per property listing', value: '6' },
            { label: 'Image compression max width', value: '1200px' },
            { label: 'Image compression quality', value: 'JPEG 80%' },
            { label: 'Max image file size (after compression)', value: '~600 KB' },
          ].map((limit) => (
            <div
              key={limit.label}
              className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <Image size={14} className="text-muted" />
                <span className="text-sm text-foreground">{limit.label}</span>
              </div>
              <span className="text-sm font-medium text-muted bg-surface px-2.5 py-0.5 rounded">
                {limit.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Quick Links
          </h2>
        </div>
        <div className="px-5 py-4 space-y-2">
          {[
            {
              label: 'Supabase Dashboard',
              description: 'Database, auth, storage, and API management',
              href: 'https://supabase.com/dashboard/project/wskxxngqccrcjsfbrjyu',
            },
            {
              label: 'Vercel Dashboard',
              description: 'Deployments, domains, and analytics',
              href: 'https://vercel.com/veenomous-projects/yuhplace',
            },
            {
              label: 'GitHub Repository',
              description: 'Source code and version history',
              href: 'https://github.com/veenomous/YuhPlace',
            },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-surface transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-muted">{link.description}</p>
              </div>
              <ExternalLink size={16} className="text-muted group-hover:text-primary transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
