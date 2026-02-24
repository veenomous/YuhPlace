// YuhPlace Database Types
// Mirrors the Supabase schema exactly

export type AccountType = 'individual' | 'business' | 'agent_landlord';
export type UserStatus = 'active' | 'suspended';
export type PostType = 'community' | 'event' | 'business' | 'alert';
export type ContentStatus = 'active' | 'hidden' | 'removed';
export type ItemCondition = 'new' | 'used' | 'na';
export type SellerType = 'individual' | 'business';
export type ListingStatus = 'active' | 'sold' | 'hidden' | 'removed';
export type ListingMode = 'rent' | 'sale';
export type PropertyType = 'house' | 'apartment' | 'room' | 'land' | 'commercial';
export type OwnerType = 'owner' | 'agent' | 'landlord';
export type PropertyStatus = 'active' | 'rented' | 'sold' | 'hidden' | 'removed';
export type ReportReason = 'spam' | 'scam_fraud' | 'inappropriate' | 'wrong_category' | 'duplicate' | 'misleading';
export type ReportStatus = 'open' | 'reviewed' | 'action_taken' | 'dismissed';
export type ReportTargetType = 'discover_post' | 'market_listing' | 'property_listing' | 'user';
export type AdminActionType = 'hide_content' | 'remove_content' | 'suspend_user' | 'feature_listing' | 'unfeature_listing';

export interface Region {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  region_id: string | null;
  account_type: AccountType;
  avatar_url: string | null;
  is_verified_business: boolean;
  status: UserStatus;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface DiscoverPost {
  id: string;
  user_id: string;
  region_id: string;
  post_type: PostType;
  title: string;
  description: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface DiscoverPostImage {
  id: string;
  post_id: string;
  image_url: string;
  sort_order: number;
}

export interface MarketListing {
  id: string;
  user_id: string;
  region_id: string;
  category_id: string;
  title: string;
  description: string;
  price_amount: number | null;
  currency: string;
  condition: ItemCondition;
  seller_type: SellerType;
  whatsapp_number: string;
  status: ListingStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  sort_order: number;
}

export interface PropertyListing {
  id: string;
  user_id: string;
  region_id: string;
  listing_mode: ListingMode;
  property_type: PropertyType;
  title: string;
  description: string;
  price_amount: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  neighborhood_text: string | null;
  owner_type: OwnerType;
  whatsapp_number: string;
  status: PropertyStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyListingImage {
  id: string;
  property_listing_id: string;
  image_url: string;
  sort_order: number;
}

export interface Report {
  id: string;
  reporter_user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  notes: string | null;
  status: ReportStatus;
  reviewed_by_admin_id: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_user_id: string;
  action_type: AdminActionType;
  target_type: ReportTargetType;
  target_id: string;
  notes: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  content: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface CommentWithProfile extends Comment {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business'>;
}

// Joined types for frontend display
export interface DiscoverPostWithDetails extends DiscoverPost {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business' | 'created_at'>;
  regions: Pick<Region, 'name' | 'slug'>;
  discover_post_images: DiscoverPostImage[];
}

export interface MarketListingWithDetails extends MarketListing {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business' | 'created_at'>;
  regions: Pick<Region, 'name' | 'slug'>;
  market_categories: Pick<MarketCategory, 'name' | 'slug'>;
  market_listing_images: MarketListingImage[];
}

export interface PropertyListingWithDetails extends PropertyListing {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business' | 'created_at'>;
  regions: Pick<Region, 'name' | 'slug'>;
  property_listing_images: PropertyListingImage[];
}
