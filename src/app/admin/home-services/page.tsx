'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Mail,
  MessageCircle,
  MapPin,
  Home,
  ShoppingBasket,
  Wrench,
  HelpCircle,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { cn, timeAgo, formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { HomeServiceStatus, HomeServiceType } from '@/types/database';

interface AdminRequest {
  id: string;
  service_type: HomeServiceType;
  status: HomeServiceStatus;
  requester_name: string;
  requester_email: string;
  requester_whatsapp: string | null;
  requester_location: string | null;
  details: string;
  admin_notes: string | null;
  assigned_partner_id: string | null;
  target_property_id: string | null;
  target_region_id: string | null;
  created_at: string;
  updated_at: string;
  property_title: string | null;
  property_price: number | null;
  property_currency: string | null;
  region_name: string | null;
  assigned_partner_display_name: string | null;
  assigned_partner_brand: string | null;
}

interface PartnerOption {
  id: string;
  name: string;
  partner_name: string | null;
}

const SERVICE_META: Record<
  HomeServiceType,
  { label: string; icon: typeof Home; accent: string; accentLight: string }
> = {
  property_viewing: { label: 'Property viewing', icon: Home, accent: '#196a24', accentLight: '#F1FBF4' },
  grocery_delivery: { label: 'Supplies delivery', icon: ShoppingBasket, accent: '#A16207', accentLight: '#FEF3C7' },
  handyman: { label: 'Handyman', icon: Wrench, accent: '#1667B7', accentLight: '#EFF6FF' },
  other: { label: 'Other', icon: HelpCircle, accent: '#6B7280', accentLight: '#F3F4F6' },
};

const STATUS_META: Record<HomeServiceStatus, { label: string; cls: string; icon: typeof Clock }> = {
  new: { label: 'New', cls: 'bg-blue-100 text-blue-800', icon: Inbox },
  assigned: { label: 'Assigned', cls: 'bg-purple-100 text-purple-800', icon: Clock },
  in_progress: { label: 'In progress', cls: 'bg-amber-100 text-amber-800', icon: Clock },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-700', icon: XCircle },
};

const STATUS_FILTER: Array<{ label: string; value: HomeServiceStatus | 'all' | 'open' }> = [
  { label: 'Open', value: 'open' },
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function AdminHomeServicesPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<HomeServiceStatus | 'all' | 'open'>('open');
  const [serviceFilter, setServiceFilter] = useState<HomeServiceType | 'all'>('all');
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const [reqs, parts] = await Promise.all([
      supabase.rpc('get_admin_home_service_requests'),
      supabase
        .from('profiles')
        .select('id, name, partner_name')
        .eq('is_verified_partner', true),
    ]);
    if (reqs.data) setRequests(reqs.data as AdminRequest[]);
    if (parts.data) setPartners(parts.data as PartnerOption[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter === 'open') {
        if (r.status === 'completed' || r.status === 'cancelled') return false;
      } else if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }
      if (serviceFilter !== 'all' && r.service_type !== serviceFilter) return false;
      return true;
    });
  }, [requests, statusFilter, serviceFilter]);

  const selected = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? null,
    [requests, selectedId],
  );

  const openCount = requests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled').length;

  async function handleUpdate(
    id: string,
    patch: { status?: HomeServiceStatus; admin_notes?: string | null; assigned_partner_id?: string | null },
  ) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_update_home_service_request', {
      p_id: id,
      p_status: patch.status ?? null,
      p_admin_notes: patch.admin_notes === undefined ? null : patch.admin_notes,
      p_assigned_partner_id: patch.assigned_partner_id === undefined ? null : patch.assigned_partner_id,
    });
    if (!error) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...(patch.status !== undefined ? { status: patch.status } : null),
                ...(patch.admin_notes !== undefined ? { admin_notes: patch.admin_notes } : null),
                ...(patch.assigned_partner_id !== undefined ? { assigned_partner_id: patch.assigned_partner_id } : null),
              }
            : r,
        ),
      );
    }
    setSaving(false);
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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Home Services</h1>
          <p className="text-sm text-muted mt-1">
            Incoming diaspora requests. Assign a partner, add notes, update status.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <Inbox size={12} />
            {openCount} open
          </span>
          <span className="text-muted">{requests.length} total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Filter size={14} className="text-muted" />
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTER.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                statusFilter === opt.value
                  ? 'bg-foreground text-white'
                  : 'bg-white border border-border text-muted hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="w-px h-5 bg-border mx-1.5" />
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setServiceFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
              serviceFilter === 'all'
                ? 'bg-foreground text-white'
                : 'bg-white border border-border text-muted hover:text-foreground',
            )}
          >
            All services
          </button>
          {(Object.keys(SERVICE_META) as HomeServiceType[]).map((key) => {
            const meta = SERVICE_META[key];
            return (
              <button
                key={key}
                onClick={() => setServiceFilter(key)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                  serviceFilter === key
                    ? 'bg-foreground text-white'
                    : 'bg-white border border-border text-muted hover:text-foreground',
                )}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-8 text-center">
              <Inbox size={24} className="mx-auto text-muted mb-2" />
              <p className="text-sm font-medium text-foreground">Nothing here.</p>
              <p className="text-xs text-muted">Try changing the filter.</p>
            </div>
          ) : (
            filtered.map((r) => {
              const meta = SERVICE_META[r.service_type];
              const statusMeta = STATUS_META[r.status];
              const Icon = meta.icon;
              const StatusIcon = statusMeta.icon;
              const active = selectedId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3',
                    active
                      ? 'bg-white border-primary shadow-md'
                      : 'bg-white border-border hover:border-primary/40',
                  )}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: meta.accentLight }}
                  >
                    <Icon size={16} style={{ color: meta.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-bold text-foreground truncate">{r.requester_name}</span>
                      <span className={cn('inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0', statusMeta.cls)}>
                        <StatusIcon size={9} />
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">{meta.label}</p>
                    <p className="text-[11px] text-muted line-clamp-2 mt-1">{r.details}</p>
                    <p className="text-[10px] text-muted mt-1">
                      {timeAgo(r.created_at)}
                      {r.requester_location ? ` · from ${r.requester_location}` : ''}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-white border border-border rounded-xl p-10 text-center sticky top-4">
              <Inbox size={28} className="mx-auto text-muted mb-2" />
              <p className="text-sm font-semibold text-foreground">Select a request</p>
              <p className="text-xs text-muted mt-1">Pick from the list to see details and take action.</p>
            </div>
          ) : (
            <RequestDetail
              req={selected}
              partners={partners}
              saving={saving}
              onUpdate={(patch) => handleUpdate(selected.id, patch)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RequestDetail({
  req,
  partners,
  saving,
  onUpdate,
}: {
  req: AdminRequest;
  partners: PartnerOption[];
  saving: boolean;
  onUpdate: (patch: { status?: HomeServiceStatus; admin_notes?: string | null; assigned_partner_id?: string | null }) => void;
}) {
  const [notes, setNotes] = useState(req.admin_notes ?? '');
  const serviceMeta = SERVICE_META[req.service_type];
  const ServiceIcon = serviceMeta.icon;
  const whatsappHref = req.requester_whatsapp
    ? `https://wa.me/${req.requester_whatsapp.replace(/[^0-9]/g, '')}`
    : null;

  useEffect(() => {
    setNotes(req.admin_notes ?? '');
  }, [req.id, req.admin_notes]);

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden sticky top-4">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: serviceMeta.accentLight }}
            >
              <ServiceIcon size={18} style={{ color: serviceMeta.accent }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: serviceMeta.accent }}>
                {serviceMeta.label}
              </p>
              <h2 className="text-lg font-bold text-foreground">{req.requester_name}</h2>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
              STATUS_META[req.status].cls,
            )}
          >
            {STATUS_META[req.status].label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <a
            href={`mailto:${req.requester_email}`}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <Mail size={12} /> {req.requester_email}
          </a>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <MessageCircle size={12} /> {req.requester_whatsapp}
            </a>
          )}
          {req.requester_location && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {req.requester_location}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">What they need</h3>
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed bg-surface rounded-xl p-3">
            {req.details}
          </p>
        </div>

        {req.property_title && (
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">Property</h3>
            <Link
              href={`/property/${req.target_property_id}`}
              target="_blank"
              className="flex items-center gap-2 p-3 bg-surface rounded-xl hover:bg-surface/70 transition-colors"
            >
              <Home size={14} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{req.property_title}</p>
                {req.property_price && req.property_currency && (
                  <p className="text-xs text-muted">
                    {formatPrice(req.property_price, req.property_currency)}
                  </p>
                )}
              </div>
              <ExternalLink size={13} className="text-muted" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-1">
              Status
            </label>
            <select
              value={req.status}
              onChange={(e) => onUpdate({ status: e.target.value as HomeServiceStatus })}
              disabled={saving}
              className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {(Object.keys(STATUS_META) as HomeServiceStatus[]).map((k) => (
                <option key={k} value={k}>{STATUS_META[k].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-1">
              Assign partner
            </label>
            <select
              value={req.assigned_partner_id ?? ''}
              onChange={(e) => onUpdate({ assigned_partner_id: e.target.value || null })}
              disabled={saving || partners.length === 0}
              className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            >
              <option value="">— Unassigned —</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.partner_name || p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-1">
            Admin notes (internal)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (notes !== (req.admin_notes ?? '')) {
                onUpdate({ admin_notes: notes || null });
              }
            }}
            rows={3}
            placeholder="Partner called, viewing scheduled for Saturday 2pm..."
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <p className="text-[10px] text-muted mt-1">Saved when you click away.</p>
        </div>

        <p className="text-[10px] text-muted">
          Request {req.id.slice(0, 8)} · created {timeAgo(req.created_at)} · updated {timeAgo(req.updated_at)}
        </p>
      </div>
    </div>
  );
}
