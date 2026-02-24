'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  ChevronDown,
  ShoppingBag,
  Wrench,
  Car,
  Package,
} from 'lucide-react';
import { formatPrice, timeAgo, cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useRegion } from '@/context/RegionContext';
import { MarketFeedSkeleton } from '@/components/Skeletons';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { MarketListingWithDetails } from '@/types/database';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'all', name: 'All', icon: Package },
  { slug: 'buy-sell', name: 'Buy & Sell', icon: ShoppingBag },
  { slug: 'services', name: 'Services', icon: Wrench },
  { slug: 'vehicles', name: 'Vehicles', icon: Car },
];

const PAGE_REGIONS = [
  { slug: 'all', name: 'All Regions' },
  { slug: 'georgetown', name: 'Georgetown' },
  { slug: 'east-coast-demerara', name: 'East Coast Demerara' },
  { slug: 'west-coast-demerara', name: 'West Coast Demerara' },
  { slug: 'east-bank-demerara', name: 'East Bank Demerara' },
  { slug: 'west-bank-demerara', name: 'West Bank Demerara' },
  { slug: 'berbice', name: 'Berbice' },
  { slug: 'linden', name: 'Linden' },
  { slug: 'essequibo', name: 'Essequibo' },
];

type SortOption = 'latest' | 'price-low' | 'price-high';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'price-low', label: 'Price: Low-High' },
  { value: 'price-high', label: 'Price: High-Low' },
];

// Gradient placeholders for listing images
const GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-orange-400 to-red-500',
  'from-cyan-400 to-blue-500',
  'from-rose-400 to-fuchsia-500',
  'from-amber-400 to-orange-500',
  'from-lime-400 to-green-500',
  'from-violet-400 to-purple-500',
  'from-teal-400 to-cyan-500',
];

export default function MarketPage() {
  const { marketListings, loading } = useData();
  const { selectedRegion: globalRegion } = useRegion();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [regionOpen, setRegionOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Sync in-page region filter when global TopNav region changes
  useEffect(() => {
    if (globalRegion !== 'all') {
      setSelectedRegion(globalRegion);
    }
  }, [globalRegion]);

  const filteredListings = useMemo(() => {
    let results = [...marketListings];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      results = results.filter(
        (l) => l.market_categories.slug === selectedCategory
      );
    }

    // Region filter
    if (selectedRegion !== 'all') {
      results = results.filter((l) => l.regions.slug === selectedRegion);
    }

    // Sort
    switch (sortBy) {
      case 'latest':
        results.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'price-low':
        results.sort(
          (a, b) => (a.price_amount ?? Infinity) - (b.price_amount ?? Infinity)
        );
        break;
      case 'price-high':
        results.sort(
          (a, b) => (b.price_amount ?? -1) - (a.price_amount ?? -1)
        );
        break;
    }

    // Featured listings first
    results.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));

    return results;
  }, [marketListings, searchQuery, selectedCategory, selectedRegion, sortBy]);

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll(filteredListings);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {CATEGORIES.map(({ slug, name, icon: Icon }) => (
          <button
            key={slug}
            onClick={() => setSelectedCategory(slug)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0',
              selectedCategory === slug
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-muted border border-border hover:border-primary/30 hover:text-foreground'
            )}
          >
            <Icon size={15} />
            {name}
          </button>
        ))}
      </div>

      {/* Filter Row: Region + Sort */}
      <div className="flex items-center justify-between gap-2">
        {/* Region Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setRegionOpen(!regionOpen);
              setSortOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted border border-border rounded-lg hover:border-primary/30 hover:text-foreground transition-all"
          >
            <MapPin size={14} />
            <span className="max-w-[120px] truncate">
              {PAGE_REGIONS.find((r) => r.slug === selectedRegion)?.name}
            </span>
            <ChevronDown size={14} />
          </button>
          {regionOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRegionOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[200px] max-h-[260px] overflow-y-auto">
                {PAGE_REGIONS.map((region) => (
                  <button
                    key={region.slug}
                    onClick={() => {
                      setSelectedRegion(region.slug);
                      setRegionOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm hover:bg-surface transition-colors',
                      selectedRegion === region.slug
                        ? 'text-primary font-medium'
                        : 'text-foreground'
                    )}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setSortOpen(!sortOpen);
              setRegionOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted border border-border rounded-lg hover:border-primary/30 hover:text-foreground transition-all"
          >
            <SlidersHorizontal size={14} />
            <span>
              {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
            </span>
            <ChevronDown size={14} />
          </button>
          {sortOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setSortOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[170px]">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm hover:bg-surface transition-colors',
                      sortBy === option.value
                        ? 'text-primary font-medium'
                        : 'text-foreground'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-xs text-muted">
        {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
      </p>

      {/* Listings Grid */}
      {loading ? (
        <MarketFeedSkeleton />
      ) : filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag size={48} className="text-border mb-3" />
          <p className="text-muted text-sm font-medium">No listings found</p>
          <p className="text-muted/60 text-xs mt-1">
            Try adjusting your filters or search
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visibleItems.map((listing, index) => (
            <Link
              key={listing.id}
              href={`/market/${listing.id}`}
              className="group bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-primary/20"
            >
              {/* Image */}
              <div
                className={cn(
                  'relative w-full aspect-[4/3]',
                  listing.market_listing_images[0]?.image_url
                    ? 'bg-surface'
                    : `bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]}`
                )}
              >
                {listing.market_listing_images[0]?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.market_listing_images[0].image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {listing.market_categories.slug === 'vehicles' ? (
                      <Car size={32} className="text-white/50" />
                    ) : listing.market_categories.slug === 'services' ? (
                      <Wrench size={32} className="text-white/50" />
                    ) : (
                      <ShoppingBag size={32} className="text-white/50" />
                    )}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {listing.is_featured && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-accent text-white text-[10px] font-semibold rounded-full shadow-sm">
                      <Star size={10} fill="currentColor" />
                      Featured
                    </span>
                  )}
                  {listing.condition !== 'na' && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-semibold rounded-full shadow-sm',
                        listing.condition === 'new'
                          ? 'bg-primary text-white'
                          : 'bg-white/90 text-foreground'
                      )}
                    >
                      {listing.condition === 'new' ? 'New' : 'Used'}
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="p-2.5 space-y-1">
                <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {listing.title}
                </h3>
                <p className="text-sm font-bold text-primary">
                  {formatPrice(listing.price_amount, listing.currency)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-0.5 text-[11px] text-muted">
                    <MapPin size={10} />
                    {listing.regions.name}
                  </span>
                  {listing.seller_type === 'business' && (
                    <span className="text-[10px] font-medium text-primary bg-primary-light px-1.5 py-0.5 rounded">
                      Biz
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted/60">
                  {timeAgo(listing.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}
