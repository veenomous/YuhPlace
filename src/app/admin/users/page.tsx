'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  BadgeCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  ChevronDown,
  Loader2,
  Filter,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminUser {
  id: string;
  name: string;
  phone: string | null;
  account_type: 'individual' | 'business' | 'agent_landlord';
  avatar_url: string | null;
  is_verified_business: boolean;
  status: 'active' | 'suspended';
  is_admin: boolean;
  created_at: string;
  region_name: string | null;
  post_count: number;
  market_count: number;
  property_count: number;
  reports_filed: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ACCOUNT_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  individual: { label: 'Individual', className: 'bg-blue-50 text-blue-700' },
  business: { label: 'Business', className: 'bg-purple-50 text-purple-700' },
  agent_landlord: { label: 'Agent / Landlord', className: 'bg-teal-50 text-teal-700' },
};

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Verified', value: 'verified' },
];

const TYPE_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Types', value: 'all' },
  { label: 'Individual', value: 'individual' },
  { label: 'Business', value: 'business' },
  { label: 'Agent / Landlord', value: 'agent_landlord' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc('get_admin_users');
    if (data) setUsers(data as AdminUser[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    let results = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (u) => u.name.toLowerCase().includes(q) || (u.phone && u.phone.includes(q)),
      );
    }

    if (statusFilter === 'active') results = results.filter((u) => u.status === 'active');
    else if (statusFilter === 'suspended') results = results.filter((u) => u.status === 'suspended');
    else if (statusFilter === 'verified') results = results.filter((u) => u.is_verified_business);

    if (typeFilter !== 'all') results = results.filter((u) => u.account_type === typeFilter);

    return results;
  }, [users, search, statusFilter, typeFilter]);

  async function handleToggleVerified(userId: string) {
    setActionLoading(userId);
    const supabase = createClient();
    const { data: newVal, error } = await supabase.rpc('admin_toggle_verified', { p_user_id: userId });
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified_business: newVal as boolean } : u)),
      );
    }
    setActionLoading(null);
  }

  async function handleSuspend(userId: string) {
    setActionLoading(userId);
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_suspend_user', { p_user_id: userId });
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' as const } : u)),
      );
    }
    setActionLoading(null);
  }

  async function handleUnsuspend(userId: string) {
    setActionLoading(userId);
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_unsuspend_user', { p_user_id: userId });
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'active' as const } : u)),
      );
    }
    setActionLoading(null);
  }

  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const verifiedCount = users.filter((u) => u.is_verified_business).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted mt-1">
          Manage user accounts, verification, and suspensions
        </p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
        <span className="text-muted">{users.length} total users</span>
        {verifiedCount > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
            <BadgeCheck size={12} />
            {verifiedCount} verified
          </span>
        )}
        {suspendedCount > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
            <ShieldAlert size={12} />
            {suspendedCount} suspended
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Filter size={16} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 bg-white border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground cursor-pointer hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none bg-white border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground cursor-pointer hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {(statusFilter !== 'all' || typeFilter !== 'all' || search.trim()) && (
          <button
            onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearch(''); }}
            className="text-sm text-primary hover:underline font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Region</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Content</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    {users.length === 0 ? 'No users yet.' : 'No users match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const typeCfg = ACCOUNT_TYPE_LABELS[user.account_type] || ACCOUNT_TYPE_LABELS.individual;
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  const totalContent = user.post_count + user.market_count + user.property_count;
                  const isProcessing = actionLoading === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        'border-b border-border last:border-b-0 transition-colors',
                        user.status === 'suspended' ? 'bg-red-50/30' : 'hover:bg-surface/30',
                      )}
                    >
                      {/* User */}
                      <td className="px-5 py-3 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-dark">{initials}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground">{user.name}</span>
                              {user.is_verified_business && (
                                <BadgeCheck size={14} className="text-amber-500 flex-shrink-0" />
                              )}
                              {user.is_admin && (
                                <span className="text-[10px] font-bold text-primary bg-primary-light px-1.5 py-0.5 rounded">ADMIN</span>
                              )}
                            </div>
                            <p className="text-xs text-muted mt-0.5">
                              Joined {timeAgo(user.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3 align-top">
                        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', typeCfg.className)}>
                          {typeCfg.label}
                        </span>
                      </td>

                      {/* Region */}
                      <td className="px-5 py-3 text-muted align-top">
                        {user.region_name || '—'}
                      </td>

                      {/* Content */}
                      <td className="px-5 py-3 align-top">
                        <div className="text-xs text-muted space-y-0.5">
                          <p>{user.post_count} posts</p>
                          <p>{user.market_count} market</p>
                          <p>{user.property_count} property</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 align-top">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800',
                          )}
                        >
                          {user.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {isProcessing ? (
                            <Loader2 size={16} className="animate-spin text-muted" />
                          ) : (
                            <>
                              {/* Toggle verified */}
                              {!user.is_admin && (
                                <button
                                  onClick={() => handleToggleVerified(user.id)}
                                  className={cn(
                                    'p-1.5 rounded-lg transition-colors',
                                    user.is_verified_business
                                      ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                                      : 'text-muted hover:text-amber-500 hover:bg-amber-50',
                                  )}
                                  title={user.is_verified_business ? 'Remove verified badge' : 'Grant verified badge'}
                                >
                                  <BadgeCheck size={16} />
                                </button>
                              )}

                              {/* Suspend / Unsuspend */}
                              {!user.is_admin && user.status === 'active' && (
                                <button
                                  onClick={() => handleSuspend(user.id)}
                                  className="p-1.5 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
                                  title="Suspend user"
                                >
                                  <UserX size={16} />
                                </button>
                              )}
                              {!user.is_admin && user.status === 'suspended' && (
                                <button
                                  onClick={() => handleUnsuspend(user.id)}
                                  className="p-1.5 text-muted hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Unsuspend user"
                                >
                                  <UserCheck size={16} />
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
