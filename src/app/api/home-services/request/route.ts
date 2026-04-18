import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerClient } from '@supabase/ssr';
import type { HomeServiceType } from '@/types/database';

const VALID_SERVICES: HomeServiceType[] = [
  'property_viewing',
  'grocery_delivery',
  'handyman',
  'other',
];

const SERVICE_LABELS: Record<HomeServiceType, string> = {
  property_viewing: 'Property viewing',
  grocery_delivery: 'Grocery / supplies delivery',
  handyman: 'Handyman',
  other: 'Other',
};

function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service_type,
      requester_name,
      requester_email,
      requester_whatsapp,
      requester_location,
      target_property_id,
      target_region_id,
      details,
    } = body ?? {};

    if (!requester_name?.trim() || !requester_email?.trim() || !details?.trim()) {
      return NextResponse.json({ error: 'Name, email, and details are required.' }, { status: 400 });
    }
    if (!VALID_SERVICES.includes(service_type)) {
      return NextResponse.json({ error: 'Invalid service type.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Insert the request
    const { data, error } = await supabase
      .from('home_service_requests')
      .insert({
        service_type,
        requester_name: requester_name.trim(),
        requester_email: requester_email.trim(),
        requester_whatsapp: requester_whatsapp?.trim() || null,
        requester_location: requester_location?.trim() || null,
        target_property_id: target_property_id || null,
        target_region_id: target_region_id || null,
        details: details.trim(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('home_service_requests insert failed:', error);
      return NextResponse.json({ error: 'Failed to save request.' }, { status: 500 });
    }

    // Look up optional property for richer email
    let propertyLine = '';
    if (target_property_id) {
      const { data: prop } = await supabase
        .from('property_listings')
        .select('title, price_amount, currency')
        .eq('id', target_property_id)
        .maybeSingle();
      if (prop) propertyLine = `<p><strong>Property:</strong> ${prop.title}</p>`;
    }

    // Fire-and-log admin email (don't block success on email failure)
    const adminEmail = process.env.HOME_SERVICES_ADMIN_EMAIL;
    const resendKey = process.env.RESEND_API_KEY;
    if (adminEmail && resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'YuhPlace <onboarding@resend.dev>',
          to: adminEmail,
          replyTo: requester_email,
          subject: `New ${SERVICE_LABELS[service_type as HomeServiceType]} request — ${requester_name}`,
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
              <h2 style="margin:0 0 12px;color:#196a24;">New home services request</h2>
              <p><strong>Service:</strong> ${SERVICE_LABELS[service_type as HomeServiceType]}</p>
              <p><strong>Name:</strong> ${requester_name}</p>
              <p><strong>Email:</strong> <a href="mailto:${requester_email}">${requester_email}</a></p>
              ${requester_whatsapp ? `<p><strong>WhatsApp:</strong> ${requester_whatsapp}</p>` : ''}
              ${requester_location ? `<p><strong>Location:</strong> ${requester_location}</p>` : ''}
              ${propertyLine}
              <p><strong>Details:</strong></p>
              <div style="background:#f6f3f2;padding:12px 14px;border-radius:8px;white-space:pre-line;">${details}</div>
              <p style="margin-top:16px;color:#6b7280;font-size:12px;">Request ID: ${data.id}</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('home_services email failed:', emailErr);
      }
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error('home-services/request error:', err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
