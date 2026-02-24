'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Star,
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

interface AdminMarketListing {
  id: string;
  title: string;
  price_amount: number | null;
  currency: string;
  status: 'active' | 'sold' | 'hidden' | 'removed';
  is_featured: boolean;
  created_at: string;
  seller_name: string;
  seller_id: string;
  region_name: string;
  category_name: string;
  report_count: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-800' },
  sold: { label: 'Sold', className: 'bg-blue-100 text-blue-800' },
  hidden: { label: 'Hidden', className: 'bg-yellow-100 text-yellow-800' },
  removed: { label: 'Removed', className: 'bg-red-100 text-red-800' },
};

const STATUS_FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'Removed', value: 'removed' },
  { label: 'Featured', value: 'featured' },
];

const CATEGORY_FILTER_OPTIONS = [
  { label: 'All Categories', value: 'all' },
  { label: 'Buy & Sell', value: 'Buy & Sell' },
  { label: 'Services', value: 'Services' },
  { label: 'Vehicles', value: 'Vehicles' },
];

function formatPrice(amount: number | null, currency: string): string {
  if (amount === null) return 'Contact seller';
  return `$${Number(amount).toLocaleString()} ${currency}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminMarketPage() {
  const [listings, setListings] = useState<AdminMarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc('get_admin_market_listings');
    if (data) setListings(data as AdminMarketListing[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const filteredListings = useMemo(() => {
    let results = [...listings];
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (l) => l.title.toLowerCase().includes(q) || l.seller_name.toLowerCase().includes(q),
      );
    }
    if (statusFilter === 'featured') results = results.filter((l) => l.is_featured);
    else if (statusFilter !== 'all') results = results.filter((l) => l.status === statusFilter);
    if (categoryFilter !== 'all') results = results.filter((l) => l.category_name === categoryFilter);
    return results;
  }, [listings, search, statusFilter, categoryFilter]);

  async function handleAction(id: string, action: 'hide' | 'remove' | 'restore') {
    setActionLoading(id);
    const supabase = createClient();
    let error;

    if (action === 'hide') {
      ({ error } = await supabase.rpc('admin_hide_content', { p_target_type: 'market_listing', p_target_id: id }));
    } else if (action === 'remove') {
      ({ error } = await supabase.rpc('admin_remove_content', { p_target_type: 'market_listing', p_target_id: id }));
    } else {
      ({ error } = await supabase.rpc('admin_restore_content', { p_target_type: 'market_listing', p_target_id: id }));
    }

    if (!error) {
      const newStatus = action === 'hide' ? 'hidden' : action === 'remove' ? 'removed' : 'active';
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus as AdminMarketListing['status'] } : l)));
    }
    setActionLoading(null);
  }

  async function handleToggleFeatured(id: string) {
    setActionLoading(id);
    const supabase = createClient();
    const { data: newVal, error } = await supabase.rpc('admin_toggle_featured', { p_target_type: 'market_listing', p_target_id: id });
    if (!error) {
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, is_featured: newVal as boolean } : l)));
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
        <h1 className="text-2xl font-bold text-foreground">Market Listings</h1>
        <p className="text-sm text-muted mt-1">Manage marketplace listings across all categories</p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
        <span className="text-muted">{listings.length} total listings</span>
        <span className="text-muted">{listings.filter((l) => l.status === 'active').length} active</span>
        {listings.filter((l) => l.is_featured).length > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
            <Star size={12} />
            {listings.filter((l) => l.is_featured).length} featured
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted"><Filter size={16} /></div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search title or seller..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 bg-white border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-white border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground cursor-pointer hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            {STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        <div className="relative">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="appearance-none bg-white border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground cursor-pointer hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            {CATEGORY_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        {(statusFilter !== 'all' || categoryFilter !== 'all' || search.trim()) && (
          <button onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setSearch(''); }} className="text-sm text-primary hover:underline font-medium">Clear filters</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Listing</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Price</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Seller</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted">{listings.length === 0 ? 'No market listings yet.' : 'No listings match the selected filters.'}</td></tr>
              ) : (
                filteredListings.map((listing) => {
                  const statusCfg = STATUS_CONFIG[listing.status] || STATUS_CONFIG.active;
                  const isProcessing = actionLoading === listing.id;

                  return (
                    <tr key={listing.id} className={cn('border-b border-border last:border-b-0 transition-colors', listing.status !== 'active' ? 'bg-surface/20' : 'hover:bg-surface/30')}>
                      <td className="px-5 py-3 align-top">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link href={`/market/${listing.id}`} target="_blank" className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">{listing.title}</Link>
                            {listing.is_featured && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted mt-0.5">{timeAgo(listing.created_at)} &middot; {listing.region_name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted align-top">{listing.category_name}</td>
                      <td className="px-5 py-3 text-foreground font-medium align-top whitespace-nowrap">{formatPrice(listing.price_amount, listing.currency)}</td>
                      <td className="px-5 py-3 text-foreground align-top">{listing.seller_name}</td>
                      <td className="px-5 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.className)}>{statusCfg.label}</span>
                          {listing.report_count > 0 && (
                            <span className="flex items-center gap-1 text-xs text-danger"><Flag size={11} />{listing.report_count}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {isProcessing ? (
                            <Loader2 size={16} className="animate-spin text-muted" />
                          ) : (
                            <>
                              <Link href={`/market/${listing.id}`} target="_blank" className="p-1.5 text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-colors" title="View listing"><Eye size={16} /></Link>
                              <button onClick={() => handleToggleFeatured(listing.id)} className={cn('p-1.5 rounded-lg transition-colors', listing.is_featured ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50' : 'text-muted hover:text-amber-500 hover:bg-amber-50')} title={listing.is_featured ? 'Remove featured' : 'Make featured'}>
                                <Star size={16} className={listing.is_featured ? 'fill-amber-500' : ''} />
                              </button>
                              {listing.status === 'active' && (
                                <>
                                  <button onClick={() => handleAction(listing.id, 'hide')} className="p-1.5 text-muted hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Hide listing"><EyeOff size={16} /></button>
                                  <button onClick={() => handleAction(listing.id, 'remove')} className="p-1.5 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors" title="Remove listing"><Trash2 size={16} /></button>
                                </>
                              )}
                              {(listing.status === 'hidden' || listing.status === 'removed') && (
                                <button onClick={() => handleAction(listing.id, 'restore')} className="p-1.5 text-muted hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Restore listing"><RotateCcw size={16} /></button>
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
