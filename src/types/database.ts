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
export type ReportTargetType = 'discover_post' | 'market_listing' | 'property_listing' | 'user' | 'job';
export type AdminActionType = 'hide_content' | 'remove_content' | 'suspend_user' | 'feature_listing' | 'unfeature_listing';
export type ListingIntent = 'offering' | 'seeking';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'temporary';
export type JobIntent = 'hiring' | 'seeking';
export type RideServiceType = 'taxi' | 'hire_car' | 'minibus' | 'boat';
export type RideRequestStatus = 'open' | 'accepted' | 'completed' | 'cancelled' | 'expired';
export type RideOfferStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

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
  whatsapp_number: string | null;
  region_id: string | null;
  account_type: AccountType;
  avatar_url: string | null;
  is_verified_business: boolean;
  is_verified_partner: boolean;
  partner_name: string | null;
  partner_logo_url: string | null;
  partner_slug: string | null;
  partner_tagline: string | null;
  partner_bio: string | null;
  partner_banner_url: string | null;
  status: UserStatus;
  is_admin: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Home Services ──────────────────────────────────────────────────────────

export type HomeServiceType =
  | 'property_viewing'
  | 'grocery_delivery'
  | 'handyman'
  | 'other';

export type HomeServiceStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface HomeServiceRequest {
  id: string;
  requester_user_id: string | null;
  requester_name: string;
  requester_email: string;
  requester_whatsapp: string | null;
  requester_location: string | null;
  service_type: HomeServiceType;
  target_region_id: string | null;
  target_property_id: string | null;
  details: string;
  status: HomeServiceStatus;
  assigned_partner_id: string | null;
  admin_notes: string | null;
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
  view_count: number;
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
  whatsapp_number: string | null;
  listing_intent: ListingIntent;
  status: ListingStatus;
  is_featured: boolean;
  view_count: number;
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
  whatsapp_number: string | null;
  status: PropertyStatus;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyListingImage {
  id: string;
  property_listing_id: string;
  image_url: string;
  sort_order: number;
}

export interface Job {
  id: string;
  user_id: string;
  region_id: string;
  title: string;
  description: string;
  job_type: JobType;
  intent: JobIntent;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  whatsapp_number: string | null;
  status: ListingStatus;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface JobImage {
  id: string;
  job_id: string;
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
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business' | 'is_verified_partner' | 'partner_name' | 'partner_logo_url' | 'partner_slug' | 'created_at'>;
  regions: Pick<Region, 'name' | 'slug'>;
  discover_post_images: DiscoverPostImage[];
}

export interface MarketListingWithDetails extends MarketListing {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business' | 'is_verified_partner' | 'partner_name' | 'partner_logo_url' | 'partner_slug' | 'created_at'>;
  regions: Pick<Region, 'name' | 'slug'>;
  market_categories: Pick<MarketCategory, 'name' | 'slug'>;
  market_listing_images: MarketListingImage[];
}

export interface PropertyListingWithDetails extends PropertyListing {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business' | 'is_verified_partner' | 'partner_name' | 'partner_logo_url' | 'partner_slug' | 'created_at'>;
  regions: Pick<Region, 'name' | 'slug'>;
  property_listing_images: PropertyListingImage[];
}

export interface JobWithDetails extends Job {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business' | 'is_verified_partner' | 'partner_name' | 'partner_logo_url' | 'partner_slug' | 'created_at'>;
  regions: Pick<Region, 'name' | 'slug'>;
  job_images: JobImage[];
}

// ─── Rides ─────────────────────────────────────────────────────────────────

export interface RideDriver {
  id: string;
  user_id: string;
  service_type: RideServiceType;
  vehicle_info: string | null;
  areas_covered: string | null;
  license_plate: string | null;
  vehicle_photo_url: string | null;
  is_available: boolean;
  whatsapp_number: string;
  cancellation_count: number;
  lat: number | null;
  lng: number | null;
  location_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RideDriverWithDetails extends RideDriver {
  avg_rating: number;
  review_count: number;
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business' | 'created_at'>;
}

export interface RideRequest {
  id: string;
  rider_id: string;
  region_id: string;
  pickup_area: string;
  destination: string;
  passengers: number;
  preferred_time: string | null;
  note: string | null;
  budget: number | null;
  status: RideRequestStatus;
  accepted_driver_id: string | null;
  accepted_offer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RideRequestWithDetails extends RideRequest {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business' | 'created_at'>;
  regions: Pick<Region, 'name' | 'slug'>;
}

export interface RideOffer {
  id: string;
  request_id: string;
  driver_id: string;
  price: number | null;
  message: string | null;
  status: RideOfferStatus;
  created_at: string;
}

export interface RideOfferWithDriver extends RideOffer {
  ride_drivers: RideDriverWithDetails;
}

// ─── Ride Reviews ───────────────────────────────────────────────────────────

export interface RideReview {
  id: string;
  request_id: string;
  reviewer_id: string;
  driver_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface RideReviewWithReviewer extends RideReview {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'>;
}

// ─── Ride Seats (Scheduled Trips) ──────────────────────────────────────────

export type RideSeatStatus = 'open' | 'full' | 'departed' | 'cancelled';

export interface RideSeat {
  id: string;
  driver_id: string;
  region_id: string;
  route_from: string;
  route_to: string;
  departure_time: string;
  seats_total: number;
  seats_available: number;
  price_per_seat: number | null;
  note: string | null;
  status: RideSeatStatus;
  created_at: string;
}

export interface RideSeatWithDriver extends RideSeat {
  ride_drivers: RideDriverWithDetails;
  regions: Pick<Region, 'name' | 'slug'>;
}

export interface RideSeatBooking {
  id: string;
  seat_id: string;
  passenger_id: string;
  passengers_count: number;
  note: string | null;
  created_at: string;
}

export interface RideSeatBookingWithPassenger extends RideSeatBooking {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'phone' | 'whatsapp_number'>;
}

// ─── Ride Fare Zones ────────────────────────────────────────────────────────

export interface RideFareZone {
  id: string;
  region_id: string;
  zone_from: string;
  zone_to: string;
  min_fare: number;
  max_fare: number;
  created_at: string;
}

// ─── Ride Saved Places ──────────────────────────────────────────────────────

export interface RideSavedPlace {
  id: string;
  user_id: string;
  label: string;
  place_name: string;
  created_at: string;
}

// ─── Ride Location (future mobile app) ──────────────────────────────────────

export interface RideLocation {
  id: string;
  ride_request_id: string | null;
  driver_id: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  updated_at: string;
}

// ─── Storefronts ─────────────────────────────────────────────────────────────

export interface Storefront {
  id: string;
  user_id: string | null;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  brand_color: string;
  accent_color: string;
  whatsapp: string | null;
  region_id: string | null;
  address: string | null;
  is_published: boolean;
  claim_code: string | null;
  template: string | null;
  created_at: string;
  updated_at: string;
}

export interface StorefrontCategory {
  id: string;
  storefront_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface StorefrontItem {
  id: string;
  storefront_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | null;
  price_note: string | null;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  total_stock: number | null;
  stock_remaining: number | null;
  expiration_date: string | null;
  low_stock_alert: number | null;
  created_at: string;
}

export interface StorefrontWithDetails extends Storefront {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'is_verified_business'>;
  regions: Pick<Region, 'name' | 'slug'> | null;
  storefront_categories: StorefrontCategory[];
  storefront_items: StorefrontItem[];
}
