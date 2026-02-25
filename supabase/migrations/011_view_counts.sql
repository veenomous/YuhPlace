-- 011_view_counts.sql
-- Add view count columns and increment RPC

-- Add view_count to all 3 content tables
ALTER TABLE discover_posts ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE property_listings ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- RPC to increment view count (SECURITY DEFINER so any visitor can trigger it,
-- even though RLS only allows owners to UPDATE their own rows)
CREATE OR REPLACE FUNCTION increment_view_count(
  target_table TEXT,
  target_id UUID
)
RETURNS VOID AS $$
BEGIN
  IF target_table = 'discover_post' THEN
    UPDATE discover_posts SET view_count = view_count + 1 WHERE id = target_id;
  ELSIF target_table = 'market_listing' THEN
    UPDATE market_listings SET view_count = view_count + 1 WHERE id = target_id;
  ELSIF target_table = 'property_listing' THEN
    UPDATE property_listings SET view_count = view_count + 1 WHERE id = target_id;
  ELSE
    RAISE EXCEPTION 'Invalid target_table: %', target_table;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
