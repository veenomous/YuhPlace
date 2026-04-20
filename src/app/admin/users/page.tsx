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
  ShieldCheck,
  X,
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
  is_verified_partner: boolean;
  partner_name: string | null;
  partner_logo_url: string | null;
  partner_slug: string | null;
  partner_tagline: string | null;
  partner_bio: string | null;
  partner_banner_url: string | null;
  status: 'active' | 'suspended';
  is_admin: boolean;
  created_at: string;
  region_name: string | null;
  post_count: number;
  market_count: number;
  property_count: number;
  reports_filed: number;
}

type PartnerUpdate = {
  is_verified_partner: boolean;
  partner_name: string | null;
  partner_logo_url: string | null;
  partner_slug: string | null;
  partner_tagline: string | null;
  partner_bio: string | null;
  partner_banner_url: string | null;
};

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
  { label: 'Partners', value: 'partners' },
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
  const [partnerEditUser, setPartnerEditUser] = useState<AdminUser | null>(null);

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
    else if (statusFilter === 'partners') results = results.filter((u) => u.is_verified_partner);

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

  async function handleSetPartner(
    userId: string,
    payload: {
      isPartner: boolean;
      partnerName: string | null;
      partnerLogoUrl: string | null;
      partnerSlug: string | null;
      partnerTagline: string | null;
      partnerBio: string | null;
      partnerBannerUrl: string | null;
    },
  ) {
    setActionLoading(userId);
    const supabase = createClient();
    const { data, error } = await supabase.rpc('admin_set_partner', {
      p_user_id: userId,
      p_is_partner: payload.isPartner,
      p_partner_name: payload.partnerName,
      p_partner_logo_url: payload.partnerLogoUrl,
      p_partner_slug: payload.partnerSlug,
      p_partner_tagline: payload.partnerTagline,
      p_partner_bio: payload.partnerBio,
      p_partner_banner_url: payload.partnerBannerUrl,
    });
    if (!error && data) {
      const updated = data as PartnerUpdate;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)),
      );
    }
    setActionLoading(null);
  }

  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const verifiedCount = users.filter((u) => u.is_verified_business).length;
  const partnerCount = users.filter((u) => u.is_verified_partner).length;

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
        {partnerCount > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <ShieldCheck size={12} />
            {partnerCount} partner{partnerCount === 1 ? '' : 's'}
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

      {/* Partner edit modal */}
      {partnerEditUser && (
        <PartnerEditModal
          user={partnerEditUser}
          saving={actionLoading === partnerEditUser.id}
          onClose={() => setPartnerEditUser(null)}
          onSave={async (payload) => {
            await handleSetPartner(partnerEditUser.id, payload);
            setPartnerEditUser(null);
          }}
        />
      )}

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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-foreground">{user.name}</span>
                              {user.is_verified_business && (
                                <BadgeCheck size={14} className="text-amber-500 flex-shrink-0" />
                              )}
                              {user.is_verified_partner && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                  <ShieldCheck size={10} />
                                  {user.partner_name ? `PARTNER · ${user.partner_name}` : 'PARTNER'}
                                </span>
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

                              {/* Partner */}
                              {!user.is_admin && (
                                <button
                                  onClick={() => setPartnerEditUser(user)}
                                  className={cn(
                                    'p-1.5 rounded-lg transition-colors',
                                    user.is_verified_partner
                                      ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                                      : 'text-muted hover:text-blue-600 hover:bg-blue-50',
                                  )}
                                  title={user.is_verified_partner ? 'Edit partner details' : 'Mark as verified partner'}
                                >
                                  <ShieldCheck size={16} />
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

// ---------------------------------------------------------------------------
// Partner edit modal
// ---------------------------------------------------------------------------

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function PartnerEditModal({
  user,
  saving,
  onClose,
  onSave,
}: {
  user: AdminUser;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: {
    isPartner: boolean;
    partnerName: string | null;
    partnerLogoUrl: string | null;
    partnerSlug: string | null;
    partnerTagline: string | null;
    partnerBio: string | null;
    partnerBannerUrl: string | null;
  }) => Promise<void>;
}) {
  const [isPartner, setIsPartner] = useState(user.is_verified_partner);
  const [partnerName, setPartnerName] = useState(user.partner_name ?? '');
  const [partnerLogoUrl, setPartnerLogoUrl] = useState(user.partner_logo_url ?? '');
  const [partnerSlug, setPartnerSlug] = useState(user.partner_slug ?? '');
  const [partnerTagline, setPartnerTagline] = useState(user.partner_tagline ?? '');
  const [partnerBio, setPartnerBio] = useState(user.partner_bio ?? '');
  const [partnerBannerUrl, setPartnerBannerUrl] = useState(user.partner_banner_url ?? '');
  const [slugTouched, setSlugTouched] = useState(!!user.partner_slug);

  // Auto-derive slug from partner name until user edits slug manually.
  useEffect(() => {
    if (!slugTouched && partnerName.trim()) {
      setPartnerSlug(slugify(partnerName));
    }
  }, [partnerName, slugTouched]);

  const disabled = !isPartner;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-xl my-auto">
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-light">
              <ShieldCheck size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Verified Partner</h2>
              <p className="text-xs text-muted">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted hover:bg-surface rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="flex items-start gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-surface/40 transition-colors">
            <input
              type="checkbox"
              checked={isPartner}
              onChange={(e) => setIsPartner(e.target.checked)}
              className="mt-1"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">Mark as Verified Partner</p>
              <p className="text-xs text-muted mt-0.5">
                Gives them a storefront at /agent/[slug], a badge on every listing, and routing for diaspora requests.
              </p>
            </div>
          </label>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-muted">
              Partner name
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g. GY Realty Group"
              disabled={disabled}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-muted">
              Storefront URL slug
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted">/agent/</span>
              <input
                type="text"
                value={partnerSlug}
                onChange={(e) => {
                  setPartnerSlug(e.target.value);
                  setSlugTouched(true);
                }}
                onBlur={() => setPartnerSlug(slugify(partnerSlug))}
                placeholder="gy-realty-group"
                disabled={disabled}
                className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
            </div>
            {partnerSlug && (
              <p className="text-[10px] text-muted mt-1">
                Preview: yuhplace.com/agent/{partnerSlug}
              </p>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-muted">
              Tagline (1 line)
            </label>
            <input
              type="text"
              value={partnerTagline}
              onChange={(e) => setPartnerTagline(e.target.value)}
              placeholder="Georgetown&rsquo;s most-trusted real estate team."
              disabled={disabled}
              maxLength={120}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-muted">
              Bio (paragraph)
            </label>
            <textarea
              value={partnerBio}
              onChange={(e) => setPartnerBio(e.target.value)}
              rows={3}
              placeholder="Who you are, what you specialize in, why buyers trust you."
              disabled={disabled}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-muted">
                Logo URL
              </label>
              <input
                type="url"
                value={partnerLogoUrl}
                onChange={(e) => setPartnerLogoUrl(e.target.value)}
                placeholder="https://..."
                disabled={disabled}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-muted">
                Banner URL
              </label>
              <input
                type="url"
                value={partnerBannerUrl}
                onChange={(e) => setPartnerBannerUrl(e.target.value)}
                placeholder="https://..."
                disabled={disabled}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 p-4 bg-surface/40 border-t border-border">
          {user.partner_slug && user.is_verified_partner ? (
            <a
              href={`/agent/${user.partner_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open current storefront &rarr;
            </a>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-foreground rounded-lg hover:bg-surface"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onSave({
                  isPartner,
                  partnerName: partnerName.trim() ? partnerName.trim() : null,
                  partnerLogoUrl: partnerLogoUrl.trim() ? partnerLogoUrl.trim() : null,
                  partnerSlug: partnerSlug.trim() ? slugify(partnerSlug) : null,
                  partnerTagline: partnerTagline.trim() ? partnerTagline.trim() : null,
                  partnerBio: partnerBio.trim() ? partnerBio.trim() : null,
                  partnerBannerUrl: partnerBannerUrl.trim() ? partnerBannerUrl.trim() : null,
                })
              }
              disabled={saving}
              className="px-4 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-1.5 disabled:opacity-60 bg-primary hover:bg-primary-dark"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
