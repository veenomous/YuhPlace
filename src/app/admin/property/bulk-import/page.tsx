'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileText,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const REQUIRED_COLS = ['title', 'description', 'listing_mode', 'property_type', 'price_amount', 'region_slug'];
const OPTIONAL_COLS = ['currency', 'bedrooms', 'bathrooms', 'neighborhood_text', 'owner_type', 'whatsapp_number', 'image_urls'];
const ALL_COLS = [...REQUIRED_COLS, ...OPTIONAL_COLS];

const SAMPLE_CSV = `title,description,listing_mode,property_type,price_amount,currency,bedrooms,bathrooms,neighborhood_text,region_slug,owner_type,whatsapp_number,image_urls
"3-bed home in Bel Air","Spacious family home with private yard. Fully fenced.",sale,house,32000000,GYD,3,2,"Bel Air Park",georgetown,agent,+5926001234,"https://example.com/a.jpg;https://example.com/b.jpg"
"Modern 1-bed apartment","Walking distance to Stabroek Market, new kitchen.",rent,apartment,85000,GYD,1,1,"Stabroek",georgetown,landlord,+5926005678,"https://example.com/c.jpg"`;

// ─── Minimal CSV parser (handles quoted fields + escaped quotes) ────────────

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        cur.push(field);
        field = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        cur.push(field);
        rows.push(cur);
        cur = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface Partner {
  id: string;
  name: string;
  partner_name: string | null;
  partner_slug: string | null;
}

interface ParsedRow {
  data: Record<string, string>;
  errors: string[];
}

type ImportResult =
  | { index: number; status: 'inserted'; id: string }
  | { index: number; status: 'error'; error: string };

const VALID_MODES = new Set(['rent', 'sale']);
const VALID_TYPES = new Set(['house', 'apartment', 'room', 'land', 'commercial']);
const VALID_OWNER_TYPES = new Set(['owner', 'agent', 'landlord']);
const VALID_CURRENCIES = new Set(['GYD', 'USD', 'CAD', 'GBP']);

