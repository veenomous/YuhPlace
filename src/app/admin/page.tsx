'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  ShoppingBag,
  Flag,
  Compass,
  Home,
  ArrowRight,
  Eye,
  XCircle,
  Gavel,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { ReportStatus, ReportTargetType, ReportReason } from '@/types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTargetUrl(targetType: ReportTargetType, targetId: string): string {
  switch (targetType) {
    case 'discover_post': return `/discover/${targetId}`;
    case 'market_listing': return `/market/${targetId}`;
    case 'property_listing': return `/property/${targetId}`;
    default: return '#';
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminStats {
  total_users: number;
  total_market: number;
  total_property: number;
  total_discover: number;
  open_reports: number;
  total_reports: number;
}

interface AdminReport {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  notes: string | null;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reporter_name: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-yellow-100 text-yellow-800' },
  reviewed: { label: 'Reviewed', className: 'bg-blue-100 text-blue-800' },
  action_taken: { label: 'Action Taken', className: 'bg-green-100 text-green-800' },
  dismissed: { label: 'Dismissed', className: 'bg-gray-100 text-gray-600' },
};

const TARGET_TYPE_CONFIG: Record<ReportTargetType, { label: string; className: string }> = {
  discover_post: { label: 'Discover Post', className: 'bg-purple-100 text-purple-700' },
  market_listing: { label: 'Market Listing', className: 'bg-primary-light text-primary-dark' },
  property_listing: { label: 'Property', className: 'bg-teal-100 text-teal-700' },
  user: { label: 'User', className: 'bg-orange-100 text-orange-700' },
};

const REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  scam_fraud: 'Scam / Fraud',
  inappropriate: 'Inappropriate',
  wrong_category: 'Wrong Category',
  duplicate: 'Duplicate',
  misleading: 'Misleading',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [statsRes, reportsRes] = await Promise.all([
      supabase.rpc('get_admin_stats'),
      supabase.rpc('get_admin_reports'),
    ]);
    if (statsRes.data) setStats(statsRes.data as AdminStats);
    if (reportsRes.data) setReports((reportsRes.data as AdminReport[]).slice(0, 5));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDismiss(reportId: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_dismiss_report', { p_report_id: reportId });
    if (!error) {
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: 'dismissed' as ReportStatus } : r));
      setStats((prev) => prev ? { ...prev, open_reports: Math.max(0, prev.open_reports - 1) } : prev);
    }
  }

  async function handleTakeAction(reportId: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_action_report', { p_report_id: reportId });
    if (!error) {
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: 'action_taken' as ReportStatus } : r));
      setStats((prev) => prev ? { ...prev, open_reports: Math.max(0, prev.open_reports - 1) } : prev);
    }
  }

  async function handleReopen(reportId: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_reopen_report', { p_report_id: reportId });
    if (!error) {
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: 'open' as ReportStatus } : r));
      setStats((prev) => prev ? { ...prev, open_reports: prev.open_reports + 1 } : prev);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Market Listings', value: stats?.total_market ?? 0, icon: ShoppingBag, color: 'text-primary-dark', bg: 'bg-primary-light' },
    { label: 'Open Reports', value: stats?.open_reports ?? 0, icon: Flag, color: 'text-danger', bg: 'bg-danger-light' },
    { label: 'Discover Posts', value: stats?.total_discover ?? 0, icon: Compass, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Property Listings', value: stats?.total_property ?? 0, icon: Home, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Total Reports', value: stats?.total_reports ?? 0, icon: Flag, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Overview of YuhPlace platform activity
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-border rounded-xl p-5 flex items-start gap-4"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                  stat.bg,
                )}
              >
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

      {/* Recent Reports */}
      <div className="bg-white border border-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Recent Reports
          </h2>
          <Link
            href="/admin/reports"
            className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="px-5 py-12 text-center text-muted text-sm">
            No reports yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Reporter
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Target
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Reason
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const statusCfg = STATUS_CONFIG[report.status];
                  const targetCfg = TARGET_TYPE_CONFIG[report.target_type];

                  return (
                    <tr
                      key={report.id}
                      className={cn(
                        'border-b border-border last:border-b-0 transition-colors',
                        report.status === 'open' ? 'bg-yellow-50/30' : 'hover:bg-surface/30',
                      )}
                    >
                      <td className="px-5 py-3 text-muted whitespace-nowrap">
                        {timeAgo(report.created_at)}
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {report.reporter_name}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                            targetCfg.className,
                          )}
                        >
                          {targetCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {REASON_LABELS[report.reason]}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                            statusCfg.className,
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {report.status === 'open' && (
                            <>
                              <button
                                onClick={() => handleDismiss(report.id)}
                                className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors"
                                title="Dismiss"
                              >
                                <XCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleTakeAction(report.id)}
                                className="p-1.5 text-danger hover:text-white hover:bg-danger rounded-lg transition-colors"
                                title="Take Action (remove content)"
                              >
                                <Gavel size={16} />
                              </button>
                            </>
                          )}
                          {(report.status === 'dismissed' || report.status === 'action_taken') && (
                            <button
                              onClick={() => handleReopen(report.id)}
                              className="p-1.5 text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                              title="Reopen report &amp; restore content"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}
                          <Link
                            href={getTargetUrl(report.target_type, report.target_id)}
                            target="_blank"
                            className="p-1.5 text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                            title="View reported content"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/reports"
            className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <Flag size={18} className="text-danger" />
            <div>
              <p className="text-sm font-medium text-foreground">Review Reports</p>
              <p className="text-xs text-muted">{stats?.open_reports ?? 0} open</p>
            </div>
          </Link>
          <Link
            href="/admin/discover"
            className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <Compass size={18} className="text-purple-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Manage Posts</p>
              <p className="text-xs text-muted">{stats?.total_discover ?? 0} posts</p>
            </div>
          </Link>
          <Link
            href="/admin/market"
            className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <ShoppingBag size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Market Listings</p>
              <p className="text-xs text-muted">{stats?.total_market ?? 0} active</p>
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <Users size={18} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Manage Users</p>
              <p className="text-xs text-muted">{stats?.total_users ?? 0} users</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
