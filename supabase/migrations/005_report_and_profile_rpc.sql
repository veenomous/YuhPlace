-- Submit report RPC + Update profile RPC
-- Run in Supabase Dashboard → SQL Editor

CREATE OR REPLACE FUNCTION submit_report(
  p_target_type TEXT,
  p_target_id UUID,
  p_reason TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO reports (reporter_user_id, target_type, target_id, reason, notes)
  VALUES (
    auth.uid(),
    p_target_type::report_target_type,
    p_target_id,
    p_reason::report_reason,
    p_notes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_profile(
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_region_slug TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_region_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_region_slug IS NOT NULL THEN
    SELECT id INTO v_region_id FROM regions WHERE slug = p_region_slug;
  END IF;

  UPDATE profiles SET
    name = COALESCE(p_name, name),
    phone = COALESCE(p_phone, phone),
    region_id = COALESCE(v_region_id, region_id),
    updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
