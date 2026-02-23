-- YuhPlace Database Schema
-- Initial migration: all core tables + RLS policies

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE account_type AS ENUM ('individual', 'business', 'agent_landlord');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE post_type AS ENUM ('community', 'event', 'business', 'alert');
CREATE TYPE content_status AS ENUM ('active', 'hidden', 'removed');
CREATE TYPE item_condition AS ENUM ('new', 'used', 'na');
CREATE TYPE seller_type AS ENUM ('individual', 'business');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'hidden', 'removed');
CREATE TYPE listing_mode AS ENUM ('rent', 'sale');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'room', 'land', 'commercial');
CREATE TYPE owner_type AS ENUM ('owner', 'agent', 'landlord');
CREATE TYPE property_status AS ENUM ('active', 'rented', 'sold', 'hidden', 'removed');
CREATE TYPE report_reason AS ENUM ('spam', 'scam_fraud', 'inappropriate', 'wrong_category', 'duplicate', 'misleading');
CREATE TYPE report_status AS ENUM ('open', 'reviewed', 'action_taken', 'dismissed');
CREATE TYPE report_target_type AS ENUM ('discover_post', 'market_listing', 'property_listing', 'user');
CREATE TYPE admin_action_type AS ENUM ('hide_content', 'remove_content', 'suspend_user', 'feature_listing', 'unfeature_listing');

-- ============================================================
-- REGIONS
-- ============================================================

CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Seed Georgetown as the launch region
INSERT INTO regions (name, slug, sort_order) VALUES
  ('Georgetown', 'georgetown', 1),
  ('East Coast Demerara', 'east-coast-demerara', 2),
  ('West Coast Demerara', 'west-coast-demerara', 3),
  ('East Bank Demerara', 'east-bank-demerara', 4),
  ('West Bank Demerara', 'west-bank-demerara', 5),
  ('Berbice', 'berbice', 6),
  ('Linden', 'linden', 7),
  ('Essequibo', 'essequibo', 8),
  ('Bartica', 'bartica', 9),
  ('Anna Regina', 'anna-regina', 10);

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  region_id UUID REFERENCES regions(id),
  account_type account_type NOT NULL DEFAULT 'individual',
  avatar_url TEXT,
  is_verified_business BOOLEAN NOT NULL DEFAULT false,
  status user_status NOT NULL DEFAULT 'active',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MARKET CATEGORIES
-- ============================================================

CREATE TABLE market_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES market_categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Seed initial categories
INSERT INTO market_categories (name, slug, sort_order) VALUES
  ('Buy & Sell', 'buy-sell', 1),
  ('Services', 'services', 2),
  ('Vehicles', 'vehicles', 3);

-- ============================================================
-- DISCOVER POSTS
-- ============================================================

CREATE TABLE discover_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES regions(id),
  post_type post_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status content_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE discover_post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES discover_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- MARKET LISTINGS
-- ============================================================

CREATE TABLE market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES regions(id),
  category_id UUID NOT NULL REFERENCES market_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_amount NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'GYD',
  condition item_condition NOT NULL DEFAULT 'na',
  seller_type seller_type NOT NULL DEFAULT 'individual',
  whatsapp_number TEXT NOT NULL,
  status listing_status NOT NULL DEFAULT 'active',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE market_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES market_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- PROPERTY LISTINGS
-- ============================================================

CREATE TABLE property_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES regions(id),
  listing_mode listing_mode NOT NULL,
  property_type property_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GYD',
  bedrooms INTEGER,
  bathrooms INTEGER,
  neighborhood_text TEXT,
  owner_type owner_type NOT NULL DEFAULT 'owner',
  whatsapp_number TEXT NOT NULL,
  status property_status NOT NULL DEFAULT 'active',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE property_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- REPORTS
-- ============================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type report_target_type NOT NULL,
  target_id UUID NOT NULL,
  reason report_reason NOT NULL,
  notes TEXT,
  status report_status NOT NULL DEFAULT 'open',
  reviewed_by_admin_id UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ADMIN ACTIONS (audit log)
-- ============================================================

CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type admin_action_type NOT NULL,
  target_type report_target_type NOT NULL,
  target_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_profiles_region ON profiles(region_id);
CREATE INDEX idx_profiles_account_type ON profiles(account_type);

