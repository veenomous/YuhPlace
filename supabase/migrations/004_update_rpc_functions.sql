-- =====================================================
-- Update RPC functions
-- Run this in Supabase Dashboard → SQL Editor
-- These bypass RLS but verify ownership internally
-- =====================================================

CREATE OR REPLACE FUNCTION update_discover_post(
  post_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_post_type TEXT DEFAULT NULL,
  p_region_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE discover_posts SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    post_type = COALESCE(p_post_type, post_type),
    region_id = COALESCE(p_region_id, region_id),
    updated_at = NOW()
  WHERE id = post_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found or unauthorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_market_listing(
  listing_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_price_amount NUMERIC DEFAULT NULL,
  p_condition TEXT DEFAULT NULL,
  p_seller_type TEXT DEFAULT NULL,
  p_whatsapp_number TEXT DEFAULT NULL,
  p_region_id UUID DEFAULT NULL,
  p_category_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE market_listings SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    price_amount = COALESCE(p_price_amount, price_amount),
    condition = COALESCE(p_condition, condition),
    seller_type = COALESCE(p_seller_type, seller_type),
    whatsapp_number = COALESCE(p_whatsapp_number, whatsapp_number),
    region_id = COALESCE(p_region_id, region_id),
    category_id = COALESCE(p_category_id, category_id),
    updated_at = NOW()
  WHERE id = listing_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or unauthorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_property_listing(
  listing_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_price_amount NUMERIC DEFAULT NULL,
  p_listing_mode TEXT DEFAULT NULL,
  p_property_type TEXT DEFAULT NULL,
  p_bedrooms INTEGER DEFAULT NULL,
  p_bathrooms INTEGER DEFAULT NULL,
  p_neighborhood_text TEXT DEFAULT NULL,
  p_owner_type TEXT DEFAULT NULL,
  p_whatsapp_number TEXT DEFAULT NULL,
  p_region_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE property_listings SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    price_amount = COALESCE(p_price_amount, price_amount),
    listing_mode = COALESCE(p_listing_mode, listing_mode),
    property_type = COALESCE(p_property_type, property_type),
    bedrooms = COALESCE(p_bedrooms, bedrooms),
    bathrooms = COALESCE(p_bathrooms, bathrooms),
    neighborhood_text = COALESCE(p_neighborhood_text, neighborhood_text),
    owner_type = COALESCE(p_owner_type, owner_type),
    whatsapp_number = COALESCE(p_whatsapp_number, whatsapp_number),
    region_id = COALESCE(p_region_id, region_id),
    updated_at = NOW()
  WHERE id = listing_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or unauthorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
