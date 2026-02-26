'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  AlertTriangle,
  Calendar,
  Briefcase,
  Users,
  Star,
  Home,
  Building2,
  DoorOpen,
  LandPlot,
  Store,
  BedDouble,
  Bath,
  ShoppingBag,
  BadgeCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { cn, formatPrice, timeAgo } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useRegion } from '@/context/RegionContext';
import { SearchResultsSkeleton } from '@/components/Skeletons';
import type { PostType, PropertyType } from '@/types/database';

// ─── Config ─────────────────────────────────────────────────────────────────

const POST_TYPE_CONFIG: Record<PostType, { label: string; bgClass: string; textClass: string; icon: typeof AlertTriangle }> = {
  alert: { label: 'Alert', bgClass: 'bg-tag-alert-light', textClass: 'text-tag-alert', icon: AlertTriangle },
  event: { label: 'Event', bgClass: 'bg-tag-event-light', textClass: 'text-tag-event', icon: Calendar },
  business: { label: 'Business', bgClass: 'bg-tag-business-light', textClass: 'text-tag-business', icon: Briefcase },
  community: { label: 'Community', bgClass: 'bg-tag-community-light', textClass: 'text-tag-community', icon: Users },
};

const PROPERTY_TYPE_ICONS: Record<PropertyType, typeof Home> = {
  house: Home, apartment: Building2, room: DoorOpen, land: LandPlot, commercial: Store,
};

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'House', apartment: 'Apartment', room: 'Room', land: 'Land', commercial: 'Commercial',
};

const GRADIENTS = [
  'from-emerald-400 to-teal-500', 'from-blue-400 to-indigo-500', 'from-purple-400 to-pink-500',
  'from-orange-400 to-red-500', 'from-cyan-400 to-blue-500', 'from-rose-400 to-pink-600',
];

const PROP_GRADIENTS: Record<PropertyType, string> = {
  house: 'from-emerald-400 to-teal-600', apartment: 'from-sky-400 to-blue-600',
  room: 'from-violet-400 to-purple-600', land: 'from-lime-400 to-green-600',
  commercial: 'from-amber-400 to-orange-600',
};

