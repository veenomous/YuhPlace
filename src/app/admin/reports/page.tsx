'use client';

import { useState, useMemo } from 'react';
import {
  Eye,
  XCircle,
  Gavel,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { Report, ReportStatus, ReportTargetType, ReportReason } from '@/types/database';

// ---------------------------------------------------------------------------
// Mock Data — realistic Guyana-related reports
// ---------------------------------------------------------------------------

const MOCK_REPORTS: Report[] = [
  {
    id: 'rpt-001',
    reporter_user_id: 'u12',
    target_type: 'market_listing',
    target_id: 'ml-042',
    reason: 'scam_fraud',
    notes: 'Seller asking for advance payment via wire transfer before showing item. Price too low for a brand new generator.',
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
    notes: 'Same promotional post copied 5 times in the Georgetown feed with affiliate links to external site.',
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
    notes: 'Photos are from a completely different property. I visited the location on Vlissengen Road and it looks nothing like the listing.',
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
    notes: 'User sending harassing WhatsApp messages to multiple sellers after getting their numbers from listings.',
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
    notes: 'Toyota Hilux listed under Buy & Sell instead of Vehicles category.',
    status: 'dismissed',
    reviewed_by_admin_id: 'admin-01',
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'rpt-006',
    reporter_user_id: 'u22',
    target_type: 'discover_post',
    target_id: 'dp-091',
    reason: 'inappropriate',
    notes: 'Post contains offensive language and personal attacks directed at a local business owner in Berbice.',
    status: 'open',
    reviewed_by_admin_id: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'rpt-007',
    reporter_user_id: 'u14',
    target_type: 'property_listing',
    target_id: 'pl-051',
    reason: 'duplicate',
    notes: 'This is the exact same property already listed as pl-033. Same photos, same description, different price.',
    status: 'open',
    reviewed_by_admin_id: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: 'rpt-008',
    reporter_user_id: 'u41',
    target_type: 'market_listing',
    target_id: 'ml-112',
    reason: 'scam_fraud',
    notes: 'Listing for iPhone 15 Pro at $50,000 GYD is clearly a scam. User has no prior activity and demands payment before meetup.',
    status: 'reviewed',
    reviewed_by_admin_id: 'admin-01',
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: 'rpt-009',
    reporter_user_id: 'u03',
    target_type: 'user',
    target_id: 'u67',
    reason: 'spam',
    notes: 'User is posting the same MLM recruitment message across every Discover feed in every region.',
    status: 'action_taken',
    reviewed_by_admin_id: 'admin-01',
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'rpt-010',
    reporter_user_id: 'u26',
    target_type: 'market_listing',
    target_id: 'ml-076',
    reason: 'misleading',
    notes: 'Listing says "brand new" but item is clearly used. Photos show scratches and wear marks on the laptop.',
    status: 'dismissed',
    reviewed_by_admin_id: 'admin-01',
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

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

const REASON_CONFIG: Record<ReportReason, { label: string; className: string }> = {
  spam: { label: 'Spam', className: 'bg-gray-100 text-gray-700' },
  scam_fraud: { label: 'Scam / Fraud', className: 'bg-red-50 text-red-700' },
  inappropriate: { label: 'Inappropriate', className: 'bg-orange-50 text-orange-700' },
  wrong_category: { label: 'Wrong Category', className: 'bg-blue-50 text-blue-700' },
  duplicate: { label: 'Duplicate', className: 'bg-indigo-50 text-indigo-700' },
  misleading: { label: 'Misleading', className: 'bg-amber-50 text-amber-700' },
};

const STATUS_FILTER_OPTIONS: { label: string; value: ReportStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Action Taken', value: 'action_taken' },
  { label: 'Dismissed', value: 'dismissed' },
];

const TARGET_FILTER_OPTIONS: { label: string; value: ReportTargetType | 'all' }[] = [
  { label: 'All Types', value: 'all' },
  { label: 'Discover Posts', value: 'discover_post' },
  { label: 'Market Listings', value: 'market_listing' },
  { label: 'Property Listings', value: 'property_listing' },
  { label: 'Users', value: 'user' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [targetFilter, setTargetFilter] = useState<ReportTargetType | 'all'>('all');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    let results = [...reports];

    if (statusFilter !== 'all') {
      results = results.filter((r) => r.status === statusFilter);
    }

    if (targetFilter !== 'all') {
      results = results.filter((r) => r.target_type === targetFilter);
    }

    // Sort by date descending (newest first)
    results.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return results;
  }, [reports, statusFilter, targetFilter]);

  function handleDismiss(reportId: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'dismissed' as ReportStatus,
              reviewed_by_admin_id: 'admin-01',
              reviewed_at: new Date().toISOString(),
            }
          : r,
      ),
    );
  }

  function handleTakeAction(reportId: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'action_taken' as ReportStatus,
              reviewed_by_admin_id: 'admin-01',
              reviewed_at: new Date().toISOString(),
            }
          : r,
      ),
    );
  }

  function handleMarkReviewed(reportId: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'reviewed' as ReportStatus,
              reviewed_by_admin_id: 'admin-01',
              reviewed_at: new Date().toISOString(),
            }
          : r,
      ),
    );
  }

  function truncateId(id: string): string {
    return id.length > 10 ? id.slice(0, 10) + '...' : id;
  }

  const openCount = reports.filter((r) => r.status === 'open').length;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted mt-1">
          Review and moderate user reports across the platform
        </p>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-4 mb-6 text-sm">
        <span className="text-muted">
          {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
        </span>
        {openCount > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            {openCount} open
          </span>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
            className="appearance-none bg-white border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground cursor-pointer hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
        </div>

        {/* Target Type Filter */}
        <div className="relative">
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value as ReportTargetType | 'all')}
            className="appearance-none bg-white border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground cursor-pointer hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {TARGET_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
        </div>

        {/* Clear Filters */}
        {(statusFilter !== 'all' || targetFilter !== 'all') && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setTargetFilter('all');
            }}
            className="text-sm text-primary hover:underline font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Target Type
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Target ID
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Reason
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  Reporter
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
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    No reports match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const statusCfg = STATUS_CONFIG[report.status];
                  const targetCfg = TARGET_TYPE_CONFIG[report.target_type];
                  const reasonCfg = REASON_CONFIG[report.reason];
                  const isExpanded = expandedReportId === report.id;

                  return (
                    <tr
                      key={report.id}
                      className={cn(
                        'border-b border-border last:border-b-0 transition-colors',
                        report.status === 'open'
                          ? 'bg-yellow-50/30'
                          : 'hover:bg-surface/30',
                      )}
                    >
                      <td className="px-5 py-3 text-muted whitespace-nowrap align-top">
                        <div className="flex flex-col">
                          <span>{timeAgo(report.created_at)}</span>
                          <span className="text-[11px] text-muted/60">
                            {new Date(report.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                            targetCfg.className,
                          )}
                        >
                          {targetCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <code className="text-xs font-mono text-muted bg-surface px-1.5 py-0.5 rounded">
                          {truncateId(report.target_id)}
                        </code>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                            reasonCfg.className,
                          )}
                        >
                          {reasonCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <code className="text-xs font-mono text-muted bg-surface px-1.5 py-0.5 rounded">
                          {report.reporter_user_id}
                        </code>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                            statusCfg.className,
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View / Expand Notes */}
                          <button
                            onClick={() =>
                              setExpandedReportId(isExpanded ? null : report.id)
                            }
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              isExpanded
                                ? 'bg-primary-light text-primary-dark'
                                : 'text-muted hover:text-primary hover:bg-primary-light',
                            )}
                            title="View Notes"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Actions for open/reviewed reports */}
                          {(report.status === 'open' || report.status === 'reviewed') && (
                            <>
                              {report.status === 'open' && (
                                <button
                                  onClick={() => handleMarkReviewed(report.id)}
                                  className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Mark as Reviewed"
                                >
                                  Review
                                </button>
                              )}
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
                        </div>

                        {/* Expanded Notes */}
                        {isExpanded && report.notes && (
                          <div className="mt-2 p-3 bg-surface rounded-lg text-xs text-foreground leading-relaxed border border-border">
                            <p className="font-semibold text-muted mb-1 uppercase tracking-wide text-[10px]">
                              Reporter Notes
                            </p>
                            {report.notes}
                            {report.reviewed_at && (
                              <p className="mt-2 text-[11px] text-muted">
                                Reviewed {timeAgo(report.reviewed_at)} by{' '}
                                <span className="font-medium">{report.reviewed_by_admin_id}</span>
                              </p>
                            )}
                          </div>
                        )}
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
