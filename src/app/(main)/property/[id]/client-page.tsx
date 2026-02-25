'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  BadgeCheck,
  CalendarDays,
  Tag,
  KeyRound,
  Trash2,
  Loader2,
  Pencil,
  Eye,
} from 'lucide-react';
import { cn, formatPrice, timeAgo, memberSince, formatWhatsAppLink } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import type { PropertyType } from '@/types/database';
import ReportModal from '@/components/ReportModal';
import CommentSection from '@/components/CommentSection';
import FavoriteButton from '@/components/FavoriteButton';
import ReviewSection from '@/components/ReviewSection';
import SellerRating from '@/components/SellerRating';
import { useViewCount } from '@/hooks/useViewCount';

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

export default function PropertyListingClient({ id }: { id: string }) {
  const router = useRouter();
  const { getPropertyListing, deletePropertyListing } = useData();
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const property = getPropertyListing(id);
  useViewCount('property_listing', property?.id);

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

  const isOwner = user && property.user_id === user.id;
  const Icon = PROPERTY_TYPE_ICONS[property.property_type];
  const gradient = PLACEHOLDER_GRADIENTS[property.property_type];
  const isRent = property.listing_mode === 'rent';
  const images = property.property_listing_images.filter((img) => img.image_url);
  const hasRealImages = images.length > 0;
  const galleryCount = hasRealImages ? images.length : 1;

  const whatsappMessage = `Hi, I'm interested in your property listing on YuhPlace: "${property.title}" (${formatPrice(property.price_amount, property.currency)}${isRent ? '/mo' : ''})`;
  const whatsappLink = formatWhatsAppLink(property.whatsapp_number, whatsappMessage);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    const { error } = await deletePropertyListing(property.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
    } else {
      router.back();
    }
  };

  return (
    <div className="pb-24">
      {/* Image Gallery */}
      <div className="relative w-full h-64">
        {hasRealImages ? (
          <div className="relative w-full h-full bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentImageIdx].image_url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br', gradient)}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon size={64} className="text-white/30" />
            </div>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Share button */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: property.title,
                text: `Check out this property on YuhPlace: ${property.title}`,
                url: window.location.href,
              });
            }
          }}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-colors"
        >
          <Share2 size={16} />
        </button>

        {/* Image counter */}
        {galleryCount > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
            {currentImageIdx + 1} / {galleryCount}
          </div>
        )}

        {/* Gallery nav arrows */}
        {galleryCount > 1 && (
          <>
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
          </>
        )}

        {/* Gallery dots */}
        {galleryCount > 1 && (
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
        )}
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

        {/* Listed time + Views */}
        <div className="flex items-center gap-3 text-xs text-muted mb-6">
          <span>Listed {timeAgo(property.created_at)}</span>
          <span className="flex items-center gap-1">
            <Eye size={13} />
            {property.view_count} {property.view_count === 1 ? 'view' : 'views'}
          </span>
        </div>

        <hr className="border-border mb-5" />

        {/* Key Details Grid */}
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">Key Details</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
              <Tag size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted">Type</p>
              <p className="text-sm font-semibold text-foreground capitalize">{PROPERTY_TYPE_LABELS[property.property_type]}</p>
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

        <hr className="border-border mb-5" />

        {/* Description */}
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">Description</h2>
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-6">
          {property.description}
        </div>

        <hr className="border-border mb-5" />

        {/* Owner / Agent Card */}
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">Listed By</h2>
        <div className="bg-surface rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">{property.profiles.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-foreground truncate">{property.profiles.name}</h3>
                {property.profiles.is_verified_business && (
                  <BadgeCheck size={16} className="text-amber-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white border border-border text-muted capitalize">
                  {OWNER_TYPE_LABELS[property.owner_type]}
                </span>
                {property.profiles.is_verified_business && (
                  <BadgeCheck size={14} className="text-amber-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                <CalendarDays size={12} />
                Member since {memberSince(property.profiles.created_at)}
              </div>
              <SellerRating sellerId={property.user_id} size="small" />
            </div>
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="border-t border-border pt-4 mb-4 flex items-center gap-4">
            <Link
              href={`/property/${property.id}/edit`}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <Pencil size={14} />
              Edit listing
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-danger hover:text-danger/80 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}

        {/* Report */}
        {!isOwner && (
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 text-sm text-muted hover:text-danger transition-colors mb-4"
          >
            <Flag size={14} />
            Report this listing
          </button>
        )}

        {/* Reviews */}
        <ReviewSection sellerId={property.user_id} targetType="property_listing" targetId={property.id} />

        {/* Comments */}
        <CommentSection targetType="property_listing" targetId={property.id} />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5">
            <h3 className="text-base font-semibold text-foreground mb-2">Delete Listing?</h3>
            <p className="text-sm text-muted mb-4">
              This will permanently remove your property listing. This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-danger mb-3 bg-danger-light p-2 rounded-lg">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-surface text-foreground text-sm font-medium rounded-xl border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-danger text-white text-sm font-medium rounded-xl"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          targetType="property_listing"
          targetId={property.id}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-border">
        <div className="mx-auto max-w-lg flex items-center gap-3 px-4 py-3">
          <FavoriteButton targetType="property_listing" targetId={property.id} />
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
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
