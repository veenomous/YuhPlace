-- =====================================================
-- Soft-delete RPC functions
-- Run this in Supabase Dashboard → SQL Editor
-- These bypass RLS but verify ownership internally
-- =====================================================

CREATE OR REPLACE FUNCTION soft_delete_discover_post(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE discover_posts
  SET status = 'removed', updated_at = NOW()
  WHERE id = post_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found or unauthorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_market_listing(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE market_listings
  SET status = 'removed', updated_at = NOW()
  WHERE id = listing_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or unauthorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_property_listing(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE property_listings
  SET status = 'removed', updated_at = NOW()
  WHERE id = listing_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or unauthorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
