'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  Building2,
  DoorOpen,
  LandPlot,
  Store,
  Upload,
  X,
  Check,
  Loader2,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { REGIONS } from '@/lib/constants';
import type { PropertyType, ListingMode, OwnerType } from '@/types/database';

// ---------- Constants ----------

const PROPERTY_TYPES: { type: PropertyType; label: string; icon: typeof Home }[] = [
  { type: 'house', label: 'House', icon: Home },
  { type: 'apartment', label: 'Apartment', icon: Building2 },
  { type: 'room', label: 'Room', icon: DoorOpen },
  { type: 'land', label: 'Land', icon: LandPlot },
  { type: 'commercial', label: 'Commercial', icon: Store },
];

const OWNER_TYPES: { value: OwnerType; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'agent', label: 'Agent' },
];

// ---------- Component ----------

export default function CreatePropertyPage() {
  const router = useRouter();
  const { addPropertyListing } = useData();
  const { user, loading: authLoading } = useAuth();

  // Form state
  const [listingMode, setListingMode] = useState<ListingMode>('rent');
  const [propertyType, setPropertyType] = useState<PropertyType>('house');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ownerType, setOwnerType] = useState<OwnerType>('owner');
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showBedsAndBaths = propertyType !== 'land';

  function handleAddPhoto() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = [...photos];
    for (let i = 0; i < files.length && newPhotos.length < 6; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newPhotos.push({ file, preview: URL.createObjectURL(file) });
      }
    }
    setPhotos(newPhotos);
    e.target.value = '';
  }

  function removePhoto(idx: number) {
    const removed = photos[idx];
    URL.revokeObjectURL(removed.preview);
    setPhotos(photos.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const regionObj = REGIONS.find(r => r.slug === region);
    const { error } = await addPropertyListing({
      listing_mode: listingMode as ListingMode,
      property_type: propertyType as PropertyType,
      title: title.trim(),
      description: description.trim(),
      price_amount: parseFloat(price),
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      neighborhood_text: neighborhood.trim(),
      owner_type: ownerType as OwnerType,
      whatsapp_number: whatsapp,
      region_slug: region,
      region_name: regionObj?.name || region,
      photos: photos.map(p => p.file),
    });

    setIsSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setShowSuccess(true);
  }

  const isFormValid =
    title.trim().length > 0 &&
    price.trim().length > 0 &&
    region.length > 0 &&
    description.trim().length > 0 &&
    whatsapp.trim().length > 0;

  // Auth guard
  if (!authLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mb-4">
          <LogIn size={24} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Sign in to list</h2>
        <p className="text-sm text-muted mb-6">
          You need an account to list properties on YuhPlace.
        </p>
        <Link
          href="/login?redirect=/property/create"
          className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Sign In
        </Link>
        <Link href="/signup?redirect=/property/create" className="mt-3 text-sm text-primary font-medium hover:underline">
          Create an account
        </Link>
      </div>
    );
  }

  // Success screen
  if (showSuccess) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-full flex items-center justify-center">
          <Check size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Listing Published!</h2>
        <p className="text-sm text-muted mb-6">
          Your property listing is now live. People can find it in the Property tab.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/property"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold"
          >
            View Properties
          </Link>
          <Link
            href="/property"
            className="text-sm text-primary font-medium hover:underline"
          >
            View Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface hover:bg-border transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-foreground">List a Property</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rent / Sale Toggle */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Listing Type <span className="text-danger">*</span>
          </label>
          <div className="flex bg-surface rounded-xl p-1">
            <button
              type="button"
              onClick={() => setListingMode('rent')}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all',
                listingMode === 'rent'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-foreground'
              )}
            >
              For Rent
            </button>
            <button
              type="button"
              onClick={() => setListingMode('sale')}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all',
                listingMode === 'sale'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-foreground'
              )}
            >
              For Sale
            </button>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Property Type <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {PROPERTY_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => setPropertyType(type)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all',
                  propertyType === type
                    ? 'bg-primary-light border-primary text-primary'
                    : 'bg-white border-border text-muted hover:border-primary'
                )}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="text-sm font-semibold text-foreground mb-2 block">
            Title <span className="text-danger">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Spacious 2-bedroom apartment in Georgetown"
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            maxLength={120}
          />
          <p className="text-xs text-muted mt-1 text-right">{title.length}/120</p>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="text-sm font-semibold text-foreground mb-2 block">
            Price (GYD) <span className="text-danger">*</span>
            {listingMode === 'rent' && (
              <span className="font-normal text-muted ml-1">per month</span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">
              $
            </span>
            <input
              id="price"
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPrice(val);
              }}
              placeholder="0"
              className="w-full pl-8 pr-16 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
              GYD{listingMode === 'rent' ? '/mo' : ''}
            </span>
          </div>
          {price && (
            <p className="text-xs text-muted mt-1">
              ${Number(price).toLocaleString()} GYD
            </p>
          )}
        </div>

        {/* Bedrooms & Bathrooms */}
        {showBedsAndBaths && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bedrooms" className="text-sm font-semibold text-foreground mb-2 block">
                Bedrooms
              </label>
              <select
                id="bedrooms"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bathrooms" className="text-sm font-semibold text-foreground mb-2 block">
                Bathrooms
              </label>
              <select
                id="bathrooms"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Region */}
        <div>
          <label htmlFor="region" className="text-sm font-semibold text-foreground mb-2 block">
            Region <span className="text-danger">*</span>
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
          >
            <option value="">Select a region</option>
            {REGIONS.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Neighborhood */}
        <div>
          <label htmlFor="neighborhood" className="text-sm font-semibold text-foreground mb-2 block">
            Neighborhood / Area
          </label>
          <input
            id="neighborhood"
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="e.g. Bel Air Park, Kitty, Providence"
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            maxLength={80}
          />
        </div>

        {/* Owner Type */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            You are a <span className="text-danger">*</span>
          </label>
          <div className="flex gap-2">
            {OWNER_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setOwnerType(value)}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all',
                  ownerType === value
                    ? 'bg-primary-light border-primary text-primary'
                    : 'bg-white border-border text-muted hover:border-primary'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-sm font-semibold text-foreground mb-2 block">
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your property in detail. Include features, amenities, nearby landmarks, and any conditions (e.g. no pets, references required)."
            rows={5}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-muted mt-1 text-right">{description.length}/2000</p>
        </div>

        {/* WhatsApp Number */}
        <div>
          <label htmlFor="whatsapp" className="text-sm font-semibold text-foreground mb-2 block">
            WhatsApp Number <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
              +592
            </span>
            <input
              id="whatsapp"
              type="tel"
              inputMode="numeric"
              value={whatsapp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setWhatsapp(val);
              }}
              placeholder="6001234"
              className="w-full pl-14 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              maxLength={7}
            />
          </div>
          <p className="text-xs text-muted mt-1">
            Buyers/renters will contact you on this number
          </p>
        </div>

        {/* Photo Upload Area */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Photos
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt={`Photo ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center z-10"
                >
                  <X size={12} />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/50 text-white text-[9px] font-medium rounded z-10">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {photos.length < 6 && (
              <button
                type="button"
                onClick={handleAddPhoto}
                className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <Upload size={20} />
                <span className="text-xs font-medium">Add</span>
              </button>
            )}
          </div>
          <p className="text-xs text-muted mt-2">
            Add up to 6 photos. First photo will be the cover image.
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="px-4 py-3 bg-danger-light border border-danger/20 rounded-xl">
            <p className="text-sm text-danger">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={cn(
            'w-full py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2',
            isFormValid && !isSubmitting
              ? 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98]'
              : 'bg-border text-muted cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish Listing'
          )}
        </button>

        <p className="text-xs text-center text-muted">
          By publishing, you agree that your listing is accurate and complies with our community guidelines.
        </p>
      </form>
    </div>
  );
}
