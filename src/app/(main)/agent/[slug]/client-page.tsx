'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Home,
  Building2,
  DoorOpen,
  LandPlot,
  Store,
  BedDouble,
  Bath,
  Plane,
  ShieldCheck,
  MessageCircle,
  Share2,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';
import { cn, formatWhatsAppLink, memberSince } from '@/lib/utils';
import { formatPriceIn } from '@/lib/currency';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import HomeServiceRequestModal from '@/components/HomeServiceRequestModal';
import type { PropertyListingWithDetails, PropertyType } from '@/types/database';

interface Agent {
  id: string;
  name: string;
  avatar_url: string | null;
  partner_name: string | null;
  partner_logo_url: string | null;
  partner_slug: string;
  partner_tagline: string | null;
  partner_bio: string | null;
  partner_banner_url: string | null;
  whatsapp_number: string | null;
  phone: string | null;
  created_at: string;
}

const PROPERTY_TYPE_ICONS: Record<PropertyType, typeof Home> = {
  house: Home,
  apartment: Building2,
  room: DoorOpen,
  land: LandPlot,
  commercial: Store,
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

function ListingCard({
  listing,
  archived,
  displayCurrency,
}: {
  listing: PropertyListingWithDetails;
  archived: boolean;
  displayCurrency: Parameters<typeof formatPriceIn>[2];
}) {
  const isRent = listing.listing_mode === 'rent';
  const Icon = PROPERTY_TYPE_ICONS[listing.property_type];
  const hero = listing.property_listing_images[0]?.image_url;

  return (
    <Link href={`/property/${listing.id}`} className="block group">
      <div
        className="relative overflow-hidden rounded-2xl h-[200px] sm:h-[240px]"
        style={{ backgroundColor: '#f6f3f2' }}
      >
        {hero ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={hero}
            alt=""
            className={cn(
              'w-full h-full object-cover transition-transform duration-700 group-hover:scale-105',
              archived && 'grayscale brightness-90',
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={32} style={{ color: 'rgba(64,73,61,0.2)' }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
            style={{ backgroundColor: archived ? 'rgba(0,0,0,0.6)' : '#196a24', color: '#fff' }}
          >
            {archived ? (listing.status === 'sold' ? 'Sold' : 'Rented') : isRent ? 'Rent' : 'Sale'}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-1" style={{ fontFamily: 'var(--font-headline)' }}>
            {listing.title}
          </h3>
          <p className="text-xs text-white/80">
            {formatPriceIn(listing.price_amount, listing.currency, displayCurrency)}
            {isRent && '/mo'}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-white/70">
            <span className="flex items-center gap-0.5"><MapPin size={9} /> {listing.regions.name}</span>
            {listing.bedrooms !== null && (
              <span className="flex items-center gap-0.5"><BedDouble size={9} /> {listing.bedrooms}</span>
            )}
            {listing.bathrooms !== null && (
              <span className="flex items-center gap-0.5"><Bath size={9} /> {listing.bathrooms}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AgentStorefrontClient({
  agent,
  activeListings,
  archivedListings,
}: {
  agent: Agent;
  activeListings: PropertyListingWithDetails[];
  archivedListings: PropertyListingWithDetails[];
}) {
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [displayCurrency] = useDisplayCurrency();

  const displayName = agent.partner_name || agent.name;
  const hasWhatsapp = !!agent.whatsapp_number?.trim();
  const whatsappLink = hasWhatsapp
    ? formatWhatsAppLink(
        agent.whatsapp_number!,
        `Hi ${displayName}, I found you on YuhPlace and wanted to ask about a listing.`,
      )
    : null;

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${displayName} on YuhPlace`, url });
      } catch {
        // user dismissed
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied.');
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="-mx-4" style={{ width: 'calc(100% + 2rem)' }}>
      {/* ── Hero / banner ── */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: '#fcf9f8',
          minHeight: agent.partner_banner_url ? '280px' : 'auto',
        }}
      >
        {agent.partner_banner_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={agent.partner_banner_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(252,249,248,0.96) 0%, rgba(252,249,248,0.6) 60%, rgba(252,249,248,0.2) 100%)' }} />
          </>
        )}

        <div className="relative px-4 sm:px-6 pt-8 pb-6">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-4">
              {agent.partner_logo_url ? (
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: '#ffffff', border: '1px solid rgba(191,202,186,0.3)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={agent.partner_logo_url}
                    alt={displayName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#F1FBF4' }}
                >
                  <span className="text-2xl font-black" style={{ color: '#196a24' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ backgroundColor: '#EFF6FF', color: '#114B8A' }}
                >
                  <ShieldCheck size={10} />
                  Verified Partner
                </span>
                <h1
                  className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  {displayName}
                </h1>
                {agent.partner_tagline && (
                  <p className="text-sm mt-0.5" style={{ color: '#40493d' }}>
                    {agent.partner_tagline}
                  </p>
                )}
              </div>
            </motion.div>

            {agent.partner_bio && (
              <motion.p
                variants={fadeUp}
                className="text-sm leading-relaxed max-w-2xl mb-5 whitespace-pre-line"
                style={{ color: '#40493d' }}
              >
                {agent.partner_bio}
              </motion.p>
            )}

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2"
                  style={{ backgroundColor: '#196a24' }}
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => setViewingModalOpen(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
                style={{ backgroundColor: '#f0edec', color: '#1c1b1b' }}
              >
                <Plane size={14} />
                Request a viewing (abroad)
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"
                style={{ backgroundColor: '#ffffff', color: '#40493d', border: '1px solid rgba(191,202,186,0.4)' }}
              >
                <Share2 size={14} />
                Share
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mt-4 text-xs" style={{ color: '#40493d' }}>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={12} /> With us since {memberSince(agent.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Home size={12} /> {activeListings.length} active
              </span>
              {archivedListings.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={12} /> {archivedListings.length} closed deal{archivedListings.length === 1 ? '' : 's'}
                </span>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Active listings ── */}
      <section className="px-4 sm:px-6 py-6 sm:py-8" style={{ backgroundColor: '#f6f3f2' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] block mb-1" style={{ color: '#196a24' }}>
                Active Listings
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-headline)' }}>
                Available now
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <CurrencySwitcher size="sm" />
            </div>
          </div>

          {activeListings.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#ffffff' }}>
              <Home size={22} className="mx-auto mb-2" style={{ color: 'rgba(64,73,61,0.4)' }} />
              <p className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-headline)' }}>
                No active listings right now
              </p>
              <p className="text-xs" style={{ color: '#40493d' }}>
                Check back soon, or request a viewing for upcoming inventory.
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
            >
              {activeListings.map((listing) => (
                <motion.div key={listing.id} variants={fadeUp}>
                  <ListingCard listing={listing} archived={false} displayCurrency={displayCurrency} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Sold / Rented archive ── */}
      {archivedListings.length > 0 && (
        <section className="px-4 sm:px-6 py-6 sm:py-8" style={{ backgroundColor: '#fcf9f8' }}>
          <div className="max-w-5xl mx-auto">
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] block mb-1" style={{ color: '#196a24' }}>
                Track Record
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-headline)' }}>
                Recently closed
              </h2>
              <p className="text-xs mt-1" style={{ color: '#40493d' }}>
                Deals {displayName} has helped close on YuhPlace.
              </p>
            </div>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
            >
              {archivedListings.map((listing) => (
                <motion.div key={listing.id} variants={fadeUp}>
                  <ListingCard listing={listing} archived={true} displayCurrency={displayCurrency} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ── */}
      <section className="px-4 sm:px-6 py-8" style={{ backgroundColor: '#1c1b1b', color: '#fcf9f8' }}>
        <div className="max-w-3xl mx-auto rounded-2xl p-6 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <ShieldCheck size={20} className="mx-auto mb-2" style={{ color: '#f1e340' }} />
          <h3 className="text-lg font-black mb-1" style={{ fontFamily: 'var(--font-headline)' }}>
            Abroad and eyeing a property?
          </h3>
          <p className="text-xs mb-4 max-w-md mx-auto" style={{ color: '#e5e2e1' }}>
            {displayName} works with YuhPlace to tour listings on your behalf. Video, photos, honest notes &mdash; in 48 hours.
          </p>
          <button
            onClick={() => setViewingModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
            style={{ backgroundColor: '#f1e340', color: '#6c6400' }}
          >
            Request a viewing <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <HomeServiceRequestModal
        open={viewingModalOpen}
        onClose={() => setViewingModalOpen(false)}
        defaultService="property_viewing"
      />
    </div>
  );
}
