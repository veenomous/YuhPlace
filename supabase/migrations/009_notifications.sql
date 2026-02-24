-- =====================================================
-- In-App Notifications
-- Run this in Supabase Dashboard → SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE)
-- =====================================================

-- Notification types: comment_on_post, comment_on_listing, report_action
CREATE TYPE notification_type AS ENUM (
  'comment_on_post',
  'comment_on_market',
  'comment_on_property',
  'content_removed',
  'content_restored'
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_type report_target_type,
  target_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Get notifications for current user (most recent 50)
CREATE OR REPLACE FUNCTION get_my_notifications()
RETURNS TABLE (
  id UUID,
  type notification_type,
  title TEXT,
  body TEXT,
  target_type report_target_type,
  target_id UUID,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.type, n.title, n.body, n.target_type, n.target_id, n.is_read, n.created_at
  FROM notifications n
  WHERE n.user_id = auth.uid()
  ORDER BY n.created_at DESC
  LIMIT 50;
END;
$$;

-- Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM notifications
    WHERE user_id = auth.uid() AND is_read = false
  );
END;
$$;

-- Mark a single notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$;

-- Trigger function: create notification when someone comments on content you own
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_owner_id UUID;
  v_content_title TEXT;
  v_commenter_name TEXT;
  v_notif_type notification_type;
BEGIN
  -- Get commenter name
  SELECT name INTO v_commenter_name FROM profiles WHERE id = NEW.user_id;

  -- Find content owner based on target type
  IF NEW.target_type = 'discover_post' THEN
    SELECT user_id, title INTO v_owner_id, v_content_title
    FROM discover_posts WHERE id = NEW.target_id;
    v_notif_type := 'comment_on_post';
  ELSIF NEW.target_type = 'market_listing' THEN
    SELECT user_id, title INTO v_owner_id, v_content_title
    FROM market_listings WHERE id = NEW.target_id;
    v_notif_type := 'comment_on_market';
  ELSIF NEW.target_type = 'property_listing' THEN
    SELECT user_id, title INTO v_owner_id, v_content_title
    FROM property_listings WHERE id = NEW.target_id;
    v_notif_type := 'comment_on_property';
  END IF;

  -- Don't notify yourself
  IF v_owner_id IS NOT NULL AND v_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, body, target_type, target_id)
    VALUES (
      v_owner_id,
      v_notif_type,
      'New comment on "' || LEFT(v_content_title, 40) || '"',
      v_commenter_name || ' commented on your ' ||
        CASE NEW.target_type
          WHEN 'discover_post' THEN 'post'
          WHEN 'market_listing' THEN 'listing'
          WHEN 'property_listing' THEN 'property'
        END,
      NEW.target_type,
      NEW.target_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to comments table
DROP TRIGGER IF EXISTS on_new_comment_notify ON comments;
CREATE TRIGGER on_new_comment_notify
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();
