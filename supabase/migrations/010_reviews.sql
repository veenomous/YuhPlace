-- =====================================================
-- User Ratings & Reviews
-- Run this in Supabase Dashboard → SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE)
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  target_type report_target_type NOT NULL,
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One review per buyer per listing
  UNIQUE(reviewer_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_type, target_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE TO authenticated
  USING (auth.uid() = reviewer_id);

-- Submit a review (upsert — updates if exists)
CREATE OR REPLACE FUNCTION submit_review(
  p_seller_id UUID,
  p_target_type TEXT,
  p_target_id UUID,
  p_rating SMALLINT,
  p_comment TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF v_user_id = p_seller_id THEN
    RAISE EXCEPTION 'Cannot review yourself';
  END IF;

  INSERT INTO reviews (reviewer_id, seller_id, rating, comment, target_type, target_id)
  VALUES (v_user_id, p_seller_id, p_rating, p_comment, p_target_type::report_target_type, p_target_id)
  ON CONFLICT (reviewer_id, target_type, target_id) DO UPDATE
  SET rating = p_rating, comment = p_comment
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Get reviews for a specific seller
CREATE OR REPLACE FUNCTION get_seller_reviews(p_seller_id UUID)
RETURNS TABLE (
  id UUID,
  reviewer_id UUID,
  reviewer_name TEXT,
  reviewer_verified BOOLEAN,
  rating SMALLINT,
  comment TEXT,
  target_type report_target_type,
  target_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id, r.reviewer_id,
    p.name AS reviewer_name,
    p.is_verified_business AS reviewer_verified,
    r.rating, r.comment, r.target_type, r.target_id, r.created_at
  FROM reviews r
  JOIN profiles p ON p.id = r.reviewer_id
  WHERE r.seller_id = p_seller_id
  ORDER BY r.created_at DESC;
END;
$$;

-- Get average rating for a seller
CREATE OR REPLACE FUNCTION get_seller_rating(p_seller_id UUID)
RETURNS TABLE (
  avg_rating NUMERIC,
  review_count BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
    COUNT(*)::bigint AS review_count
  FROM reviews r
  WHERE r.seller_id = p_seller_id;
END;
$$;
