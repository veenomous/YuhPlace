'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Eye,
  XCircle,
  Gavel,
  Filter,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { ReportStatus, ReportTargetType, ReportReason } from '@/types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [targetFilter, setTargetFilter] = useState<ReportTargetType | 'all'>('all');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc('get_admin_reports');
    if (data) setReports(data as AdminReport[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const filteredReports = useMemo(() => {
    let results = [...reports];
    if (statusFilter !== 'all') {
      results = results.filter((r) => r.status === statusFilter);
    }
    if (targetFilter !== 'all') {
      results = results.filter((r) => r.target_type === targetFilter);
    }
    return results;
  }, [reports, statusFilter, targetFilter]);

  async function handleDismiss(reportId: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_dismiss_report', { p_report_id: reportId });
    if (!error) {
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: 'dismissed' as ReportStatus, reviewed_at: new Date().toISOString() } : r));
    }
  }

  async function handleTakeAction(reportId: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_action_report', { p_report_id: reportId });
    if (!error) {
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: 'action_taken' as ReportStatus, reviewed_at: new Date().toISOString() } : r));
    }
  }

  function truncateId(id: string): string {
    return id.length > 10 ? id.slice(0, 10) + '...' : id;
  }

  const openCount = reports.filter((r) => r.status === 'open').length;

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
                  Reporter
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
                    {reports.length === 0 ? 'No reports yet.' : 'No reports match the selected filters.'}
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
                      <td className="px-5 py-3 text-foreground align-top">
                        {report.reporter_name}
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
                                Reviewed {timeAgo(report.reviewed_at)}
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
