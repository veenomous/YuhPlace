'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  Building2,
  DoorOpen,
  LandPlot,
  Store,
  BedDouble,
  Bath,
  MapPin,
  Star,
  MessageCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Share2,
  ShieldCheck,
  User,
  CalendarDays,
  Tag,
  KeyRound,
} from 'lucide-react';
import { cn, formatPrice, timeAgo, memberSince, formatWhatsAppLink } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import type { PropertyListingWithDetails, PropertyType } from '@/types/database';

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

const OWNER_TYPE_LABELS: Record<string, string> = {
  owner: 'Property Owner',
  agent: 'Real Estate Agent',
  landlord: 'Landlord',
};

// ---------- Component ----------

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getPropertyListing } = useData();
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const property = getPropertyListing(params.id as string);

  if (!property) {
    return (
      <div className="px-4 py-16 text-center">
        <Home size={48} className="mx-auto text-border mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Property not found</h2>
        <p className="text-sm text-muted mb-6">This listing may have been removed or is no longer available.</p>
        <Link
          href="/property"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to listings
        </Link>
      </div>
    );
  }

  const Icon = PROPERTY_TYPE_ICONS[property.property_type];
  const gradient = PLACEHOLDER_GRADIENTS[property.property_type];
  const isRent = property.listing_mode === 'rent';

  const whatsappMessage = `Hi, I'm interested in your property listing on YuhPlace: "${property.title}" (${formatPrice(property.price_amount, property.currency)}${isRent ? '/mo' : ''})`;
  const whatsappLink = formatWhatsAppLink(property.whatsapp_number, whatsappMessage);

  // Simulate gallery images (placeholders)
  const galleryCount = 4;

  return (
    <div className="pb-24">
      {/* Image Gallery */}
      <div className={cn('relative w-full h-64 bg-gradient-to-br', gradient)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={64} className="text-white/30" />
        </div>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Share button */}
        <button className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-colors">
          <Share2 size={16} />
        </button>

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
          {currentImageIdx + 1} / {galleryCount}
        </div>

        {/* Gallery nav arrows */}
        <button
          onClick={() => setCurrentImageIdx((i) => (i > 0 ? i - 1 : galleryCount - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setCurrentImageIdx((i) => (i < galleryCount - 1 ? i + 1 : 0))}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors"
        >
          <ChevronRight size={16} />
        </button>

        {/* Gallery dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {Array.from({ length: galleryCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIdx(idx)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                idx === currentImageIdx ? 'bg-white w-4' : 'bg-white/50'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide',
              isRent ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
            )}
          >
            For {property.listing_mode}
          </span>
          {property.is_featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">
              <Star size={10} fill="currentColor" />
              Featured
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface text-muted capitalize">
            {property.owner_type}
          </span>
        </div>

        {/* Price */}
        <p className="text-2xl font-bold text-foreground mb-1">
          {formatPrice(property.price_amount, property.currency)}
          {isRent && <span className="text-base font-normal text-muted">/mo</span>}
        </p>

        {/* Title */}
        <h1 className="text-lg font-semibold text-foreground mb-3 leading-snug">
          {property.title}
        </h1>

        {/* Property meta */}
        <div className="flex items-center gap-4 text-sm text-muted mb-3">
          <span className="flex items-center gap-1.5">
            <Icon size={15} />
            {PROPERTY_TYPE_LABELS[property.property_type]}
          </span>
          {property.bedrooms !== null && (
            <span className="flex items-center gap-1.5">
              <BedDouble size={15} />
              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
          {property.bathrooms !== null && (
            <span className="flex items-center gap-1.5">
              <Bath size={15} />
              {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-muted mb-5">
          <MapPin size={14} className="shrink-0 text-primary" />
          <span>
            {property.neighborhood_text && `${property.neighborhood_text}, `}
            {property.regions.name}
          </span>
        </div>

        <div className="text-xs text-muted mb-6">
          Listed {timeAgo(property.created_at)}
        </div>

        {/* Divider */}
        <hr className="border-border mb-5" />

        {/* Key Details Grid */}
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">
          Key Details
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
              <Tag size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted">Type</p>
              <p className="text-sm font-semibold text-foreground capitalize">
                {PROPERTY_TYPE_LABELS[property.property_type]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
              <KeyRound size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted">Mode</p>
              <p className="text-sm font-semibold text-foreground capitalize">{property.listing_mode}</p>
            </div>
          </div>

          {property.bedrooms !== null && (
            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
                <BedDouble size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Bedrooms</p>
                <p className="text-sm font-semibold text-foreground">{property.bedrooms}</p>
              </div>
            </div>
          )}

          {property.bathrooms !== null && (
            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
                <Bath size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Bathrooms</p>
                <p className="text-sm font-semibold text-foreground">{property.bathrooms}</p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="border-border mb-5" />

        {/* Description */}
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">
          Description
        </h2>
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-6">
          {property.description}
        </div>

        {/* Divider */}
        <hr className="border-border mb-5" />

        {/* Owner / Agent Card */}
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">
          Listed By
        </h2>
        <div className="bg-surface rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">
                {property.profiles.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-foreground truncate">
                  {property.profiles.name}
                </h3>
                {property.profiles.is_verified_business && (
                  <ShieldCheck size={16} className="text-primary shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white border border-border text-muted capitalize">
                  {OWNER_TYPE_LABELS[property.owner_type]}
                </span>
                {property.profiles.is_verified_business && (
                  <span className="text-xs text-primary font-medium">Verified</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                <CalendarDays size={12} />
                Member since {memberSince(property.profiles.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Report */}
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 text-sm text-muted hover:text-danger transition-colors mb-4"
        >
          <Flag size={14} />
          Report this listing
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowReportModal(false)}
          />
          <div className="relative bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Report Listing</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 text-muted hover:text-foreground"
              >
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            <p className="text-sm text-muted mb-4">
              Why are you reporting this listing?
            </p>
            <div className="space-y-2">
              {['Spam', 'Scam / Fraud', 'Inappropriate content', 'Wrong category', 'Duplicate listing', 'Misleading information'].map(
                (reason) => (
                  <button
                    key={reason}
                    onClick={() => {
                      setShowReportModal(false);
                      // Would submit report here
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-foreground bg-surface hover:bg-primary-light rounded-xl transition-colors"
                  >
                    {reason}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-border">
        <div className="mx-auto max-w-lg flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-foreground truncate">
              {formatPrice(property.price_amount, property.currency)}
              {isRent && <span className="text-sm font-normal text-muted">/mo</span>}
            </p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            <MessageCircle size={18} />
            Contact on WhatsApp
          </a>
        </div>
        {/* Safe area padding */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
