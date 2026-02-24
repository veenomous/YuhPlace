'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadImages } from '@/lib/storage';
import type {
  DiscoverPostWithDetails,
  MarketListingWithDetails,
  PropertyListingWithDetails,
  PostType,
  ItemCondition,
  SellerType,
  ListingMode,
  PropertyType,
  OwnerType,
} from '@/types/database';

// ─── Fallback mock data (shown when Supabase DB is empty) ───────────────────

const FALLBACK_DISCOVER_POSTS: DiscoverPostWithDetails[] = [
  {
    id: 'd1', user_id: 'u1', region_id: 'r1', post_type: 'alert',
    title: 'Flooding on Sheriff Street - Avoid the Area',
    description: 'Heavy rainfall last night has caused serious flooding along Sheriff Street between Mandela Avenue and Orange Walk. Water level is above knee-height in some spots. Drivers should use alternative routes.',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    profiles: { id: 'u1', name: 'Ramesh Doobay', avatar_url: null, is_verified_business: false, created_at: '2024-06-15T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    discover_post_images: [],
  },
  {
    id: 'd2', user_id: 'u2', region_id: 'r2', post_type: 'event',
    title: 'Mashramani Float Parade - Route & Schedule',
    description: "The Mashramani Float Parade starts at 9 AM this Saturday from D'Urban Park to Carifesta Avenue. There will be live music, cultural performances, and food stalls along the route.",
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    profiles: { id: 'u2', name: 'Ministry of Culture', avatar_url: null, is_verified_business: true, created_at: '2024-01-10T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    discover_post_images: [{ id: 'img1', post_id: 'd2', image_url: '/placeholder-event.jpg', sort_order: 0 }],
  },
  {
    id: 'd3', user_id: 'u3', region_id: 'r3', post_type: 'business',
    title: 'New Roti Shop Opening in Berbice!',
    description: "Aunty Savi's Roti & Curry is opening this Friday at Lot 12 New Amsterdam main road. Grand opening specials: Dhalpuri roti with curry - $500 GYD.",
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    profiles: { id: 'u3', name: "Aunty Savi's Roti", avatar_url: null, is_verified_business: true, created_at: '2025-11-01T00:00:00Z' },
    regions: { name: 'Berbice', slug: 'berbice' },
    discover_post_images: [{ id: 'img2', post_id: 'd3', image_url: '/placeholder-food.jpg', sort_order: 0 }],
  },
  {
    id: 'd4', user_id: 'u4', region_id: 'r4', post_type: 'community',
    title: 'Community Clean-Up Day - East Coast Demerara',
    description: "Join us this Sunday for a community clean-up along the Enmore to Cove & John stretch. Gloves and bags provided. Refreshments will be served.",
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    profiles: { id: 'u4', name: 'Sharon Williams', avatar_url: null, is_verified_business: false, created_at: '2024-09-20T00:00:00Z' },
    regions: { name: 'East Coast Demerara', slug: 'east-coast-demerara' },
    discover_post_images: [],
  },
  {
    id: 'd5', user_id: 'u5', region_id: 'r5', post_type: 'alert',
    title: 'GPL Scheduled Power Outage - West Demerara',
    description: 'GPL has announced a scheduled power outage for West Coast Demerara from Vreed-en-Hoop to Parika. The outage will be from 9 AM to 5 PM on Wednesday.',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    profiles: { id: 'u5', name: 'David Singh', avatar_url: null, is_verified_business: false, created_at: '2025-03-08T00:00:00Z' },
    regions: { name: 'West Coast Demerara', slug: 'west-coast-demerara' },
    discover_post_images: [],
  },
  {
    id: 'd6', user_id: 'u6', region_id: 'r6', post_type: 'event',
    title: 'Linden Town Week Cultural Night',
    description: 'Linden Town Week kicks off with a Cultural Night at the Mackenzie Sports Club. Enjoy tassa drumming, folk dancing, poetry, and live chutney and reggae music.',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    profiles: { id: 'u6', name: 'Linden Events Committee', avatar_url: null, is_verified_business: false, created_at: '2024-04-12T00:00:00Z' },
    regions: { name: 'Linden', slug: 'linden' },
    discover_post_images: [{ id: 'img3', post_id: 'd6', image_url: '/placeholder-culture.jpg', sort_order: 0 }],
  },
  {
    id: 'd7', user_id: 'u7', region_id: 'r7', post_type: 'business',
    title: 'Free Wi-Fi Now at Bartica Waterfront',
    description: 'Great news for Bartica residents! The new public Wi-Fi zone is live along the Bartica Waterfront from the stelling to the market area.',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    profiles: { id: 'u7', name: 'Bartica Town Council', avatar_url: null, is_verified_business: true, created_at: '2024-02-01T00:00:00Z' },
    regions: { name: 'Bartica', slug: 'bartica' },
    discover_post_images: [],
  },
  {
    id: 'd8', user_id: 'u8', region_id: 'r8', post_type: 'community',
    title: 'Looking for Volunteers - Anna Regina Soup Kitchen',
    description: 'The Anna Regina Soup Kitchen needs volunteers for Saturday mornings. We serve 80-100 meals every weekend to elderly and vulnerable community members.',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    profiles: { id: 'u8', name: 'Patricia Ramjattan', avatar_url: null, is_verified_business: false, created_at: '2024-07-22T00:00:00Z' },
    regions: { name: 'Anna Regina', slug: 'anna-regina' },
    discover_post_images: [],
  },
];

const FALLBACK_MARKET_LISTINGS: MarketListingWithDetails[] = [
  {
    id: 'm1', user_id: 'u1', region_id: 'r1', category_id: 'c1',
    title: 'Samsung Galaxy S24 Ultra - 256GB',
    description: 'Brand new Samsung Galaxy S24 Ultra, factory unlocked, 256GB Phantom Black. Comes with original box, charger, and receipt from Courts Guyana.',
    price_amount: 385000, currency: 'GYD', condition: 'new', seller_type: 'individual',
    whatsapp_number: '+5926001234', status: 'active', is_featured: true,
    created_at: '2026-02-21T10:00:00Z', updated_at: '2026-02-21T10:00:00Z',
    profiles: { id: 'u1', name: 'Anil Persaud', avatar_url: null, is_verified_business: false, created_at: '2025-06-01T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    market_categories: { name: 'Buy & Sell', slug: 'buy-sell' },
    market_listing_images: [{ id: 'img1', listing_id: 'm1', image_url: '', sort_order: 0 }],
  },
  {
    id: 'm2', user_id: 'u2', region_id: 'r2', category_id: 'c3',
    title: '2019 Honda Civic LX - Low Mileage',
    description: 'Excellent condition 2019 Honda Civic LX, automatic transmission. Only 28,000 km. Full service history at Massy Motors.',
    price_amount: 6500000, currency: 'GYD', condition: 'used', seller_type: 'individual',
    whatsapp_number: '+5926112233', status: 'active', is_featured: true,
    created_at: '2026-02-20T14:30:00Z', updated_at: '2026-02-20T14:30:00Z',
    profiles: { id: 'u2', name: 'Devi Ramnauth', avatar_url: null, is_verified_business: false, created_at: '2025-03-15T00:00:00Z' },
    regions: { name: 'East Bank Demerara', slug: 'east-bank-demerara' },
    market_categories: { name: 'Vehicles', slug: 'vehicles' },
    market_listing_images: [{ id: 'img2', listing_id: 'm2', image_url: '', sort_order: 0 }],
  },
  {
    id: 'm3', user_id: 'u3', region_id: 'r3', category_id: 'c1',
    title: 'L-Shape Sectional Couch - Grey Fabric',
    description: 'Comfortable L-shape sectional sofa in grey fabric. Bought from Furniture Plus last year. Minor wear, no stains or tears.',
    price_amount: 180000, currency: 'GYD', condition: 'used', seller_type: 'individual',
    whatsapp_number: '+5926223344', status: 'active', is_featured: false,
    created_at: '2026-02-19T09:15:00Z', updated_at: '2026-02-19T09:15:00Z',
    profiles: { id: 'u3', name: 'Shanna Williams', avatar_url: null, is_verified_business: false, created_at: '2025-08-20T00:00:00Z' },
    regions: { name: 'East Bank Demerara', slug: 'east-bank-demerara' },
    market_categories: { name: 'Buy & Sell', slug: 'buy-sell' },
    market_listing_images: [{ id: 'img3', listing_id: 'm3', image_url: '', sort_order: 0 }],
  },
  {
    id: 'm4', user_id: 'u4', region_id: 'r1', category_id: 'c2',
    title: 'Professional Plumbing Services - 24/7',
    description: 'Licensed plumber with 15+ years experience. Available across Georgetown and surrounding areas. Pipe repairs, bathroom installations, drainage.',
    price_amount: null, currency: 'GYD', condition: 'na', seller_type: 'business',
    whatsapp_number: '+5926334455', status: 'active', is_featured: false,
    created_at: '2026-02-18T16:00:00Z', updated_at: '2026-02-18T16:00:00Z',
    profiles: { id: 'u4', name: "Singh's Plumbing", avatar_url: null, is_verified_business: true, created_at: '2024-11-01T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    market_categories: { name: 'Services', slug: 'services' },
    market_listing_images: [],
  },
  {
    id: 'm5', user_id: 'u5', region_id: 'r4', category_id: 'c2',
    title: 'Moving & Trucking Service - Island Wide',
    description: 'Reliable moving and trucking service covering all of Guyana. Household moves, office relocations, cargo transport.',
    price_amount: null, currency: 'GYD', condition: 'na', seller_type: 'business',
    whatsapp_number: '+5926445566', status: 'active', is_featured: false,
    created_at: '2026-02-17T11:45:00Z', updated_at: '2026-02-17T11:45:00Z',
    profiles: { id: 'u5', name: 'QuickMove GY', avatar_url: null, is_verified_business: true, created_at: '2025-01-10T00:00:00Z' },
    regions: { name: 'Berbice', slug: 'berbice' },
    market_categories: { name: 'Services', slug: 'services' },
    market_listing_images: [],
  },
  {
    id: 'm6', user_id: 'u6', region_id: 'r1', category_id: 'c1',
    title: '55" TCL Smart TV - 4K Android',
    description: 'TCL 55-inch 4K Android Smart TV. Model P735. Bought 3 months ago, selling because I upgraded to 65".',
    price_amount: 145000, currency: 'GYD', condition: 'used', seller_type: 'individual',
    whatsapp_number: '+5926556677', status: 'active', is_featured: false,
    created_at: '2026-02-16T08:30:00Z', updated_at: '2026-02-16T08:30:00Z',
    profiles: { id: 'u6', name: 'Marcus James', avatar_url: null, is_verified_business: false, created_at: '2025-09-05T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    market_categories: { name: 'Buy & Sell', slug: 'buy-sell' },
    market_listing_images: [{ id: 'img6', listing_id: 'm6', image_url: '', sort_order: 0 }],
  },
  {
    id: 'm7', user_id: 'u7', region_id: 'r5', category_id: 'c1',
    title: 'Kipor 8kVA Generator - Like New',
    description: 'Kipor 8kVA diesel generator in excellent condition. Used only during power outages, very low hours.',
    price_amount: 520000, currency: 'GYD', condition: 'used', seller_type: 'individual',
    whatsapp_number: '+5926667788', status: 'active', is_featured: false,
    created_at: '2026-02-15T13:20:00Z', updated_at: '2026-02-15T13:20:00Z',
    profiles: { id: 'u7', name: 'Rajesh Doodnauth', avatar_url: null, is_verified_business: false, created_at: '2025-05-22T00:00:00Z' },
    regions: { name: 'Linden', slug: 'linden' },
    market_categories: { name: 'Buy & Sell', slug: 'buy-sell' },
    market_listing_images: [{ id: 'img7', listing_id: 'm7', image_url: '', sort_order: 0 }],
  },
  {
    id: 'm8', user_id: 'u8', region_id: 'r2', category_id: 'c1',
    title: 'Construction Materials - Cement, Sand, Gravel',
    description: 'Supplying construction materials across Demerara. Cement (bags), white sand, gravel, hardcore, 3/4 stone, crusher run.',
    price_amount: null, currency: 'GYD', condition: 'new', seller_type: 'business',
    whatsapp_number: '+5926778899', status: 'active', is_featured: true,
    created_at: '2026-02-14T07:00:00Z', updated_at: '2026-02-14T07:00:00Z',
    profiles: { id: 'u8', name: 'D&R Supplies', avatar_url: null, is_verified_business: true, created_at: '2024-08-15T00:00:00Z' },
    regions: { name: 'East Coast Demerara', slug: 'east-coast-demerara' },
    market_categories: { name: 'Buy & Sell', slug: 'buy-sell' },
    market_listing_images: [],
  },
  {
    id: 'm9', user_id: 'u9', region_id: 'r1', category_id: 'c1',
    title: '6-Seater Dining Table Set - Solid Wood',
    description: 'Beautiful solid wood dining table with 6 matching chairs. Mahogany finish, very sturdy.',
    price_amount: 95000, currency: 'GYD', condition: 'used', seller_type: 'individual',
    whatsapp_number: '+5926889900', status: 'active', is_featured: false,
    created_at: '2026-02-13T15:45:00Z', updated_at: '2026-02-13T15:45:00Z',
    profiles: { id: 'u9', name: 'Camille Chen', avatar_url: null, is_verified_business: false, created_at: '2025-12-01T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    market_categories: { name: 'Buy & Sell', slug: 'buy-sell' },
    market_listing_images: [{ id: 'img9', listing_id: 'm9', image_url: '', sort_order: 0 }],
  },
  {
    id: 'm10', user_id: 'u10', region_id: 'r3', category_id: 'c3',
    title: '2021 Toyota Hilux Double Cab 4x4',
    description: 'Toyota Hilux 2021 double cab 4x4, diesel, automatic. 45,000 km. Full option: leather seats, reverse camera, push start.',
    price_amount: 14500000, currency: 'GYD', condition: 'used', seller_type: 'individual',
    whatsapp_number: '+5926990011', status: 'active', is_featured: false,
    created_at: '2026-02-12T10:10:00Z', updated_at: '2026-02-12T10:10:00Z',
    profiles: { id: 'u10', name: 'Kevin Bacchus', avatar_url: null, is_verified_business: false, created_at: '2025-04-18T00:00:00Z' },
    regions: { name: 'West Coast Demerara', slug: 'west-coast-demerara' },
    market_categories: { name: 'Vehicles', slug: 'vehicles' },
    market_listing_images: [{ id: 'img10', listing_id: 'm10', image_url: '', sort_order: 0 }],
  },
];

const FALLBACK_PROPERTY_LISTINGS: PropertyListingWithDetails[] = [
  {
    id: 'p1', user_id: 'user-1', region_id: 'region-1', listing_mode: 'rent', property_type: 'apartment',
    title: 'Modern 2-Bedroom Apartment in Georgetown',
    description: 'Spacious fully furnished 2-bedroom apartment in the heart of Georgetown. AC in both rooms, modern kitchen with appliances, secure parking.',
    price_amount: 120000, currency: 'GYD', bedrooms: 2, bathrooms: 1, neighborhood_text: 'Cummingsburg',
    owner_type: 'landlord', whatsapp_number: '5926001234', status: 'active', is_featured: true,
    created_at: '2026-02-20T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
    profiles: { id: 'user-1', name: 'Renee Singh', avatar_url: null, is_verified_business: true, created_at: '2024-06-01T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    property_listing_images: [],
  },
  {
    id: 'p2', user_id: 'user-2', region_id: 'region-1', listing_mode: 'sale', property_type: 'house',
    title: 'Elegant 3-Bedroom House in Bel Air Park',
    description: 'Beautiful 3-bedroom, 2-bathroom concrete house in Bel Air Park. Large living/dining area, covered patio, landscaped yard, and garage.',
    price_amount: 45000000, currency: 'GYD', bedrooms: 3, bathrooms: 2, neighborhood_text: 'Bel Air Park',
    owner_type: 'owner', whatsapp_number: '5926112233', status: 'active', is_featured: false,
    created_at: '2026-02-18T14:30:00Z', updated_at: '2026-02-18T14:30:00Z',
    profiles: { id: 'user-2', name: 'Marcus Thomas', avatar_url: null, is_verified_business: false, created_at: '2025-01-10T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    property_listing_images: [],
  },
  {
    id: 'p3', user_id: 'user-3', region_id: 'region-4', listing_mode: 'sale', property_type: 'land',
    title: 'Prime Residential Land - East Bank Demerara',
    description: 'Large plot of residential land on the East Bank. Perfect for building your dream home. Flat terrain, road access, all utilities at boundary.',
    price_amount: 12000000, currency: 'GYD', bedrooms: null, bathrooms: null, neighborhood_text: 'Herstelling',
    owner_type: 'owner', whatsapp_number: '5926223344', status: 'active', is_featured: false,
    created_at: '2026-02-15T09:00:00Z', updated_at: '2026-02-15T09:00:00Z',
    profiles: { id: 'user-3', name: 'David Persaud', avatar_url: null, is_verified_business: false, created_at: '2025-03-20T00:00:00Z' },
    regions: { name: 'East Bank Demerara', slug: 'east-bank-demerara' },
    property_listing_images: [],
  },
  {
    id: 'p4', user_id: 'user-4', region_id: 'region-1', listing_mode: 'rent', property_type: 'room',
    title: 'Furnished Room near University of Guyana',
    description: 'Clean, furnished room near UG Turkeyen campus. Shared kitchen and bathroom. Includes Wi-Fi, electricity, and water. Ideal for students.',
    price_amount: 35000, currency: 'GYD', bedrooms: 1, bathrooms: 1, neighborhood_text: 'Turkeyen',
    owner_type: 'landlord', whatsapp_number: '5926334455', status: 'active', is_featured: false,
    created_at: '2026-02-21T16:00:00Z', updated_at: '2026-02-21T16:00:00Z',
    profiles: { id: 'user-4', name: 'Nalini Ramphal', avatar_url: null, is_verified_business: false, created_at: '2025-07-12T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    property_listing_images: [],
  },
  {
    id: 'p5', user_id: 'user-5', region_id: 'region-1', listing_mode: 'rent', property_type: 'commercial',
    title: 'Commercial Space in Stabroek Area',
    description: 'Prime commercial space in the busy Stabroek area. Ground floor with street frontage, suitable for retail, food business, or office.',
    price_amount: 200000, currency: 'GYD', bedrooms: null, bathrooms: 1, neighborhood_text: 'Stabroek',
    owner_type: 'agent', whatsapp_number: '5926445566', status: 'active', is_featured: true,
    created_at: '2026-02-19T11:00:00Z', updated_at: '2026-02-19T11:00:00Z',
    profiles: { id: 'user-5', name: 'GY Realty Group', avatar_url: null, is_verified_business: true, created_at: '2024-02-01T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    property_listing_images: [],
  },
  {
    id: 'p6', user_id: 'user-6', region_id: 'region-4', listing_mode: 'sale', property_type: 'house',
    title: 'Modern 4-Bedroom House in Providence',
    description: 'Stunning modern 4-bedroom, 3-bathroom house in Providence. Open concept living, granite countertops, built-in wardrobes.',
    price_amount: 65000000, currency: 'GYD', bedrooms: 4, bathrooms: 3, neighborhood_text: 'Providence',
    owner_type: 'owner', whatsapp_number: '5926556677', status: 'active', is_featured: true,
    created_at: '2026-02-17T08:00:00Z', updated_at: '2026-02-17T08:00:00Z',
    profiles: { id: 'user-6', name: 'Kamini Narine', avatar_url: null, is_verified_business: false, created_at: '2025-05-18T00:00:00Z' },
    regions: { name: 'East Bank Demerara', slug: 'east-bank-demerara' },
    property_listing_images: [],
  },
  {
    id: 'p7', user_id: 'user-7', region_id: 'region-1', listing_mode: 'rent', property_type: 'apartment',
    title: 'Cozy 1-Bedroom Apartment in Kitty',
    description: 'Neat 1-bedroom apartment in Kitty. Semi-furnished with stove, fridge, and washing machine. Private entrance, gated compound.',
    price_amount: 75000, currency: 'GYD', bedrooms: 1, bathrooms: 1, neighborhood_text: 'Kitty',
    owner_type: 'landlord', whatsapp_number: '5926667788', status: 'active', is_featured: false,
    created_at: '2026-02-22T07:30:00Z', updated_at: '2026-02-22T07:30:00Z',
    profiles: { id: 'user-7', name: 'Sherry Adams', avatar_url: null, is_verified_business: false, created_at: '2025-11-01T00:00:00Z' },
    regions: { name: 'Georgetown', slug: 'georgetown' },
    property_listing_images: [],
  },
  {
    id: 'p8', user_id: 'user-8', region_id: 'region-3', listing_mode: 'sale', property_type: 'land',
    title: 'Seafront Land on West Coast Demerara',
    description: 'Rare opportunity to own seafront property on the West Coast. Approximately 1 acre with ocean views.',
    price_amount: 25000000, currency: 'GYD', bedrooms: null, bathrooms: null, neighborhood_text: 'Uitvlugt',
    owner_type: 'agent', whatsapp_number: '5926778899', status: 'active', is_featured: false,
    created_at: '2026-02-14T13:00:00Z', updated_at: '2026-02-14T13:00:00Z',
    profiles: { id: 'user-8', name: 'Premier Land Sales', avatar_url: null, is_verified_business: true, created_at: '2023-09-15T00:00:00Z' },
    regions: { name: 'West Coast Demerara', slug: 'west-coast-demerara' },
    property_listing_images: [],
  },
];

// ─── Create-item input types ────────────────────────────────────────────────

export interface CreateDiscoverPostInput {
  post_type: PostType;
  title: string;
  description: string;
  region_slug: string;
  region_name: string;
  photos?: File[];
}

export interface CreateMarketListingInput {
  title: string;
  description: string;
  category_slug: string;
  category_name: string;
  price_amount: number | null;
  condition: ItemCondition;
  seller_type: SellerType;
  whatsapp_number: string;
  region_slug: string;
  region_name: string;
  photos?: File[];
}

export interface CreatePropertyListingInput {
  listing_mode: ListingMode;
  property_type: PropertyType;
  title: string;
  description: string;
  price_amount: number;
  bedrooms: number | null;
  bathrooms: number | null;
  neighborhood_text: string;
  owner_type: OwnerType;
  whatsapp_number: string;
  region_slug: string;
  region_name: string;
  photos?: File[];
}

// ─── Context type ───────────────────────────────────────────────────────────

interface DataContextValue {
  discoverPosts: DiscoverPostWithDetails[];
  marketListings: MarketListingWithDetails[];
  propertyListings: PropertyListingWithDetails[];
  loading: boolean;

  getDiscoverPost: (id: string) => DiscoverPostWithDetails | undefined;
  getMarketListing: (id: string) => MarketListingWithDetails | undefined;
  getPropertyListing: (id: string) => PropertyListingWithDetails | undefined;

  addDiscoverPost: (input: CreateDiscoverPostInput) => Promise<{ error: string | null }>;
  addMarketListing: (input: CreateMarketListingInput) => Promise<{ error: string | null }>;
  addPropertyListing: (input: CreatePropertyListingInput) => Promise<{ error: string | null }>;

  deleteDiscoverPost: (id: string) => Promise<{ error: string | null }>;
  deleteMarketListing: (id: string) => Promise<{ error: string | null }>;
  deletePropertyListing: (id: string) => Promise<{ error: string | null }>;

  totalListings: number;
  totalPosts: number;
}

const DataContext = createContext<DataContextValue | null>(null);

// Select queries shared between initial fetch and post-insert refetch
const DISCOVER_POST_SELECT = '*, profiles(id, name, avatar_url, is_verified_business, created_at), regions(name, slug), discover_post_images(*)';
const MARKET_LISTING_SELECT = '*, profiles(id, name, avatar_url, is_verified_business, created_at), regions(name, slug), market_categories(name, slug), market_listing_images(*)';
const PROPERTY_LISTING_SELECT = '*, profiles(id, name, avatar_url, is_verified_business, created_at), regions(name, slug), property_listing_images(*)';

export function DataProvider({ children }: { children: ReactNode }) {
  const [discoverPosts, setDiscoverPosts] = useState(FALLBACK_DISCOVER_POSTS);
  const [marketListings, setMarketListings] = useState(FALLBACK_MARKET_LISTINGS);
  const [propertyListings, setPropertyListings] = useState(FALLBACK_PROPERTY_LISTINGS);
  const [loading, setLoading] = useState(true);

  // Lookup maps: slug → UUID (populated on mount)
  const [regionMap, setRegionMap] = useState<Map<string, string>>(new Map());
  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());

  // Fetch real data + lookup tables from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        const [postsRes, listingsRes, propertiesRes, regionsRes, categoriesRes] = await Promise.all([
          supabase
            .from('discover_posts')
            .select(DISCOVER_POST_SELECT)
            .eq('status', 'active')
            .order('created_at', { ascending: false }),
          supabase
            .from('market_listings')
            .select(MARKET_LISTING_SELECT)
            .eq('status', 'active')
            .order('created_at', { ascending: false }),
          supabase
            .from('property_listings')
            .select(PROPERTY_LISTING_SELECT)
            .eq('status', 'active')
            .order('created_at', { ascending: false }),
          supabase.from('regions').select('id, slug'),
          supabase.from('market_categories').select('id, slug'),
        ]);

        // Build lookup maps
        if (regionsRes.data) {
          setRegionMap(new Map(regionsRes.data.map((r) => [r.slug, r.id])));
        }
        if (categoriesRes.data) {
          setCategoryMap(new Map(categoriesRes.data.map((c) => [c.slug, c.id])));
        }

        // Merge real Supabase data (shown first) with fallback mock data
        const realPosts = (postsRes.data ?? []) as unknown as DiscoverPostWithDetails[];
        setDiscoverPosts([...realPosts, ...FALLBACK_DISCOVER_POSTS]);

        const realListings = (listingsRes.data ?? []) as unknown as MarketListingWithDetails[];
        setMarketListings([...realListings, ...FALLBACK_MARKET_LISTINGS]);

        const realProperties = (propertiesRes.data ?? []) as unknown as PropertyListingWithDetails[];
        setPropertyListings([...realProperties, ...FALLBACK_PROPERTY_LISTINGS]);
      } catch {
        // Silently keep fallback data on error
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getDiscoverPost = useCallback(
    (id: string) => discoverPosts.find((p) => p.id === id),
    [discoverPosts],
  );

  const getMarketListing = useCallback(
    (id: string) => marketListings.find((l) => l.id === id),
    [marketListings],
  );

  const getPropertyListing = useCallback(
    (id: string) => propertyListings.find((p) => p.id === id),
    [propertyListings],
  );

  const addDiscoverPost = useCallback(async (input: CreateDiscoverPostInput): Promise<{ error: string | null }> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be signed in to post.' };

    const regionId = regionMap.get(input.region_slug);
    if (!regionId) return { error: 'Invalid region selected.' };

    const { data: inserted, error: insertError } = await supabase
      .from('discover_posts')
      .insert({
        user_id: user.id,
        region_id: regionId,
        post_type: input.post_type,
        title: input.title,
        description: input.description,
      })
      .select('id')
      .single();

    if (insertError) return { error: insertError.message };

    // Upload photos if provided (non-fatal — post was already created)
    if (input.photos && input.photos.length > 0) {
      const { urls } = await uploadImages(input.photos, 'discover', inserted.id);
      if (urls.length > 0) {
        const imageRecords = urls.map((url, idx) => ({
          post_id: inserted.id,
          image_url: url,
          sort_order: idx,
        }));
        await supabase.from('discover_post_images').insert(imageRecords);
      }
    }

    // Refetch with full joins
    const { data: full } = await supabase
      .from('discover_posts')
      .select(DISCOVER_POST_SELECT)
      .eq('id', inserted.id)
      .single();

    if (full) {
      setDiscoverPosts((prev) => [full as unknown as DiscoverPostWithDetails, ...prev]);
    }

    return { error: null };
  }, [regionMap]);

  const addMarketListing = useCallback(async (input: CreateMarketListingInput): Promise<{ error: string | null }> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be signed in to create a listing.' };

    const regionId = regionMap.get(input.region_slug);
    if (!regionId) return { error: 'Invalid region selected.' };

    const categoryId = categoryMap.get(input.category_slug);
    if (!categoryId) return { error: 'Invalid category selected.' };

    const { data: inserted, error: insertError } = await supabase
      .from('market_listings')
      .insert({
        user_id: user.id,
        region_id: regionId,
        category_id: categoryId,
        title: input.title,
        description: input.description,
        price_amount: input.price_amount,
        condition: input.condition,
        seller_type: input.seller_type,
        whatsapp_number: input.whatsapp_number,
      })
      .select('id')
      .single();

    if (insertError) return { error: insertError.message };

    // Upload photos if provided (non-fatal — listing was already created)
    if (input.photos && input.photos.length > 0) {
      const { urls } = await uploadImages(input.photos, 'market', inserted.id);
      if (urls.length > 0) {
        const imageRecords = urls.map((url, idx) => ({
          listing_id: inserted.id,
          image_url: url,
          sort_order: idx,
        }));
        await supabase.from('market_listing_images').insert(imageRecords);
      }
    }

    // Refetch with full joins
    const { data: full } = await supabase
      .from('market_listings')
      .select(MARKET_LISTING_SELECT)
      .eq('id', inserted.id)
      .single();

    if (full) {
      setMarketListings((prev) => [full as unknown as MarketListingWithDetails, ...prev]);
    }

    return { error: null };
  }, [regionMap, categoryMap]);

  const addPropertyListing = useCallback(async (input: CreatePropertyListingInput): Promise<{ error: string | null }> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be signed in to create a listing.' };

    const regionId = regionMap.get(input.region_slug);
    if (!regionId) return { error: 'Invalid region selected.' };

    const { data: inserted, error: insertError } = await supabase
      .from('property_listings')
      .insert({
        user_id: user.id,
        region_id: regionId,
        listing_mode: input.listing_mode,
        property_type: input.property_type,
        title: input.title,
        description: input.description,
        price_amount: input.price_amount,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        neighborhood_text: input.neighborhood_text || null,
        owner_type: input.owner_type,
        whatsapp_number: input.whatsapp_number,
      })
      .select('id')
      .single();

    if (insertError) return { error: insertError.message };

    // Upload photos if provided (non-fatal — listing was already created)
    if (input.photos && input.photos.length > 0) {
      const { urls } = await uploadImages(input.photos, 'property', inserted.id);
      if (urls.length > 0) {
        const imageRecords = urls.map((url, idx) => ({
          property_listing_id: inserted.id,
          image_url: url,
          sort_order: idx,
        }));
        await supabase.from('property_listing_images').insert(imageRecords);
      }
    }

    // Refetch with full joins
    const { data: full } = await supabase
      .from('property_listings')
      .select(PROPERTY_LISTING_SELECT)
      .eq('id', inserted.id)
      .single();

    if (full) {
      setPropertyListings((prev) => [full as unknown as PropertyListingWithDetails, ...prev]);
    }

    return { error: null };
  }, [regionMap]);

  const deleteDiscoverPost = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const supabase = createClient();
    const { error } = await supabase.from('discover_posts').update({ status: 'removed' }).eq('id', id);
    if (error) return { error: error.message };
    setDiscoverPosts((prev) => prev.filter((p) => p.id !== id));
    return { error: null };
  }, []);

  const deleteMarketListing = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const supabase = createClient();
    const { error } = await supabase.from('market_listings').update({ status: 'removed' }).eq('id', id);
    if (error) return { error: error.message };
    setMarketListings((prev) => prev.filter((l) => l.id !== id));
    return { error: null };
  }, []);

  const deletePropertyListing = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const supabase = createClient();
    const { error } = await supabase.from('property_listings').update({ status: 'removed' }).eq('id', id);
    if (error) return { error: error.message };
    setPropertyListings((prev) => prev.filter((p) => p.id !== id));
    return { error: null };
  }, []);

  return (
    <DataContext.Provider
      value={{
        discoverPosts,
        marketListings,
        propertyListings,
        loading,
        getDiscoverPost,
        getMarketListing,
        getPropertyListing,
        addDiscoverPost,
        addMarketListing,
        addPropertyListing,
        deleteDiscoverPost,
        deleteMarketListing,
        deletePropertyListing,
        totalListings: marketListings.length + propertyListings.length,
        totalPosts: discoverPosts.length,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
