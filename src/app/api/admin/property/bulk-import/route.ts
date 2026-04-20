import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@/lib/supabase/server';

const VALID_MODES = new Set(['rent', 'sale']);
const VALID_TYPES = new Set(['house', 'apartment', 'room', 'land', 'commercial']);
const VALID_OWNER_TYPES = new Set(['owner', 'agent', 'landlord']);
const VALID_CURRENCIES = new Set(['GYD', 'USD', 'CAD', 'GBP']);

function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', status: 401 as const };

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return { error: 'Admin access required', status: 403 as const };
  return { user };
}

type InputRow = {
  title?: string;
  description?: string;
  listing_mode?: string;
  property_type?: string;
  price_amount?: string | number;
  currency?: string;
  bedrooms?: string | number | null;
  bathrooms?: string | number | null;
  neighborhood_text?: string;
  region_slug?: string;
  owner_type?: string;
  whatsapp_number?: string;
  image_urls?: string;
};

type ImportResult =
  | { index: number; status: 'inserted'; id: string }
  | { index: number; status: 'error'; error: string };

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { owner_id, rows } = (await req.json()) as {
    owner_id?: string;
    rows?: InputRow[];
  };

  if (!owner_id || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: 'owner_id and non-empty rows[] required.' },
      { status: 400 },
    );
  }

  const supabase = getServiceSupabase();

  // Verify owner exists.
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', owner_id)
    .maybeSingle();
  if (!ownerProfile) {
    return NextResponse.json({ error: 'owner_id not found.' }, { status: 400 });
  }

  // Map region slug -> id (one query).
  const { data: regions } = await supabase.from('regions').select('id, slug');
  const regionMap = new Map<string, string>((regions ?? []).map((r) => [r.slug, r.id]));

  const results: ImportResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const title = row.title?.toString().trim();
      const description = row.description?.toString().trim();
      const listing_mode = row.listing_mode?.toString().trim().toLowerCase();
      const property_type = row.property_type?.toString().trim().toLowerCase();
      const priceRaw = row.price_amount;
      const regionSlug = row.region_slug?.toString().trim().toLowerCase();

      if (!title) throw new Error('title required');
      if (!description) throw new Error('description required');
      if (!listing_mode || !VALID_MODES.has(listing_mode)) {
        throw new Error('listing_mode must be rent or sale');
      }
      if (!property_type || !VALID_TYPES.has(property_type)) {
        throw new Error('property_type must be house|apartment|room|land|commercial');
      }
      const price_amount = typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw ?? '').replace(/[,\s]/g, ''));
      if (!Number.isFinite(price_amount) || price_amount < 0) {
        throw new Error('price_amount must be a positive number');
      }
      if (!regionSlug || !regionMap.has(regionSlug)) {
        throw new Error(`region_slug "${regionSlug}" not found`);
      }

      const currency = (row.currency?.toString().trim().toUpperCase() || 'GYD');
      if (!VALID_CURRENCIES.has(currency)) {
        throw new Error(`currency must be one of ${[...VALID_CURRENCIES].join(', ')}`);
      }

      const owner_type = (row.owner_type?.toString().trim().toLowerCase() || 'agent');
      if (!VALID_OWNER_TYPES.has(owner_type)) {
        throw new Error('owner_type must be owner|agent|landlord');
      }

      const bedrooms =
        row.bedrooms === null || row.bedrooms === undefined || row.bedrooms === ''
          ? null
          : parseInt(String(row.bedrooms), 10);
      const bathrooms =
        row.bathrooms === null || row.bathrooms === undefined || row.bathrooms === ''
          ? null
          : parseInt(String(row.bathrooms), 10);

      const { data: inserted, error: insertErr } = await supabase
        .from('property_listings')
        .insert({
          user_id: owner_id,
          region_id: regionMap.get(regionSlug),
          listing_mode,
          property_type,
          title,
          description,
          price_amount,
          currency,
          bedrooms: Number.isFinite(bedrooms as number) ? bedrooms : null,
          bathrooms: Number.isFinite(bathrooms as number) ? bathrooms : null,
          neighborhood_text: row.neighborhood_text?.toString().trim() || null,
          owner_type,
          whatsapp_number: row.whatsapp_number?.toString().trim() || null,
          status: 'active',
        })
        .select('id')
        .single();

      if (insertErr || !inserted) {
        throw new Error(insertErr?.message || 'Insert failed');
      }

      // Images — semicolon-separated URLs.
      const imageUrls = (row.image_urls ?? '')
        .toString()
        .split(';')
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      if (imageUrls.length > 0) {
        const imageRows = imageUrls.map((url, idx) => ({
          property_listing_id: inserted.id,
          image_url: url,
          sort_order: idx,
        }));
        const { error: imgErr } = await supabase.from('property_listing_images').insert(imageRows);
        if (imgErr) {
          // Not fatal — listing exists, just note it.
          console.error('image insert failed for listing', inserted.id, imgErr);
        }
      }

      results.push({ index: i, status: 'inserted', id: inserted.id });
    } catch (err) {
      results.push({
        index: i,
        status: 'error',
        error: err instanceof Error ? err.message : 'unknown error',
      });
    }
  }

  const inserted = results.filter((r) => r.status === 'inserted').length;
  const errored = results.filter((r) => r.status === 'error').length;

  return NextResponse.json({ inserted, errored, results });
}
