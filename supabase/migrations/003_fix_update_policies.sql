-- =====================================================
-- Fix UPDATE + DELETE policies for all content tables
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Drop and recreate UPDATE policies with WITH CHECK clause
-- The issue: after setting status='removed', the row must still pass policy checks

-- DISCOVER POSTS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own discover posts" ON discover_posts;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can update own discover posts"
  ON discover_posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own discover posts" ON discover_posts;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can delete own discover posts"
  ON discover_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- MARKET LISTINGS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own market listings" ON market_listings;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can update own market listings"
  ON market_listings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own market listings" ON market_listings;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can delete own market listings"
  ON market_listings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- PROPERTY LISTINGS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own property listings" ON property_listings;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can update own property listings"
  ON property_listings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own property listings" ON property_listings;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can delete own property listings"
  ON property_listings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