CREATE INDEX idx_discover_posts_region ON discover_posts(region_id);
CREATE INDEX idx_discover_posts_type ON discover_posts(post_type);
CREATE INDEX idx_discover_posts_status ON discover_posts(status);
CREATE INDEX idx_discover_posts_created ON discover_posts(created_at DESC);
CREATE INDEX idx_discover_posts_user ON discover_posts(user_id);

CREATE INDEX idx_market_listings_region ON market_listings(region_id);
CREATE INDEX idx_market_listings_category ON market_listings(category_id);
CREATE INDEX idx_market_listings_status ON market_listings(status);
CREATE INDEX idx_market_listings_price ON market_listings(price_amount);
CREATE INDEX idx_market_listings_created ON market_listings(created_at DESC);
CREATE INDEX idx_market_listings_featured ON market_listings(is_featured) WHERE is_featured = true;
CREATE INDEX idx_market_listings_user ON market_listings(user_id);

CREATE INDEX idx_property_listings_region ON property_listings(region_id);
CREATE INDEX idx_property_listings_mode ON property_listings(listing_mode);
CREATE INDEX idx_property_listings_type ON property_listings(property_type);
CREATE INDEX idx_property_listings_status ON property_listings(status);
CREATE INDEX idx_property_listings_price ON property_listings(price_amount);
CREATE INDEX idx_property_listings_created ON property_listings(created_at DESC);
CREATE INDEX idx_property_listings_featured ON property_listings(is_featured) WHERE is_featured = true;
CREATE INDEX idx_property_listings_user ON property_listings(user_id);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE discover_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discover_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- REGIONS: public read
CREATE POLICY "Regions are publicly readable"
  ON regions FOR SELECT TO anon, authenticated USING (true);

-- MARKET CATEGORIES: public read
CREATE POLICY "Categories are publicly readable"
  ON market_categories FOR SELECT TO anon, authenticated USING (true);

-- PROFILES
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- DISCOVER POSTS
CREATE POLICY "Active discover posts are publicly readable"
  ON discover_posts FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Users can create discover posts"
  ON discover_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discover posts"
  ON discover_posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discover posts"
  ON discover_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- DISCOVER POST IMAGES
CREATE POLICY "Discover post images are publicly readable"
  ON discover_post_images FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can manage own post images"
  ON discover_post_images FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM discover_posts WHERE id = post_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own post images"
  ON discover_post_images FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM discover_posts WHERE id = post_id AND user_id = auth.uid())
  );

-- MARKET LISTINGS
CREATE POLICY "Active market listings are publicly readable"
  ON market_listings FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Users can create market listings"
  ON market_listings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own market listings"
  ON market_listings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own market listings"
  ON market_listings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- MARKET LISTING IMAGES
CREATE POLICY "Market listing images are publicly readable"
  ON market_listing_images FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can manage own listing images"
  ON market_listing_images FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM market_listings WHERE id = listing_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own listing images"
  ON market_listing_images FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM market_listings WHERE id = listing_id AND user_id = auth.uid())
  );

-- PROPERTY LISTINGS
CREATE POLICY "Active property listings are publicly readable"
  ON property_listings FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Users can create property listings"
  ON property_listings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own property listings"
  ON property_listings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own property listings"
  ON property_listings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- PROPERTY LISTING IMAGES
CREATE POLICY "Property listing images are publicly readable"
  ON property_listing_images FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can manage own property images"
  ON property_listing_images FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM property_listings WHERE id = property_listing_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own property images"
  ON property_listing_images FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM property_listings WHERE id = property_listing_id AND user_id = auth.uid())
  );

-- REPORTS
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_user_id);

-- ADMIN ACTIONS: admin only (handled via service role or admin check)
CREATE POLICY "Admins can view admin actions"
  ON admin_actions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can create admin actions"
  ON admin_actions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin override policies for moderation
CREATE POLICY "Admins can view all discover posts"
  ON discover_posts FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update any discover post"
  ON discover_posts FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can view all market listings"
  ON market_listings FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update any market listing"
  ON market_listings FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can view all property listings"
  ON property_listings FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update any property listing"
  ON property_listings FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_discover_posts_updated_at
  BEFORE UPDATE ON discover_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_market_listings_updated_at
  BEFORE UPDATE ON market_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_property_listings_updated_at
  BEFORE UPDATE ON property_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ============================================================
-- Note: Storage buckets are typically created via Supabase dashboard.
-- Buckets needed:
--   - avatars (public)
--   - discover-images (public)
--   - market-images (public)
--   - property-images (public)
