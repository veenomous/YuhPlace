'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  ShoppingBag,
  Flag,
  Compass,
  Home,
  Star,
  ArrowRight,
  Eye,
  XCircle,
  Gavel,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { Report, ReportStatus, ReportTargetType, ReportReason } from '@/types/database';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const STATS = [
  { label: 'Total Users', value: 247, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Listings', value: 312, icon: ShoppingBag, color: 'text-primary-dark', bg: 'bg-primary-light' },
  { label: 'Open Reports', value: 8, icon: Flag, color: 'text-danger', bg: 'bg-danger-light' },
  { label: 'Discover Posts', value: 156, icon: Compass, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Property Listings', value: 64, icon: Home, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Featured Listings', value: 12, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const RECENT_REPORTS: Report[] = [
  {
    id: 'rpt-001',
    reporter_user_id: 'u12',
    target_type: 'market_listing',
    target_id: 'ml-042',
    reason: 'scam_fraud',
    notes: 'Seller asking for advance payment via wire transfer, suspicious pricing.',
    status: 'open',
    reviewed_by_admin_id: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'rpt-002',
    reporter_user_id: 'u08',
    target_type: 'discover_post',
    target_id: 'dp-118',
    reason: 'spam',
    notes: 'Same post copied 5 times with affiliate links.',
    status: 'open',
    reviewed_by_admin_id: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'rpt-003',
    reporter_user_id: 'u19',
    target_type: 'property_listing',
    target_id: 'pl-029',
    reason: 'misleading',
    notes: 'Photos are from a different property. I visited and it looks nothing like the listing.',
    status: 'reviewed',
    reviewed_by_admin_id: 'admin-01',
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'rpt-004',
    reporter_user_id: 'u31',
    target_type: 'user',
    target_id: 'u55',
    reason: 'inappropriate',
    notes: 'User sending harassing messages to multiple sellers.',
    status: 'action_taken',
    reviewed_by_admin_id: 'admin-01',
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'rpt-005',
    reporter_user_id: 'u07',
    target_type: 'market_listing',
    target_id: 'ml-088',
    reason: 'wrong_category',
    notes: 'Vehicle listed under Buy & Sell instead of Vehicles category.',
    status: 'dismissed',
    reviewed_by_admin_id: 'admin-01',
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Helpers
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
  const [reports, setReports] = useState<Report[]>(RECENT_REPORTS);

  function handleDismiss(reportId: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: 'dismissed' as ReportStatus, reviewed_by_admin_id: 'admin-01', reviewed_at: new Date().toISOString() }
          : r,
      ),
    );
  }

  function handleTakeAction(reportId: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: 'action_taken' as ReportStatus, reviewed_by_admin_id: 'admin-01', reviewed_at: new Date().toISOString() }
          : r,
      ),
    );
  }

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
        {STATS.map((stat) => {
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Date
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
                    className="border-b border-border last:border-b-0 hover:bg-surface/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-muted whitespace-nowrap">
                      {timeAgo(report.created_at)}
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
                              title="Take Action"
                            >
                              <Gavel size={16} />
                            </button>
                          </>
                        )}
                        <Link
                          href="/admin/reports"
                          className="p-1.5 text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                          title="View Details"
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
              <p className="text-xs text-muted">8 open</p>
            </div>
          </Link>
          <Link
            href="/admin/discover"
            className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <Compass size={18} className="text-purple-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Manage Posts</p>
              <p className="text-xs text-muted">156 posts</p>
            </div>
          </Link>
          <Link
            href="/admin/market"
            className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <ShoppingBag size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Market Listings</p>
              <p className="text-xs text-muted">312 active</p>
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <Users size={18} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Manage Users</p>
              <p className="text-xs text-muted">247 users</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
