'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Home, Building2, DoorOpen, LandPlot, Store, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { REGIONS } from '@/lib/constants';
import type { PropertyType, ListingMode, OwnerType } from '@/types/database';

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

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { getPropertyListing, updatePropertyListing } = useData();
  const { user } = useAuth();

  const property = getPropertyListing(params.id as string);

  const [listingMode, setListingMode] = useState<ListingMode>(property?.listing_mode ?? 'rent');
  const [propertyType, setPropertyType] = useState<PropertyType>(property?.property_type ?? 'house');
  const [title, setTitle] = useState(property?.title ?? '');
  const [price, setPrice] = useState(property?.price_amount?.toString() ?? '');
  const [bedrooms, setBedrooms] = useState(property?.bedrooms?.toString() ?? '');
  const [bathrooms, setBathrooms] = useState(property?.bathrooms?.toString() ?? '');
  const [neighborhood, setNeighborhood] = useState(property?.neighborhood_text ?? '');
  const [region, setRegion] = useState(property?.regions.slug ?? '');
  const [description, setDescription] = useState(property?.description ?? '');
  const [whatsapp, setWhatsapp] = useState(property?.whatsapp_number ?? '');
  const [ownerType, setOwnerType] = useState<OwnerType>(property?.owner_type ?? 'owner');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!property) {
    return <div className="px-4 py-16 text-center"><p className="text-muted text-sm">Listing not found.</p></div>;
  }

  if (!user || property.user_id !== user.id) {
    return <div className="px-4 py-16 text-center"><p className="text-muted text-sm">You can only edit your own listings.</p></div>;
  }

  const showBedsAndBaths = propertyType !== 'land';
  const isFormValid = title.trim() && price.trim() && region && description.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);
    setSubmitError('');

    const { error } = await updatePropertyListing(params.id as string, {
      listing_mode: listingMode,
      property_type: propertyType,
      title: title.trim(),
      description: description.trim(),
      price_amount: parseFloat(price),
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      neighborhood_text: neighborhood.trim(),
      owner_type: ownerType,
      whatsapp_number: whatsapp.trim() || null,
      region_slug: region,
      region_name: REGIONS.find(r => r.slug === region)?.name || region,
    });

    setSubmitting(false);
    if (error) { setSubmitError(error); return; }
    router.push(`/property/${params.id}`);
  }

  return (
    <div className="px-4 py-4 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface hover:bg-border transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Edit Property</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Listing Type */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Listing Type</label>
          <div className="flex bg-surface rounded-xl p-1">
            <button type="button" onClick={() => setListingMode('rent')}
              className={cn('flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all',
                listingMode === 'rent' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground')}>
              For Rent
            </button>
            <button type="button" onClick={() => setListingMode('sale')}
              className={cn('flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all',
                listingMode === 'sale' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground')}>
              For Sale
            </button>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Property Type</label>
          <div className="grid grid-cols-5 gap-2">
            {PROPERTY_TYPES.map(({ type, label, icon: Icon }) => (
              <button key={type} type="button" onClick={() => setPropertyType(type)}
                className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all',
                  propertyType === type ? 'bg-primary-light border-primary text-primary' : 'bg-white border-border text-muted hover:border-primary')}>
                <Icon size={20} />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {/* Price */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Price (GYD) {listingMode === 'rent' && <span className="font-normal text-muted ml-1">per month</span>}
          </label>
          <input type="text" inputMode="numeric" value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {/* Bedrooms & Bathrooms */}
        {showBedsAndBaths && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Bedrooms</label>
              <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Bathrooms</label>
              <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Select</option>
                {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Region */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">Select a region</option>
            {REGIONS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
          </select>
        </div>

        {/* Neighborhood */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Neighborhood / Area</label>
          <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} maxLength={80}
            placeholder="e.g. Bel Air Park, Kitty, Providence"
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {/* Owner Type */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">You are a</label>
          <div className="flex gap-2">
            {OWNER_TYPES.map(({ value, label }) => (
              <button key={value} type="button" onClick={() => setOwnerType(value)}
                className={cn('flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all',
                  ownerType === value ? 'bg-primary-light border-primary text-primary' : 'bg-white border-border text-muted hover:border-primary')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={2000}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">WhatsApp Number <span className="text-muted text-xs font-normal">(optional)</span></label>
          <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {submitError && (
          <div className="px-4 py-3 bg-danger-light border border-danger/20 rounded-xl">
            <p className="text-sm text-danger">{submitError}</p>
          </div>
        )}

        <button type="submit" disabled={!isFormValid || submitting}
          className={cn('w-full py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2',
            isFormValid && !submitting ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-border text-muted cursor-not-allowed')}>
          {submitting ? <><Loader2 size={18} className="animate-spin" />Saving...</> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
