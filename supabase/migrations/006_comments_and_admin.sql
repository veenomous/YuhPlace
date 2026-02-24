-- =====================================================
-- Comments table + Admin helper functions
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type report_target_type NOT NULL,
  target_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  status content_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active comments are publicly readable"
  ON comments FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RPC: Add a comment
CREATE OR REPLACE FUNCTION add_comment(
  p_target_type TEXT,
  p_target_id UUID,
  p_content TEXT
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO comments (user_id, target_type, target_id, content)
  VALUES (auth.uid(), p_target_type::report_target_type, p_target_id, p_content)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Delete own comment (soft delete)
CREATE OR REPLACE FUNCTION delete_comment(p_comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE comments
  SET status = 'removed', updated_at = NOW()
  WHERE id = p_comment_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comment not found or unauthorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT count(*) FROM profiles WHERE status = 'active'),
    'total_market', (SELECT count(*) FROM market_listings WHERE status = 'active'),
    'total_property', (SELECT count(*) FROM property_listings WHERE status NOT IN ('removed', 'hidden')),
    'total_discover', (SELECT count(*) FROM discover_posts WHERE status = 'active'),
    'open_reports', (SELECT count(*) FROM reports WHERE status = 'open'),
    'total_reports', (SELECT count(*) FROM reports)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get reports for admin (with reporter name)
CREATE OR REPLACE FUNCTION get_admin_reports()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(r))
    FROM (
      SELECT
        rep.id,
        rep.target_type,
        rep.target_id,
        rep.reason,
        rep.notes,
        rep.status,
        rep.created_at,
        rep.reviewed_at,
        p.name as reporter_name
      FROM reports rep
      JOIN profiles p ON p.id = rep.reporter_user_id
      ORDER BY rep.created_at DESC
    ) r
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin dismiss report
CREATE OR REPLACE FUNCTION admin_dismiss_report(p_report_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE reports
  SET status = 'dismissed', reviewed_by_admin_id = auth.uid(), reviewed_at = NOW()
  WHERE id = p_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin take action on report (removes the content)
CREATE OR REPLACE FUNCTION admin_action_report(p_report_id UUID)
RETURNS VOID AS $$
DECLARE
  r reports%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO r FROM reports WHERE id = p_report_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Report not found'; END IF;

  -- Remove the reported content
  IF r.target_type = 'discover_post' THEN
    UPDATE discover_posts SET status = 'removed' WHERE id = r.target_id;
  ELSIF r.target_type = 'market_listing' THEN
    UPDATE market_listings SET status = 'removed' WHERE id = r.target_id;
  ELSIF r.target_type = 'property_listing' THEN
    UPDATE property_listings SET status = 'removed' WHERE id = r.target_id;
  END IF;

  UPDATE reports
  SET status = 'action_taken', reviewed_by_admin_id = auth.uid(), reviewed_at = NOW()
  WHERE id = p_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin reopen report (undo dismiss/action, restore content)
CREATE OR REPLACE FUNCTION admin_reopen_report(p_report_id UUID)
RETURNS VOID AS $$
DECLARE
  r reports%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO r FROM reports WHERE id = p_report_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Report not found'; END IF;

  -- Restore content if it was removed
  IF r.status = 'action_taken' THEN
    IF r.target_type = 'discover_post' THEN
      UPDATE discover_posts SET status = 'active' WHERE id = r.target_id;
    ELSIF r.target_type = 'market_listing' THEN
      UPDATE market_listings SET status = 'active' WHERE id = r.target_id;
    ELSIF r.target_type = 'property_listing' THEN
      UPDATE property_listings SET status = 'active' WHERE id = r.target_id;
    END IF;
  END IF;

  UPDATE reports
  SET status = 'open', reviewed_by_admin_id = NULL, reviewed_at = NULL
  WHERE id = p_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at for comments
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
