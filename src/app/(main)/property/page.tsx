'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Home,
  Building2,
  DoorOpen,
  LandPlot,
  Store,
  BedDouble,
  Bath,
  MapPin,
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  Plus,
  BadgeCheck,
} from 'lucide-react';
import { cn, formatPrice, timeAgo } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useRegion } from '@/context/RegionContext';
import type { PropertyListingWithDetails, PropertyType, ListingMode } from '@/types/database';

// ---------- Helpers ----------

const PROPERTY_TYPE_ICONS: Record<PropertyType, typeof Home> = {
  house: Home,
  apartment: Building2,
  room: DoorOpen,
  land: LandPlot,
  commercial: Store,
};

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'House',
  apartment: 'Apartment',
  room: 'Room',
  land: 'Land',
  commercial: 'Commercial',
};

const PLACEHOLDER_GRADIENTS: Record<PropertyType, string> = {
  house: 'from-emerald-400 to-teal-600',
  apartment: 'from-sky-400 to-blue-600',
  room: 'from-violet-400 to-purple-600',
  land: 'from-lime-400 to-green-600',
  commercial: 'from-amber-400 to-orange-600',
};

const BEDROOM_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
];

const PRICE_RANGES_RENT = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under $50K', min: 0, max: 50000 },
  { label: '$50K - $100K', min: 50000, max: 100000 },
  { label: '$100K - $200K', min: 100000, max: 200000 },
  { label: '$200K+', min: 200000, max: Infinity },
];

const PRICE_RANGES_SALE = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under $10M', min: 0, max: 10000000 },
  { label: '$10M - $30M', min: 10000000, max: 30000000 },
  { label: '$30M - $60M', min: 30000000, max: 60000000 },
  { label: '$60M+', min: 60000000, max: Infinity },
];

// ---------- Component ----------

export default function PropertyBrowsePage() {
  const { propertyListings } = useData();
  const { selectedRegion } = useRegion();

  const [mode, setMode] = useState<ListingMode>('rent');
  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>('all');
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const priceRanges = mode === 'rent' ? PRICE_RANGES_RENT : PRICE_RANGES_SALE;
  const currentPriceRange = priceRanges[priceRangeIdx] ?? priceRanges[0];

  const filtered = useMemo(() => {
    return propertyListings.filter((p) => {
      // Global region filter from TopNav
      if (selectedRegion !== 'all' && p.regions.slug !== selectedRegion) return false;
      // Local filters
      if (p.listing_mode !== mode) return false;
      if (selectedType !== 'all' && p.property_type !== selectedType) return false;
      if (minBedrooms > 0 && (p.bedrooms === null || p.bedrooms < minBedrooms)) return false;
      if (p.price_amount < currentPriceRange.min || p.price_amount > currentPriceRange.max) return false;
      return true;
    }).sort((a, b) => {
      // Featured first, then newest
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [propertyListings, selectedRegion, mode, selectedType, minBedrooms, currentPriceRange]);

  const activeFilterCount =
    (selectedType !== 'all' ? 1 : 0) + (minBedrooms > 0 ? 1 : 0) + (priceRangeIdx > 0 ? 1 : 0);

  function resetFilters() {
    setSelectedType('all');
    setMinBedrooms(0);
    setPriceRangeIdx(0);
  }

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Property</h1>
        <Link
          href="/property/create"
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          List Property
        </Link>
      </div>

      {/* Rent / Sale Toggle */}
      <div className="flex bg-surface rounded-xl p-1 mb-4">
        <button
          onClick={() => { setMode('rent'); setPriceRangeIdx(0); }}
          className={cn(
            'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all',
            mode === 'rent'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:text-foreground'
          )}
        >
          For Rent
        </button>
        <button
          onClick={() => { setMode('sale'); setPriceRangeIdx(0); }}
          className={cn(
            'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all',
            mode === 'sale'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:text-foreground'
          )}
        >
          For Sale
        </button>
      </div>

      {/* Property Type Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
        <button
          onClick={() => setSelectedType('all')}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
            selectedType === 'all'
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-muted border-border hover:border-primary hover:text-primary'
          )}
        >
          All
        </button>
        {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((type) => {
          const Icon = PROPERTY_TYPE_ICONS[type];
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                selectedType === type
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted border-border hover:border-primary hover:text-primary'
              )}
            >
              <Icon size={14} />
              {PROPERTY_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all',
            showFilters || activeFilterCount > 0
              ? 'bg-primary-light text-primary border-primary'
              : 'bg-white text-muted border-border'
          )}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-sm text-primary font-medium hover:underline"
          >
            Clear all
          </button>
        )}
        <span className="ml-auto text-sm text-muted">
          {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'}
        </span>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="bg-white border border-border rounded-2xl p-4 mb-4 space-y-4">
          {/* Price Range */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
              Price Range
            </label>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, idx) => (
                <button
                  key={range.label}
                  onClick={() => setPriceRangeIdx(idx)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                    priceRangeIdx === idx
                      ? 'bg-primary-light text-primary border-primary'
                      : 'bg-surface text-muted border-border hover:border-primary'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          {selectedType !== 'land' && selectedType !== 'commercial' && (
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                Bedrooms
              </label>
              <div className="flex gap-2">
                {BEDROOM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMinBedrooms(opt.value)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all',
                      minBedrooms === opt.value
                        ? 'bg-primary-light text-primary border-primary'
                        : 'bg-surface text-muted border-border hover:border-primary'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Listings */}
      <div className="space-y-4">
        {filtered.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Home size={48} className="mx-auto text-border mb-4" />
            <p className="text-muted font-medium mb-1">No properties found</p>
            <p className="text-sm text-muted">
              Try adjusting your filters or switching between Rent and Sale.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 text-sm text-primary font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Property Card ----------

function PropertyCard({ property }: { property: PropertyListingWithDetails }) {
  const Icon = PROPERTY_TYPE_ICONS[property.property_type];
  const gradient = PLACEHOLDER_GRADIENTS[property.property_type];
  const isRent = property.listing_mode === 'rent';

  return (
    <Link
      href={`/property/${property.id}`}
      className="block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className={cn(
        'relative w-full h-48',
        property.property_listing_images[0]?.image_url ? 'bg-surface' : `bg-gradient-to-br ${gradient}`
      )}>
        {property.property_listing_images[0]?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.property_listing_images[0].image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={48} className="text-white/40" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide',
              isRent
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            )}
          >
            For {property.listing_mode}
          </span>
          {property.is_featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white">
              <Star size={10} fill="currentColor" />
              Featured
            </span>
          )}
        </div>

        {/* Owner type badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-black/50 text-white capitalize">
            {property.owner_type}
          </span>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
          <p className="text-white font-bold text-lg">
            {formatPrice(property.price_amount, property.currency)}
            {isRent && <span className="text-sm font-normal text-white/80">/mo</span>}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-base leading-snug mb-2 line-clamp-2">
          {property.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-sm text-muted mb-2">
          <span className="flex items-center gap-1">
            <Icon size={14} />
            {PROPERTY_TYPE_LABELS[property.property_type]}
          </span>
          {property.bedrooms !== null && (
            <span className="flex items-center gap-1">
              <BedDouble size={14} />
              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
          {property.bathrooms !== null && (
            <span className="flex items-center gap-1">
              <Bath size={14} />
              {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">
            {property.neighborhood_text && `${property.neighborhood_text}, `}
            {property.regions.name}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {property.profiles.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-muted truncate max-w-[140px]">
              {property.profiles.name}
            </span>
            {property.profiles.is_verified_business && (
              <BadgeCheck size={14} className="text-amber-500 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted">{timeAgo(property.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
