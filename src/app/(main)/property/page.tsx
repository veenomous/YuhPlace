'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Plus,
  BadgeCheck,
  MessageSquare,
  Search,
  Eye,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { cn, formatPrice, timeAgo } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useRegion } from '@/context/RegionContext';
import { PropertyFeedSkeleton } from '@/components/Skeletons';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import SellerRating from '@/components/SellerRating';
import VerifiedPartner from '@/components/VerifiedPartner';
import HomeServiceRequestModal from '@/components/HomeServiceRequestModal';
import { Plane } from 'lucide-react';
import type { PropertyListingWithDetails, PropertyType, ListingMode } from '@/types/database';

// ─── Constants ───────────────────────────────────────────────────────────────

const PROPERTY_TYPE_ICONS: Record<PropertyType, typeof Home> = {
  house: Home, apartment: Building2, room: DoorOpen, land: LandPlot, commercial: Store,
};

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'House', apartment: 'Apartment', room: 'Room', land: 'Land', commercial: 'Commercial',
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
  { label: '$50K–$100K', min: 50000, max: 100000 },
  { label: '$100K–$200K', min: 100000, max: 200000 },
  { label: '$200K+', min: 200000, max: Infinity },
];

const PRICE_RANGES_SALE = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under $10M', min: 0, max: 10000000 },
  { label: '$10M–$30M', min: 10000000, max: 30000000 },
  { label: '$30M–$60M', min: 30000000, max: 60000000 },
  { label: '$60M+', min: 60000000, max: Infinity },
];

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PropertyBrowsePage() {
  const { propertyListings, loading, commentCounts } = useData();
  const { selectedRegion } = useRegion();

  const [mode, setMode] = useState<ListingMode>('rent');
  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>('all');
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingModalOpen, setViewingModalOpen] = useState(false);

  const priceRanges = mode === 'rent' ? PRICE_RANGES_RENT : PRICE_RANGES_SALE;
  const currentPriceRange = priceRanges[priceRangeIdx] ?? priceRanges[0];

  const filtered = useMemo(() => {
    return propertyListings.filter((p) => {
      if (selectedRegion !== 'all' && p.regions.slug !== selectedRegion) return false;
      if (p.listing_mode !== mode) return false;
      if (selectedType !== 'all' && p.property_type !== selectedType) return false;
      if (minBedrooms > 0 && (p.bedrooms === null || p.bedrooms < minBedrooms)) return false;
      if (p.price_amount < currentPriceRange.min || p.price_amount > currentPriceRange.max) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [propertyListings, selectedRegion, mode, selectedType, minBedrooms, currentPriceRange, searchQuery]);

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll(filtered);

  const activeFilterCount =
    (selectedType !== 'all' ? 1 : 0) + (minBedrooms > 0 ? 1 : 0) + (priceRangeIdx > 0 ? 1 : 0);

  function resetFilters() {
    setSelectedType('all');
    setMinBedrooms(0);
    setPriceRangeIdx(0);
    setSearchQuery('');
  }

  // Split featured from rest
  const featuredItems = visibleItems.filter((p) => p.is_featured);
  const regularItems = visibleItems.filter((p) => !p.is_featured);

  return (
    <div style={{ backgroundColor: '#fcf9f8', color: '#1c1b1b' }}>

      {/* ── Hero ── */}
      <section className="relative min-h-[280px] sm:min-h-[360px] flex items-end overflow-hidden rounded-b-[1.5rem]">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="w-full h-full object-cover brightness-[0.65]" alt="Guyana property" src="/Georgetown.png" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,27,27,0.8) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 w-full px-4 pb-5 pt-16">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white mb-4 leading-[0.9]"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Find Your Place<br />
              <span style={{ color: '#a3f69e' }}>in Guyana.</span>
            </motion.h1>

            {/* Search Shell */}
            <motion.div
              variants={fadeUp}
              className="rounded-xl p-1 flex items-center gap-1 backdrop-blur-md"
              style={{ backgroundColor: 'rgba(252,249,248,0.95)' }}
            >
              <div className="flex-1 px-3 py-2.5 flex items-center gap-2">
                <MapPin size={16} style={{ color: '#196a24' }} />
                <input
                  className="bg-transparent border-none focus:ring-0 focus:outline-none w-full font-medium text-sm"
                  placeholder="Where do you want to live?"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ color: '#1c1b1b' }}
                />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setMode('rent'); setPriceRangeIdx(0); }}
                  className="px-3 py-2.5 rounded-lg font-bold text-xs transition-all"
                  style={{
                    backgroundColor: mode === 'rent' ? '#196a24' : 'transparent',
                    color: mode === 'rent' ? '#fff' : '#40493d',
                  }}
                >
                  Rent
                </button>
                <button
                  onClick={() => { setMode('sale'); setPriceRangeIdx(0); }}
                  className="px-3 py-2.5 rounded-lg font-bold text-xs transition-all"
                  style={{
                    backgroundColor: mode === 'sale' ? '#196a24' : 'transparent',
                    color: mode === 'sale' ? '#fff' : '#40493d',
                  }}
                >
                  Buy
                </button>
                <button
                  className="px-3 py-2.5 rounded-lg font-bold text-xs text-white flex items-center gap-1.5"
                  style={{ backgroundColor: '#196a24' }}
                >
                  <Search size={14} /> Search
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Diaspora strip: Request a viewing ── */}
      <section className="px-4 pt-3">
        <button
          onClick={() => setViewingModalOpen(true)}
          className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all hover:shadow-md active:scale-[0.99]"
          style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1667B7' }}>
            <Plane size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight" style={{ color: '#114B8A', fontFamily: 'var(--font-headline)' }}>
              Abroad? We&rsquo;ll tour any listing for you.
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: '#1E3A8A' }}>
              Vetted agents. Video + photos in 48 hours. No account needed.
            </p>
          </div>
          <ArrowRight size={16} style={{ color: '#114B8A' }} className="flex-shrink-0" />
        </button>
      </section>

      {/* ── Category Chips ── */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedType('all')}
            className="flex-none shadow-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-bold"
            style={{
              backgroundColor: selectedType === 'all' ? '#196a24' : '#fff',
              color: selectedType === 'all' ? '#fff' : '#1c1b1b',
              fontFamily: 'var(--font-headline)',
            }}
          >
            <Home size={16} style={{ color: selectedType === 'all' ? '#fff' : '#196a24' }} />
            All
          </button>
          {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((type) => {
            const Icon = PROPERTY_TYPE_ICONS[type];
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="flex-none shadow-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-bold"
                style={{
                  backgroundColor: isActive ? '#196a24' : '#fff',
                  color: isActive ? '#fff' : '#1c1b1b',
                  fontFamily: 'var(--font-headline)',
                }}
              >
                <Icon size={16} style={{ color: isActive ? '#fff' : '#196a24' }} />
                {PROPERTY_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Section Header + Filters ── */}
      <section className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold uppercase tracking-widest text-[10px] mb-1 block" style={{ color: '#196a24' }}>
              Curated Collection
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
              {mode === 'rent' ? 'Properties for Rent' : 'Properties for Sale'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/property/create"
              className="text-white px-3 py-2 rounded-lg font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #196a24, #36843a)' }}
            >
              <Plus size={13} /> List
            </Link>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all"
              style={{
                backgroundColor: showFilters || activeFilterCount > 0 ? '#196a24' : '#f0edec',
                color: showFilters || activeFilterCount > 0 ? '#fff' : '#40493d',
              }}
            >
              <SlidersHorizontal size={13} />
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: '#f1e340', color: '#6c6400' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl p-4 mb-3 space-y-4"
            style={{ backgroundColor: '#f0edec' }}
          >
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(64,73,61,0.6)' }}>
                Price Range
              </label>
              <div className="flex flex-wrap gap-1.5">
                {priceRanges.map((range, idx) => (
                  <button
                    key={range.label}
                    onClick={() => setPriceRangeIdx(idx)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: priceRangeIdx === idx ? '#196a24' : '#fff',
                      color: priceRangeIdx === idx ? '#fff' : '#40493d',
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            {selectedType !== 'land' && selectedType !== 'commercial' && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(64,73,61,0.6)' }}>
                  Bedrooms
                </label>
                <div className="flex gap-1.5">
                  {BEDROOM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMinBedrooms(opt.value)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: minBedrooms === opt.value ? '#196a24' : '#fff',
                        color: minBedrooms === opt.value ? '#fff' : '#40493d',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="text-xs font-semibold" style={{ color: '#196a24' }}>
                Clear all filters
              </button>
            )}
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(64,73,61,0.5)' }}>
            {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
          </p>
          <button className="text-xs font-bold flex items-center gap-1 transition-transform hover:translate-x-1" style={{ color: '#196a24' }}>
            View all <ArrowRight size={12} />
          </button>
        </div>
      </section>

      {/* ── Property Grid ── */}
      <section className="px-4 pb-6">
        {loading ? (
          <PropertyFeedSkeleton />
        ) : filtered.length === 0 ? (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f0edec' }}>
              <Home size={22} style={{ color: '#40493d' }} />
            </div>
            <p className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-headline)' }}>No properties found</p>
            <p className="text-xs mb-3" style={{ color: '#40493d' }}>Try adjusting your filters</p>
            <button onClick={resetFilters} className="text-xs font-semibold" style={{ color: '#196a24' }}>Clear all filters</button>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-12 gap-3" initial="hidden" animate="visible" variants={stagger}>

            {/* Featured items — larger cards */}
            {featuredItems.map((property, idx) => (
              <motion.div
                key={property.id}
                variants={cardVariants}
                className={cn(idx === 0 ? 'col-span-8' : 'col-span-4', 'col-span-12 sm:col-span-8 first:sm:col-span-8 [&:nth-child(2)]:sm:col-span-4')}
                style={{ gridColumn: idx === 0 ? 'span 8' : 'span 4' }}
              >
                <Link href={`/property/${property.id}`} className="block group">
                  <div className={cn('relative overflow-hidden rounded-2xl', idx === 0 ? 'h-[220px] sm:h-[300px]' : 'h-[220px] sm:h-[300px]')} style={{ backgroundColor: '#f6f3f2' }}>
                    {property.property_listing_images[0]?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" src={property.property_listing_images[0].image_url} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {(() => { const Icon = PROPERTY_TYPE_ICONS[property.property_type]; return <Icon size={40} style={{ color: 'rgba(64,73,61,0.15)' }} />; })()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <div className="flex gap-1.5 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ backgroundColor: '#196a24' }}>
                          {property.listing_mode === 'rent' ? 'Rent' : 'Sale'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                          Featured
                        </span>
                        {property.profiles.is_verified_partner && (
                          <VerifiedPartner partnerName={property.profiles.partner_name ?? null} size="xs" />
                        )}
                      </div>
                      <h3 className={cn('font-bold leading-tight', idx === 0 ? 'text-lg sm:text-2xl' : 'text-sm sm:text-lg')} style={{ fontFamily: 'var(--font-headline)' }}>
                        {property.title}
                      </h3>
                      <p className="text-white/70 text-xs sm:text-sm mt-0.5">
                        {property.neighborhood_text && `${property.neighborhood_text}, `}{property.regions.name} &bull; {formatPrice(property.price_amount, property.currency)}
                        {property.listing_mode === 'rent' && '/mo'}
                      </p>
                      {idx === 0 && (
                        <div className="flex items-center gap-3 mt-2 text-[10px] sm:text-xs">
                          {property.bedrooms !== null && (
                            <span className="flex items-center gap-1"><BedDouble size={12} style={{ color: '#a3f69e' }} /> {property.bedrooms} Beds</span>
                          )}
                          {property.bathrooms !== null && (
                            <span className="flex items-center gap-1"><Bath size={12} style={{ color: '#a3f69e' }} /> {property.bathrooms} Baths</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Regular items — 3-column grid of smaller overlay cards */}
            {regularItems.map((property) => (
              <motion.div key={property.id} variants={cardVariants} className="col-span-6 sm:col-span-4">
                <Link href={`/property/${property.id}`} className="block group">
                  <div className="relative overflow-hidden rounded-2xl h-[180px] sm:h-[220px]" style={{ backgroundColor: '#f6f3f2' }}>
                    {property.property_listing_images[0]?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" src={property.property_listing_images[0].image_url} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {(() => { const Icon = PROPERTY_TYPE_ICONS[property.property_type]; return <Icon size={32} style={{ color: 'rgba(64,73,61,0.15)' }} />; })()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                    {/* Mode badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase" style={{ backgroundColor: property.listing_mode === 'rent' ? '#196a24' : '#f1e340', color: property.listing_mode === 'rent' ? '#fff' : '#6c6400' }}>
                        {property.listing_mode === 'rent' ? 'Rent' : 'Sale'}
                      </span>
                    </div>

                    <div className="absolute inset-0 p-3 flex flex-col justify-end">
                      <h3 className="text-white text-sm font-bold leading-tight line-clamp-2" style={{ fontFamily: 'var(--font-headline)' }}>
                        {property.title}
                      </h3>
                      <p className="text-white/80 text-xs mt-0.5">
                        {formatPrice(property.price_amount, property.currency)}
                        {property.listing_mode === 'rent' && '/mo'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-white/60 text-[10px]">
                        <span className="flex items-center gap-0.5">
                          <MapPin size={9} /> {property.regions.name}
                        </span>
                        {property.bedrooms !== null && (
                          <span className="flex items-center gap-0.5"><BedDouble size={9} /> {property.bedrooms}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        {hasMore && <div ref={sentinelRef} className="h-4" />}
      </section>

      {/* ── Features Section ── */}
      <section className="px-4 py-10" style={{ backgroundColor: '#f6f3f2' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-extrabold tracking-tighter mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Seamless Property <span className="italic" style={{ color: '#196a24' }}>Discovery</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm leading-relaxed mb-6 max-w-md" style={{ color: '#40493d' }}>
            YuhPlace makes finding your next home in Guyana effortless — from first search to final key.
          </motion.p>
          <div className="space-y-2.5">
            {[
              { icon: Eye, title: 'Photo Galleries', desc: 'Browse detailed photos before visiting.' },
              { icon: ShieldCheck, title: 'Verified Listings', desc: 'Every property checked by our team.' },
              { icon: MessageCircle, title: 'Direct Chat', desc: 'Connect instantly with owners and agents.' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className="p-4 rounded-xl flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: '#fcf9f8' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(25,106,36,0.1)' }}>
                    <Icon size={18} style={{ color: '#196a24' }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ fontFamily: 'var(--font-headline)' }}>{feature.title}</h4>
                    <p className="text-xs" style={{ color: '#40493d' }}>{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <HomeServiceRequestModal
        open={viewingModalOpen}
        onClose={() => setViewingModalOpen(false)}
        defaultService="property_viewing"
      />
    </div>
  );
}
