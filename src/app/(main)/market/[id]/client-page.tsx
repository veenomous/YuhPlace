'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Tag,
  Star,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Share2,
  Flag,
  MessageCircle,
  ShoppingBag,
  Wrench,
  Car,
  BadgeCheck,
  Trash2,
  Loader2,
  Pencil,
  Eye,
} from 'lucide-react';
import { formatPrice, timeAgo, memberSince, formatWhatsAppLink, cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import ReportModal from '@/components/ReportModal';
import CommentSection from '@/components/CommentSection';
import FavoriteButton from '@/components/FavoriteButton';
import ReviewSection from '@/components/ReviewSection';
import SellerRating from '@/components/SellerRating';
import { useViewCount } from '@/hooks/useViewCount';

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

export default function MarketListingClient({ id }: { id: string }) {
  const router = useRouter();
  const { getMarketListing, marketListings, deleteMarketListing } = useData();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [whatsappRevealed, setWhatsappRevealed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const listing = getMarketListing(id);
  const listingIndex = marketListings.findIndex((l) => l.id === id);
  useViewCount('market_listing', listing?.id);

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <ShoppingBag size={48} className="text-border mb-3" />
        <p className="text-foreground font-semibold">Listing not found</p>
        <p className="text-muted text-sm mt-1">
          This listing may have been removed or doesn&apos;t exist.
        </p>
        <Link
          href="/market"
          className="mt-4 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          Back to Market
        </Link>
      </div>
    );
  }

  const isOwner = user && listing.user_id === user.id;
  const gradient = GRADIENTS[(listingIndex >= 0 ? listingIndex : 0) % GRADIENTS.length];
  const images = listing.market_listing_images.filter((img) => img.image_url);
  const hasRealImages = images.length > 0;
  const imageCount = hasRealImages ? images.length : 1;

  const hasWhatsapp = !!(listing.whatsapp_number && listing.whatsapp_number.trim());
  const whatsappMessage = hasWhatsapp
    ? `Hi, I'm interested in your listing on YuhPlace: "${listing.title}" (${formatPrice(listing.price_amount, listing.currency)})`
    : '';
  const whatsappUrl = hasWhatsapp ? formatWhatsAppLink(listing.whatsapp_number!, whatsappMessage) : '';

  const CategoryIcon =
    listing.market_categories.slug === 'vehicles'
      ? Car
      : listing.market_categories.slug === 'services'
        ? Wrench
        : ShoppingBag;

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    const { error } = await deleteMarketListing(listing.id);
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
      <div className="relative">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 z-30 flex items-center justify-center w-9 h-9 bg-black/40 text-white rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: listing.title,
                text: `Check out this listing on YuhPlace: ${listing.title}`,
                url: window.location.href,
              });
            }
          }}
          className="absolute top-3 right-3 z-30 flex items-center justify-center w-9 h-9 bg-black/40 text-white rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          <Share2 size={16} />
        </button>

        {/* Image Area */}
        {hasRealImages ? (
          <div className="relative w-full aspect-[4/3] bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentImageIndex].image_url}
              alt={listing.title}
              className="w-full h-full object-cover"
            />

            {listing.is_featured && (
              <div className="absolute top-3 left-14 z-20">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-accent text-white text-xs font-semibold rounded-full shadow-sm">
                  <Star size={12} fill="currentColor" />
                  Featured
                </span>
              </div>
            )}

            {imageCount > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => prev === 0 ? imageCount - 1 : prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 bg-black/30 text-white rounded-full backdrop-blur-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => prev === imageCount - 1 ? 0 : prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 bg-black/30 text-white rounded-full backdrop-blur-sm"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={cn('relative w-full aspect-[4/3] bg-gradient-to-br', gradient)}>
            <div className="absolute inset-0 flex items-center justify-center">
              <CategoryIcon size={64} className="text-white/30" />
            </div>
            {listing.is_featured && (
              <div className="absolute top-3 left-14 z-20">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-accent text-white text-xs font-semibold rounded-full shadow-sm">
                  <Star size={12} fill="currentColor" />
                  Featured
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Title + Price */}
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {listing.title}
          </h1>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatPrice(listing.price_amount, listing.currency)}
          </p>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border rounded-full text-xs font-medium text-foreground">
            <Tag size={12} className="text-muted" />
            {listing.market_categories.slug === 'buy-sell' ? 'For Sale' : listing.market_categories.name}
          </span>
          {listing.condition !== 'na' && (
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium',
                listing.condition === 'new'
                  ? 'bg-primary-light text-primary'
                  : 'bg-surface text-foreground border border-border'
              )}
            >
              {listing.condition === 'new' ? 'New' : 'Used'}
            </span>
          )}
          <span className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border rounded-full text-xs font-medium text-foreground">
            <MapPin size={12} className="text-muted" />
            {listing.regions.name}
          </span>
          {listing.seller_type === 'business' && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-primary-light text-primary rounded-full text-xs font-medium">
              <Shield size={12} />
              Business
            </span>
          )}
        </div>

        {/* Posted Time + Views */}
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            Posted {timeAgo(listing.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {listing.view_count} {listing.view_count === 1 ? 'view' : 'views'}
          </span>
        </div>

        <div className="border-t border-border" />

        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Description</h2>
          <div className="text-sm text-muted leading-relaxed whitespace-pre-line">
            {listing.description}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Seller Card */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Seller</h2>
          <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-primary font-bold text-lg shrink-0">
              {listing.profiles.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-foreground truncate">
                  {listing.profiles.name}
                </span>
                {listing.profiles.is_verified_business && (
                  <BadgeCheck size={16} className="text-accent shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                Member since {memberSince(listing.profiles.created_at)}
              </p>
              <SellerRating sellerId={listing.user_id} size="small" />
            </div>
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="border-t border-border pt-4 flex items-center gap-4">
            <Link
              href={`/market/${listing.id}/edit`}
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
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-danger transition-colors"
          >
            <Flag size={12} />
            Report this listing
          </button>
        )}

        {/* Reviews */}
        <ReviewSection sellerId={listing.user_id} targetType="market_listing" targetId={listing.id} />

        {/* Comments */}
        <div id="comments-section">
          <CommentSection targetType="market_listing" targetId={listing.id} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5">
            <h3 className="text-base font-semibold text-foreground mb-2">Delete Listing?</h3>
            <p className="text-sm text-muted mb-4">
              This will permanently remove your listing. This action cannot be undone.
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
      {reportModalOpen && (
        <ReportModal
          targetType="market_listing"
          targetId={listing.id}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-border">
        <div className="mx-auto max-w-lg flex items-center gap-3 px-4 py-3">
          <FavoriteButton targetType="market_listing" targetId={listing.id} />
          {hasWhatsapp ? (
            isOwner || whatsappRevealed ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl hover:bg-[#20BD5A] transition-colors active:scale-[0.98]"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    router.push('/login');
                    return;
                  }
                  setWhatsappRevealed(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl hover:bg-[#20BD5A] transition-colors active:scale-[0.98]"
              >
                <MessageCircle size={18} />
                Show WhatsApp
              </button>
            )
          ) : (
            <button
              onClick={() => {
                document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-dark transition-colors active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              Contact via Comments
            </button>
          )}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
