-- =====================================================
-- Favorites / Saved Listings
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type report_target_type NOT NULL,
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_target ON favorites(target_type, target_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- RPC: Toggle favorite (add if not exists, remove if exists). Returns new state.
CREATE OR REPLACE FUNCTION toggle_favorite(p_target_type TEXT, p_target_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  existing_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO existing_id
  FROM favorites
  WHERE user_id = auth.uid()
    AND target_type = p_target_type::report_target_type
    AND target_id = p_target_id;

  IF existing_id IS NOT NULL THEN
    DELETE FROM favorites WHERE id = existing_id;
    RETURN false; -- unfavorited
  ELSE
    INSERT INTO favorites (user_id, target_type, target_id)
    VALUES (auth.uid(), p_target_type::report_target_type, p_target_id);
    RETURN true; -- favorited
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get all favorites for the current user
CREATE OR REPLACE FUNCTION get_my_favorites()
RETURNS JSON AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN (
    SELECT json_agg(row_to_json(f))
    FROM (
      SELECT target_type, target_id, created_at
      FROM favorites
      WHERE user_id = auth.uid()
      ORDER BY created_at DESC
    ) f
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
