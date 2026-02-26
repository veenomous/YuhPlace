'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShoppingBag, Wrench, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { REGIONS } from '@/lib/constants';
import type { ItemCondition } from '@/types/database';

const CATEGORIES = [
  { slug: 'buy-sell', name: 'Buy & Sell', icon: ShoppingBag },
  { slug: 'services', name: 'Services', icon: Wrench },
  { slug: 'vehicles', name: 'Vehicles', icon: Car },
];

const CONDITIONS: { value: ItemCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
];

export default function EditMarketListingPage() {
  const params = useParams();
  const router = useRouter();
  const { getMarketListing, updateMarketListing } = useData();
  const { user } = useAuth();

  const listing = getMarketListing(params.id as string);

  const [category, setCategory] = useState(listing?.market_categories.slug ?? '');
  const [title, setTitle] = useState(listing?.title ?? '');
  const [price, setPrice] = useState(listing?.price_amount?.toString() ?? '');
  const [condition, setCondition] = useState<ItemCondition | ''>(listing?.condition ?? '');
  const [description, setDescription] = useState(listing?.description ?? '');
  const [region, setRegion] = useState(listing?.regions.slug ?? '');
  const [whatsapp, setWhatsapp] = useState(listing?.whatsapp_number ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!listing) {
    return <div className="px-4 py-16 text-center"><p className="text-muted text-sm">Listing not found.</p></div>;
  }

  if (!user || listing.user_id !== user.id) {
    return <div className="px-4 py-16 text-center"><p className="text-muted text-sm">You can only edit your own listings.</p></div>;
  }

  const isService = category === 'services';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !region) return;
    setSubmitting(true);
    setSubmitError('');

    const { error } = await updateMarketListing(params.id as string, {
      title: title.trim(),
      description: description.trim(),
      category_slug: category,
      category_name: CATEGORIES.find(c => c.slug === category)?.name || category,
      price_amount: price ? parseFloat(price.replace(/,/g, '')) : null,
      condition: (isService ? 'na' : condition) as ItemCondition,
      whatsapp_number: whatsapp.trim() || null,
      region_slug: region,
      region_name: REGIONS.find(r => r.slug === region)?.name || region,
    });

    setSubmitting(false);
    if (error) { setSubmitError(error); return; }
    router.push(`/market/${params.id}`);
  }

  return (
    <div className="px-4 py-4 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Edit Listing</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ slug, name, icon: Icon }) => (
              <button key={slug} type="button" onClick={() => setCategory(slug)}
                className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center',
                  category === slug ? 'border-primary bg-primary-light text-primary' : 'border-border bg-white text-muted hover:border-primary/30')}>
                <Icon size={22} /><span className="text-xs font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {/* Price */}
        {!isService && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Price (GYD)</label>
            <input type="text" inputMode="numeric" value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9,]/g, ''))}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
        )}

        {/* Condition */}
        {!isService && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Condition</label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setCondition(value)}
                  className={cn('p-3 rounded-xl border-2 text-sm font-semibold transition-all',
                    condition === value ? 'border-primary bg-primary-light text-primary' : 'border-border bg-white text-foreground hover:border-primary/30')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={2000}
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">Select a region</option>
            {REGIONS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
          </select>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">WhatsApp Number <span className="text-muted text-xs font-normal">(optional)</span></label>
          <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {submitError && (
          <div className="px-4 py-3 bg-danger-light border border-danger/20 rounded-xl">
            <p className="text-sm text-danger">{submitError}</p>
          </div>
        )}

        <button type="submit" disabled={submitting}
          className={cn('w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-white text-sm font-semibold rounded-xl transition-all',
            submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark')}>
          {submitting ? <><Loader2 size={18} className="animate-spin" />Saving...</> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