// ─── Search logic ───────────────────────────────────────────────────────────

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const { discoverPosts, marketListings, propertyListings } = useData();
  const { selectedRegion } = useRegion();

  if (!q.trim()) {
    return (
      <div className="px-4 py-16 text-center">
        <Search size={40} className="text-border mx-auto mb-3" />
        <p className="text-sm text-muted">Type something to search across YuhPlace</p>
      </div>
    );
  }

  const lower = q.toLowerCase();

  const matchedPosts = discoverPosts.filter((p) => {
    const matchesRegion = selectedRegion === 'all' || p.regions.slug === selectedRegion;
    const matchesQuery = p.title.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower);
    return matchesRegion && matchesQuery;
  });

  const matchedListings = marketListings.filter((l) => {
    const matchesRegion = selectedRegion === 'all' || l.regions.slug === selectedRegion;
    const matchesQuery = l.title.toLowerCase().includes(lower) || l.description.toLowerCase().includes(lower);
    return matchesRegion && matchesQuery;
  });

  const matchedProperties = propertyListings.filter((p) => {
    const matchesRegion = selectedRegion === 'all' || p.regions.slug === selectedRegion;
    const matchesQuery =
      p.title.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      (p.neighborhood_text && p.neighborhood_text.toLowerCase().includes(lower));
    return matchesRegion && matchesQuery;
  });

  const totalResults = matchedPosts.length + matchedListings.length + matchedProperties.length;

  if (totalResults === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <Search size={40} className="text-border mx-auto mb-3" />
        <h2 className="text-base font-semibold text-foreground mb-1">No results for &quot;{q}&quot;</h2>
        <p className="text-sm text-muted">Try different keywords or change the region filter</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <p className="text-xs text-muted mb-4">
        {totalResults} result{totalResults !== 1 ? 's' : ''} for &quot;{q}&quot;
      </p>

      {/* Discover Posts */}
      {matchedPosts.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-primary-light flex items-center justify-center">
              <Search size={12} className="text-primary" />
            </span>
            Discover Posts ({matchedPosts.length})
          </h2>
          <div className="flex flex-col gap-2">
            {matchedPosts.map((post) => {
              const config = POST_TYPE_CONFIG[post.post_type];
              const Icon = config.icon;
              return (
                <Link key={post.id} href={`/discover/${post.id}`} className="block">
                  <div className="bg-white border border-border/50 rounded-xl p-3 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', config.bgClass, config.textClass)}>
                        <Icon size={11} />
                        {config.label}
                      </span>
                      <span className="text-xs text-muted">{timeAgo(post.created_at)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug">{post.title}</h3>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{post.description}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted">
                      <MapPin size={11} />
                      {post.regions.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Market Listings */}
      {matchedListings.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-success-light flex items-center justify-center">
              <ShoppingBag size={12} className="text-success" />
            </span>
            Market Listings ({matchedListings.length})
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {matchedListings.map((listing, i) => (
              <Link key={listing.id} href={`/market/${listing.id}`} className="block">
                <div className={cn(
                  'bg-white border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200',
                  listing.is_featured ? 'border-featured/40 ring-1 ring-featured/20' : 'border-border/50'
                )}>
                  <div className={cn('aspect-[4/3] bg-gradient-to-br flex items-center justify-center relative', GRADIENTS[i % GRADIENTS.length])}>
                    <ShoppingBag size={24} className="text-white/40" />
                    {listing.is_featured && (
                      <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-accent text-white rounded text-[10px] font-bold">
                        <Star size={9} />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{listing.title}</h3>
                    <p className="text-sm font-bold text-primary mt-1">{formatPrice(listing.price_amount)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-muted">
                      <MapPin size={10} />
                      {listing.regions.name}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Properties */}
      {matchedProperties.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-accent-light flex items-center justify-center">
              <Home size={12} className="text-accent" />
            </span>
            Properties ({matchedProperties.length})
          </h2>
          <div className="flex flex-col gap-2">
            {matchedProperties.map((prop) => {
              const TypeIcon = PROPERTY_TYPE_ICONS[prop.property_type];
              return (
                <Link key={prop.id} href={`/property/${prop.id}`} className="block">
                  <div className="bg-white border border-border/50 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex">
                    <div className={cn('w-28 flex-shrink-0 bg-gradient-to-br flex items-center justify-center', PROP_GRADIENTS[prop.property_type])}>
                      <TypeIcon size={24} className="text-white/40" />
                    </div>
                    <div className="p-3 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded',
                          prop.listing_mode === 'rent' ? 'bg-primary-light text-primary' : 'bg-success-light text-success'
                        )}>
                          {prop.listing_mode === 'rent' ? 'Rent' : 'Sale'}
                        </span>
                        <span className="text-[10px] text-muted">{PROPERTY_TYPE_LABELS[prop.property_type]}</span>
                      </div>
                      <h3 className="text-xs font-semibold text-foreground leading-snug line-clamp-1">{prop.title}</h3>
                      <p className="text-sm font-bold text-primary mt-0.5">
                        {formatPrice(prop.price_amount)}{prop.listing_mode === 'rent' ? '/mo' : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted">
                        {prop.bedrooms && (
                          <span className="flex items-center gap-0.5"><BedDouble size={10} />{prop.bedrooms}</span>
                        )}
                        {prop.bathrooms && (
                          <span className="flex items-center gap-0.5"><Bath size={10} />{prop.bathrooms}</span>
                        )}
                        <span className="flex items-center gap-0.5"><MapPin size={10} />{prop.regions.name}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="px-4 py-4">
        <SearchResultsSkeleton />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
