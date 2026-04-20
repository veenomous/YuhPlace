-- Migration 028: Partner storefront fields
-- Adds the public-facing storefront attributes used by /agent/[slug].
-- Slug is URL-safe, unique, and optional (only partners get one).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner_slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS partner_tagline text,
  ADD COLUMN IF NOT EXISTS partner_bio text,
  ADD COLUMN IF NOT EXISTS partner_banner_url text;

COMMENT ON COLUMN public.profiles.partner_slug IS
  'URL-safe slug for the agent storefront page, e.g. "gy-realty-group" -> /agent/gy-realty-group';
COMMENT ON COLUMN public.profiles.partner_tagline IS
  'One-liner shown on the storefront hero under the partner name.';
COMMENT ON COLUMN public.profiles.partner_bio IS
  'Longer paragraph describing the agent/agency. Rendered on the storefront.';
COMMENT ON COLUMN public.profiles.partner_banner_url IS
  'Optional hero banner image URL for the storefront.';

CREATE INDEX IF NOT EXISTS idx_profiles_partner_slug
  ON public.profiles (partner_slug)
  WHERE partner_slug IS NOT NULL;

-- ── Update admin_set_partner to carry the new fields ───────────────────────
CREATE OR REPLACE FUNCTION admin_set_partner(
  p_user_id UUID,
  p_is_partner BOOLEAN,
  p_partner_name TEXT DEFAULT NULL,
  p_partner_logo_url TEXT DEFAULT NULL,
  p_partner_slug TEXT DEFAULT NULL,
  p_partner_tagline TEXT DEFAULT NULL,
  p_partner_bio TEXT DEFAULT NULL,
  p_partner_banner_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  clean_slug TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_is_partner THEN
    clean_slug := NULLIF(trim(p_partner_slug), '');
    -- Light slug sanitation: lowercase, hyphens for spaces, strip unsafe chars.
    IF clean_slug IS NOT NULL THEN
      clean_slug := lower(regexp_replace(clean_slug, '[^a-zA-Z0-9]+', '-', 'g'));
      clean_slug := trim(both '-' from clean_slug);
    END IF;

    UPDATE profiles
    SET
      is_verified_partner = true,
      partner_name = COALESCE(NULLIF(trim(p_partner_name), ''), partner_name),
      partner_logo_url = COALESCE(NULLIF(trim(p_partner_logo_url), ''), partner_logo_url),
      partner_slug = COALESCE(clean_slug, partner_slug),
      partner_tagline = COALESCE(NULLIF(trim(p_partner_tagline), ''), partner_tagline),
      partner_bio = COALESCE(NULLIF(trim(p_partner_bio), ''), partner_bio),
      partner_banner_url = COALESCE(NULLIF(trim(p_partner_banner_url), ''), partner_banner_url)
    WHERE id = p_user_id;
  ELSE
    UPDATE profiles
    SET
      is_verified_partner = false,
      partner_name = NULL,
      partner_logo_url = NULL,
      partner_slug = NULL,
      partner_tagline = NULL,
      partner_bio = NULL,
      partner_banner_url = NULL
    WHERE id = p_user_id;
  END IF;

  SELECT json_build_object(
    'id', id,
    'is_verified_partner', is_verified_partner,
    'partner_name', partner_name,
    'partner_logo_url', partner_logo_url,
    'partner_slug', partner_slug,
    'partner_tagline', partner_tagline,
    'partner_bio', partner_bio,
    'partner_banner_url', partner_banner_url
  )
  INTO result
  FROM profiles
  WHERE id = p_user_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Update get_admin_users to include new partner fields ───────────────────
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
        p.partner_slug,
        p.partner_tagline,
        p.partner_bio,
        p.partner_banner_url,
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

-- ── Storefront lookup by slug (public, for SSR) ────────────────────────────
CREATE OR REPLACE FUNCTION get_agent_storefront(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'name', p.name,
    'avatar_url', p.avatar_url,
    'partner_name', p.partner_name,
    'partner_logo_url', p.partner_logo_url,
    'partner_slug', p.partner_slug,
    'partner_tagline', p.partner_tagline,
    'partner_bio', p.partner_bio,
    'partner_banner_url', p.partner_banner_url,
    'whatsapp_number', p.whatsapp_number,
    'phone', p.phone,
    'created_at', p.created_at
  )
  INTO result
  FROM profiles p
  WHERE p.partner_slug = p_slug
    AND p.is_verified_partner = true
    AND p.status = 'active';

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
