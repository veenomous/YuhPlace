-- Migration 027: Admin management for Verified Partners
-- Extends get_admin_users to return partner fields and adds
-- admin_set_partner() so the admin UI can mark/unmark a profile
-- as a Verified Partner and set the partner's branded name/logo.

-- ── Updated get_admin_users returns partner fields ──────────────────────────
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS JSON AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN (
    SELECT json_agg(row_to_json(u))
    FROM (
      SELECT
        p.id,
        p.name,
        p.phone,
        p.account_type,
        p.avatar_url,
        p.is_verified_business,
        p.is_verified_partner,
        p.partner_name,
        p.partner_logo_url,
        p.status,
        p.is_admin,
        p.created_at,
        r.name as region_name,
        (SELECT count(*) FROM discover_posts dp WHERE dp.user_id = p.id AND dp.status = 'active') as post_count,
        (SELECT count(*) FROM market_listings ml WHERE ml.user_id = p.id AND ml.status = 'active') as market_count,
        (SELECT count(*) FROM property_listings pl WHERE pl.user_id = p.id AND pl.status = 'active') as property_count,
        (SELECT count(*) FROM reports rep WHERE rep.reporter_user_id = p.id) as reports_filed
      FROM profiles p
      LEFT JOIN regions r ON r.id = p.region_id
      ORDER BY p.created_at DESC
    ) u
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Set / update partner attribution ────────────────────────────────────────
-- Passing p_is_partner=false clears the branded name + logo.
CREATE OR REPLACE FUNCTION admin_set_partner(
  p_user_id UUID,
  p_is_partner BOOLEAN,
  p_partner_name TEXT DEFAULT NULL,
  p_partner_logo_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_is_partner THEN
    UPDATE profiles
    SET
      is_verified_partner = true,
      partner_name = COALESCE(NULLIF(trim(p_partner_name), ''), partner_name),
      partner_logo_url = COALESCE(NULLIF(trim(p_partner_logo_url), ''), partner_logo_url)
    WHERE id = p_user_id;
  ELSE
    UPDATE profiles
    SET
      is_verified_partner = false,
      partner_name = NULL,
      partner_logo_url = NULL
    WHERE id = p_user_id;
  END IF;

  SELECT json_build_object(
    'id', id,
    'is_verified_partner', is_verified_partner,
    'partner_name', partner_name,
    'partner_logo_url', partner_logo_url
  )
  INTO result
  FROM profiles
  WHERE id = p_user_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Home service requests admin view ────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_home_service_requests()
RETURNS JSON AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN COALESCE(
    (
      SELECT json_agg(row_to_json(r))
      FROM (
        SELECT
          hsr.id,
          hsr.service_type,
          hsr.status,
          hsr.requester_name,
          hsr.requester_email,
          hsr.requester_whatsapp,
          hsr.requester_location,
          hsr.details,
          hsr.admin_notes,
          hsr.assigned_partner_id,
          hsr.target_property_id,
          hsr.target_region_id,
          hsr.created_at,
          hsr.updated_at,
          pl.title as property_title,
          pl.price_amount as property_price,
          pl.currency as property_currency,
          reg.name as region_name,
          partner.name as assigned_partner_display_name,
          partner.partner_name as assigned_partner_brand
        FROM home_service_requests hsr
        LEFT JOIN property_listings pl ON pl.id = hsr.target_property_id
        LEFT JOIN regions reg ON reg.id = hsr.target_region_id
        LEFT JOIN profiles partner ON partner.id = hsr.assigned_partner_id
        ORDER BY hsr.created_at DESC
      ) r
    ),
    '[]'::json
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Newsletter / waitlist ───────────────────────────────────────────────────
-- Light capture for the "GT This Week" email. No account required.
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,              -- e.g. "landing_footer"
  location text,            -- optional self-reported location (NY, Toronto, Georgetown, ...)
  created_at timestamptz not null default now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe.
DROP POLICY IF EXISTS "newsletter_insert_anyone" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_insert_anyone"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read.
DROP POLICY IF EXISTS "newsletter_select_admin" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_select_admin"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Update a request's status and admin notes; optionally assign a partner.
CREATE OR REPLACE FUNCTION admin_update_home_service_request(
  p_id UUID,
  p_status home_service_status DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL,
  p_assigned_partner_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE home_service_requests
  SET
    status = COALESCE(p_status, status),
    admin_notes = CASE WHEN p_admin_notes IS NULL THEN admin_notes ELSE p_admin_notes END,
    assigned_partner_id = CASE WHEN p_assigned_partner_id IS NULL THEN assigned_partner_id ELSE p_assigned_partner_id END
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