function validateRow(row: Record<string, string>, regionSlugs: Set<string>): string[] {
  const errs: string[] = [];
  if (!row.title?.trim()) errs.push('title required');
  if (!row.description?.trim()) errs.push('description required');
  const mode = row.listing_mode?.trim().toLowerCase();
  if (!mode || !VALID_MODES.has(mode)) errs.push('listing_mode must be rent|sale');
  const ptype = row.property_type?.trim().toLowerCase();
  if (!ptype || !VALID_TYPES.has(ptype)) errs.push('property_type invalid');
  const price = parseFloat((row.price_amount ?? '').replace(/[,\s]/g, ''));
  if (!Number.isFinite(price) || price < 0) errs.push('price_amount must be a number');
  const slug = row.region_slug?.trim().toLowerCase();
  if (!slug || !regionSlugs.has(slug)) errs.push(`region_slug "${slug ?? ''}" unknown`);
  const currency = (row.currency ?? 'GYD').trim().toUpperCase();
  if (!VALID_CURRENCIES.has(currency)) errs.push('currency must be GYD|USD|CAD|GBP');
  const owner_type = (row.owner_type ?? 'agent').trim().toLowerCase();
  if (!VALID_OWNER_TYPES.has(owner_type)) errs.push('owner_type must be owner|agent|landlord');
  return errs;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BulkImportPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [ownerId, setOwnerId] = useState<string>('');
  const [regionSlugs, setRegionSlugs] = useState<Set<string>>(new Set());
  const [rawText, setRawText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [partnersRes, regionsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, partner_name, partner_slug')
          .eq('is_verified_partner', true)
          .order('partner_name', { nullsFirst: false }),
        supabase.from('regions').select('slug'),
      ]);
      if (partnersRes.data) setPartners(partnersRes.data as Partner[]);
      if (regionsRes.data) {
        setRegionSlugs(new Set((regionsRes.data as { slug: string }[]).map((r) => r.slug)));
      }
    })();
  }, []);

  const parsed = useMemo(() => {
    if (!rawText.trim()) return { header: [] as string[], rows: [] as ParsedRow[] };
    const grid = parseCsv(rawText);
    if (grid.length === 0) return { header: [] as string[], rows: [] as ParsedRow[] };
    const header = grid[0].map((h) => h.trim().toLowerCase());
    const dataRows = grid.slice(1);

    const rows: ParsedRow[] = dataRows.map((cells) => {
      const data: Record<string, string> = {};
      header.forEach((h, i) => {
        data[h] = cells[i] ?? '';
      });
      const errs = validateRow(data, regionSlugs);
      // Unknown-column warnings fold in when columns present aren't in ALL_COLS.
      const unknown = header.filter((h) => !ALL_COLS.includes(h));
      if (unknown.length > 0) {
        errs.unshift(`unknown columns will be ignored: ${unknown.join(', ')}`);
      }
      return { data, errors: errs };
    });

    return { header, rows };
  }, [rawText, regionSlugs]);

  const missingHeaders = useMemo(() => {
    if (parsed.header.length === 0) return [] as string[];
    return REQUIRED_COLS.filter((c) => !parsed.header.includes(c));
  }, [parsed.header]);

  const errorCount = parsed.rows.filter((r) => r.errors.length > 0).length;
  const validCount = parsed.rows.length - errorCount;

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setRawText(String(reader.result ?? ''));
      setResults(null);
    };
    reader.readAsText(file);
  }, []);

  async function handleSubmit() {
    if (!ownerId) return;
    setSubmitting(true);
    setResults(null);
    try {
      const rowsPayload = parsed.rows
        .filter((r) => r.errors.length === 0)
        .map((r) => r.data);

      const res = await fetch('/api/admin/property/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: ownerId, rows: rowsPayload }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Import failed');
      } else {
        setResults(json.results as ImportResult[]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const totalInserted = results?.filter((r) => r.status === 'inserted').length ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Home size={20} />
          Property bulk import
        </h1>
        <p className="text-sm text-muted mt-1">
          Paste or upload a CSV of listings. Perfect for onboarding an agency&rsquo;s current inventory.
        </p>
      </div>

      {/* Partner selector */}
      <div className="bg-white border border-border rounded-xl p-5 mb-5">
        <h2 className="text-sm font-bold text-foreground mb-2">1. Assign to a Verified Partner</h2>
        <p className="text-xs text-muted mb-3">
          Only verified partners can receive bulk-imported listings. Add the partner in{' '}
          <Link href="/admin/users?filter=partners" className="text-primary hover:underline">Users</Link>{' '}
          first if not listed.
        </p>
        <div className="relative">
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full appearance-none bg-white border border-border rounded-lg px-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">— Pick a partner —</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.partner_name || p.name} ({p.partner_slug ?? 'no slug'})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      </div>

      {/* CSV input */}
      <div className="bg-white border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-foreground">2. Drop in the CSV</h2>
          <button
            onClick={() => setRawText(SAMPLE_CSV)}
            className="text-xs text-primary hover:underline font-semibold"
          >
            Load sample
          </button>
        </div>
        <p className="text-xs text-muted mb-3">
          Headers required: <span className="font-mono text-foreground">{REQUIRED_COLS.join(', ')}</span>. Optional:{' '}
          <span className="font-mono text-foreground">{OPTIONAL_COLS.join(', ')}</span>. Image URLs separated by <span className="font-mono">;</span>.
        </p>

        <div className="flex items-center gap-2 mb-3">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer bg-primary-light text-primary-dark hover:brightness-95 transition-all">
            <Upload size={14} />
            Upload file
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
          {rawText && (
            <button
              onClick={() => {
                setRawText('');
                setResults(null);
              }}
              className="text-xs text-muted hover:text-foreground font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setResults(null);
          }}
          rows={8}
          placeholder={'Paste CSV here, including header row...'}
          className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
        />
      </div>

      {/* Preview */}
      {parsed.rows.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-5 mb-5">
          <h2 className="text-sm font-bold text-foreground mb-3">3. Preview</h2>

          {missingHeaders.length > 0 && (
            <div className="mb-3 p-3 rounded-lg text-xs flex items-start gap-2" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Missing required columns: {missingHeaders.join(', ')}</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-3 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold bg-green-100 text-green-800">
              <CheckCircle2 size={12} /> {validCount} valid
            </span>
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold bg-red-100 text-red-800">
                <AlertTriangle size={12} /> {errorCount} with errors (skipped)
              </span>
            )}
          </div>

          <div className="overflow-x-auto max-h-80 border border-border rounded-lg">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-muted uppercase tracking-wide w-10">#</th>
                  <th className="px-3 py-2 text-left font-bold text-muted uppercase tracking-wide">Title</th>
                  <th className="px-3 py-2 text-left font-bold text-muted uppercase tracking-wide">Mode</th>
                  <th className="px-3 py-2 text-left font-bold text-muted uppercase tracking-wide">Type</th>
                  <th className="px-3 py-2 text-left font-bold text-muted uppercase tracking-wide">Price</th>
                  <th className="px-3 py-2 text-left font-bold text-muted uppercase tracking-wide">Region</th>
                  <th className="px-3 py-2 text-left font-bold text-muted uppercase tracking-wide">Errors</th>
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 100).map((r, i) => {
                  const hasError = r.errors.length > 0;
                  return (
                    <tr key={i} className={cn('border-t border-border', hasError ? 'bg-red-50/40' : '')}>
                      <td className="px-3 py-2 text-muted">{i + 1}</td>
                      <td className="px-3 py-2 text-foreground truncate max-w-[220px]">{r.data.title}</td>
                      <td className="px-3 py-2 text-muted">{r.data.listing_mode}</td>
                      <td className="px-3 py-2 text-muted">{r.data.property_type}</td>
                      <td className="px-3 py-2 text-muted">{r.data.price_amount}</td>
                      <td className="px-3 py-2 text-muted">{r.data.region_slug}</td>
                      <td className="px-3 py-2">
                        {hasError ? (
                          <span className="text-red-700">{r.errors.join(' · ')}</span>
                        ) : (
                          <span className="text-green-700 inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> ok
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {parsed.rows.length > 100 && (
              <p className="px-3 py-2 text-[11px] text-muted bg-surface">
                Showing first 100 of {parsed.rows.length} rows. All will be processed on import.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirm */}
      {validCount > 0 && ownerId && (
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-3 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark disabled:opacity-60 inline-flex items-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            Import {validCount} listing{validCount === 1 ? '' : 's'}
          </button>
          {errorCount > 0 && (
            <p className="text-xs text-muted">{errorCount} row{errorCount === 1 ? '' : 's'} with errors will be skipped.</p>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white border border-border rounded-xl p-5 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              {totalInserted} listing{totalInserted === 1 ? '' : 's'} imported
            </h2>
          </div>
          <ul className="text-xs divide-y divide-border">
            {results.map((r) => (
              <li key={r.index} className="py-2 flex items-center gap-2">
                <span className="text-muted w-6">{r.index + 1}</span>
                {r.status === 'inserted' ? (
                  <>
                    <CheckCircle2 size={12} className="text-green-600" />
                    <Link href={`/property/${r.id}`} target="_blank" className="text-primary hover:underline font-mono">
                      /property/{r.id.slice(0, 8)}...
                    </Link>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} className="text-red-600" />
                    <span className="text-red-700">{r.error}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-xs text-muted">
        <FileText size={12} className="inline mr-1" />
        Need the format? Click &quot;Load sample&quot; above for a copy-pasteable example.
      </div>
    </div>
  );
}
