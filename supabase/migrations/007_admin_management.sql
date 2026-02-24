-- =====================================================
-- Admin Management RPCs
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- RPC: Get all users for admin management
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

-- RPC: Toggle verified business badge
CREATE OR REPLACE FUNCTION admin_toggle_verified(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  new_val BOOLEAN;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE profiles
  SET is_verified_business = NOT is_verified_business
  WHERE id = p_user_id
  RETURNING is_verified_business INTO new_val;

  RETURN new_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Suspend a user
CREATE OR REPLACE FUNCTION admin_suspend_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Don't allow suspending admins
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Cannot suspend an admin user';
  END IF;

  UPDATE profiles SET status = 'suspended' WHERE id = p_user_id;

  -- Also hide all their content
  UPDATE discover_posts SET status = 'hidden' WHERE user_id = p_user_id AND status = 'active';
  UPDATE market_listings SET status = 'hidden' WHERE user_id = p_user_id AND status = 'active';
  UPDATE property_listings SET status = 'hidden' WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Unsuspend a user
CREATE OR REPLACE FUNCTION admin_unsuspend_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE profiles SET status = 'active' WHERE id = p_user_id;

  -- Restore their hidden content
  UPDATE discover_posts SET status = 'active' WHERE user_id = p_user_id AND status = 'hidden';
  UPDATE market_listings SET status = 'active' WHERE user_id = p_user_id AND status = 'hidden';
  UPDATE property_listings SET status = 'active' WHERE user_id = p_user_id AND status = 'hidden';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get all discover posts for admin (including hidden/removed)
CREATE OR REPLACE FUNCTION get_admin_discover_posts()
RETURNS JSON AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN (
    SELECT json_agg(row_to_json(d))
    FROM (
      SELECT
        dp.id,
        dp.title,
        dp.post_type,
        dp.status,
        dp.created_at,
        p.name as author_name,
        p.id as author_id,
        r.name as region_name,
        (SELECT count(*) FROM reports rep WHERE rep.target_type = 'discover_post' AND rep.target_id = dp.id) as report_count
      FROM discover_posts dp
      JOIN profiles p ON p.id = dp.user_id
      JOIN regions r ON r.id = dp.region_id
      ORDER BY dp.created_at DESC
    ) d
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get all market listings for admin (including hidden/removed)
CREATE OR REPLACE FUNCTION get_admin_market_listings()
RETURNS JSON AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN (
    SELECT json_agg(row_to_json(m))
    FROM (
      SELECT
        ml.id,
        ml.title,
        ml.price_amount,
        ml.currency,
        ml.status,
        ml.is_featured,
        ml.created_at,
        p.name as seller_name,
        p.id as seller_id,
        r.name as region_name,
        mc.name as category_name,
        (SELECT count(*) FROM reports rep WHERE rep.target_type = 'market_listing' AND rep.target_id = ml.id) as report_count
      FROM market_listings ml
      JOIN profiles p ON p.id = ml.user_id
      JOIN regions r ON r.id = ml.region_id
      JOIN market_categories mc ON mc.id = ml.category_id
      ORDER BY ml.created_at DESC
    ) m
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get all property listings for admin (including hidden/removed)
CREATE OR REPLACE FUNCTION get_admin_property_listings()
RETURNS JSON AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN (
    SELECT json_agg(row_to_json(pr))
    FROM (
      SELECT
        pl.id,
        pl.title,
        pl.listing_mode,
        pl.property_type,
        pl.price_amount,
        pl.currency,
        pl.status,
        pl.is_featured,
        pl.created_at,
        p.name as owner_name,
        p.id as owner_id,
        r.name as region_name,
        (SELECT count(*) FROM reports rep WHERE rep.target_type = 'property_listing' AND rep.target_id = pl.id) as report_count
      FROM property_listings pl
      JOIN profiles p ON p.id = pl.user_id
      JOIN regions r ON r.id = pl.region_id
      ORDER BY pl.created_at DESC
    ) pr
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin hide content (soft hide, reversible)
CREATE OR REPLACE FUNCTION admin_hide_content(p_target_type TEXT, p_target_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_target_type = 'discover_post' THEN
    UPDATE discover_posts SET status = 'hidden' WHERE id = p_target_id;
  ELSIF p_target_type = 'market_listing' THEN
    UPDATE market_listings SET status = 'hidden' WHERE id = p_target_id;
  ELSIF p_target_type = 'property_listing' THEN
    UPDATE property_listings SET status = 'hidden' WHERE id = p_target_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin remove content (permanent remove)
CREATE OR REPLACE FUNCTION admin_remove_content(p_target_type TEXT, p_target_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_target_type = 'discover_post' THEN
    UPDATE discover_posts SET status = 'removed' WHERE id = p_target_id;
  ELSIF p_target_type = 'market_listing' THEN
    UPDATE market_listings SET status = 'removed' WHERE id = p_target_id;
  ELSIF p_target_type = 'property_listing' THEN
    UPDATE property_listings SET status = 'removed' WHERE id = p_target_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin restore content (set back to active)
CREATE OR REPLACE FUNCTION admin_restore_content(p_target_type TEXT, p_target_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_target_type = 'discover_post' THEN
    UPDATE discover_posts SET status = 'active' WHERE id = p_target_id;
  ELSIF p_target_type = 'market_listing' THEN
    UPDATE market_listings SET status = 'active' WHERE id = p_target_id;
  ELSIF p_target_type = 'property_listing' THEN
    UPDATE property_listings SET status = 'active' WHERE id = p_target_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin toggle featured status
CREATE OR REPLACE FUNCTION admin_toggle_featured(p_target_type TEXT, p_target_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  new_val BOOLEAN;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_target_type = 'market_listing' THEN
    UPDATE market_listings SET is_featured = NOT is_featured WHERE id = p_target_id RETURNING is_featured INTO new_val;
  ELSIF p_target_type = 'property_listing' THEN
    UPDATE property_listings SET is_featured = NOT is_featured WHERE id = p_target_id RETURNING is_featured INTO new_val;
  ELSE
    RAISE EXCEPTION 'Only market and property listings can be featured';
  END IF;

  RETURN new_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
