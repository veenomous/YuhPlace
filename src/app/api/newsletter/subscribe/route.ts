import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, source, location } = await req.json();

    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.trim().toLowerCase(),
        source: typeof source === 'string' ? source.slice(0, 64) : null,
        location: typeof location === 'string' ? location.slice(0, 64) : null,
      });

    // 23505 = unique_violation. Treat duplicate as success so we don't leak
    // whether someone's already on the list.
    if (error && error.code !== '23505') {
      console.error('newsletter_subscribers insert failed:', error);
      return NextResponse.json({ error: 'Subscribe failed.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('newsletter/subscribe error:', err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
