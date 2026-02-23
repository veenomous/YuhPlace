'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  Plus,
  X,
  ChevronDown,
  Loader2,
  ShoppingBag,
  Wrench,
  Car,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { REGIONS } from '@/lib/constants';
import type { ItemCondition } from '@/types/database';

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'buy-and-sell', name: 'Buy & Sell', icon: ShoppingBag },
  { slug: 'services', name: 'Services', icon: Wrench },
  { slug: 'vehicles', name: 'Vehicles', icon: Car },
];

const CONDITIONS: { value: ItemCondition; label: string; description: string }[] = [
  { value: 'new', label: 'New', description: 'Brand new, unused item' },
  { value: 'used', label: 'Used', description: 'Previously owned or used' },
];

const MAX_PHOTOS = 6;

export default function CreateListingPage() {
  const router = useRouter();
  const { addMarketListing } = useData();

  // Form state
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ItemCondition | ''>('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [whatsapp, setWhatsapp] = useState('+592');
  const [photos, setPhotos] = useState<string[]>([]);

  // UI state
  const [regionOpen, setRegionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCategory = CATEGORIES.find((c) => c.slug === category);
  const isService = selectedCategory?.slug === 'services';

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!category) newErrors.category = 'Select a category';
    if (!title.trim()) newErrors.title = 'Enter a title';
    if (title.trim().length > 0 && title.trim().length < 5)
      newErrors.title = 'Title must be at least 5 characters';
    if (!isService && !price.trim()) newErrors.price = 'Enter a price';
    if (!isService && price.trim() && isNaN(Number(price.replace(/,/g, ''))))
      newErrors.price = 'Enter a valid number';
    if (!isService && !condition) newErrors.condition = 'Select condition';
    if (!description.trim()) newErrors.description = 'Enter a description';
    if (description.trim().length > 0 && description.trim().length < 20)
      newErrors.description = 'Description must be at least 20 characters';
    if (!region) newErrors.region = 'Select a region';
    if (!whatsapp.trim() || whatsapp.trim().length < 6)
      newErrors.whatsapp = 'Enter your WhatsApp number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const regionObj = REGIONS.find(r => r.slug === region);
    const categoryObj = CATEGORIES.find(c => c.slug === category);

    addMarketListing({
      title: title.trim(),
      description: description.trim(),
      category_slug: category,
      category_name: categoryObj?.name || category,
      price_amount: price ? parseFloat(price.replace(/,/g, '')) : null,
      condition: (isService ? 'na' : condition) as ItemCondition,
      seller_type: 'individual',
      whatsapp_number: whatsapp,
      region_slug: region,
      region_name: regionObj?.name || region,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  const handleAddPhoto = () => {
    if (photos.length >= MAX_PHOTOS) return;
    // Simulate photo selection with placeholder
    const gradients = [
      'bg-gradient-to-br from-emerald-400 to-teal-500',
      'bg-gradient-to-br from-blue-400 to-indigo-500',
      'bg-gradient-to-br from-purple-400 to-pink-500',
      'bg-gradient-to-br from-orange-400 to-red-500',
      'bg-gradient-to-br from-cyan-400 to-blue-500',
      'bg-gradient-to-br from-amber-400 to-orange-500',
    ];
    setPhotos([...photos, gradients[photos.length % gradients.length]]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Success screen
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
          <CheckCircle2 size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Listing Published!</h2>
        <p className="text-sm text-muted mt-2 max-w-[280px]">
          Your listing is now live on YuhPlace Market. Buyers can reach you via WhatsApp.
        </p>
        <div className="flex flex-col gap-2 mt-6 w-full max-w-[260px]">
          <button
            onClick={() => router.push('/market')}
            className="w-full px-4 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            View Market
          </button>
          <Link
            href="/market"
            className="w-full px-4 py-3 bg-surface text-foreground text-sm font-semibold rounded-xl border border-border hover:bg-border/30 transition-colors text-center"
          >
            Browse Listings
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setCategory('');
              setTitle('');
              setPrice('');
              setCondition('');
              setDescription('');
              setRegion('');
              setWhatsapp('+592');
              setPhotos([]);
              setErrors({});
            }}
            className="w-full px-4 py-3 bg-surface text-foreground text-sm font-semibold rounded-xl border border-border hover:bg-border/30 transition-colors"
          >
            Create Another Listing
          </button>
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
          className="flex items-center justify-center w-9 h-9 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Create Listing</h1>
      </div>

      <div className="space-y-5">
        {/* ─── Category Selector ──────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Category <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ slug, name, icon: Icon }) => (
              <button
                key={slug}
                onClick={() => {
                  setCategory(slug);
                  setErrors((prev) => {
                    const { category, ...rest } = prev;
                    return rest;
                  });
                  // Clear condition if switching to services
                  if (slug === 'services') {
                    setCondition('');
                  }
                }}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center',
                  category === slug
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border bg-white text-muted hover:border-primary/30'
                )}
              >
                <Icon size={22} />
                <span className="text-xs font-medium">{name}</span>
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-xs text-danger mt-1">{errors.category}</p>
          )}
        </div>

        {/* ─── Photo Upload Area ──────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Photos <span className="text-muted font-normal text-xs">(up to {MAX_PHOTOS})</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((gradient, index) => (
              <div
                key={index}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden',
                  gradient
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={20} className="text-white/50" />
                </div>
                <button
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1.5 right-1.5 flex items-center justify-center w-6 h-6 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={12} />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/50 text-white text-[9px] font-medium rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                onClick={handleAddPhoto}
                className="flex flex-col items-center justify-center gap-1 aspect-square rounded-xl border-2 border-dashed border-border text-muted hover:border-primary/40 hover:text-primary/60 transition-all"
              >
                <Plus size={20} />
                <span className="text-[10px] font-medium">Add Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Title Input ────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Samsung Galaxy S24 Ultra - 256GB"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors((prev) => {
                  const { title, ...rest } = prev;
                  return rest;
                });
              }
            }}
            maxLength={120}
            className={cn(
              'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
              errors.title ? 'border-danger' : 'border-border'
            )}
          />
          <div className="flex justify-between mt-1">
            {errors.title ? (
              <p className="text-xs text-danger">{errors.title}</p>
            ) : (
              <span />
            )}
            <span className="text-[10px] text-muted">{title.length}/120</span>
          </div>
        </div>

        {/* ─── Price Input ────────────────────────────────────────────── */}
        {!isService && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Price <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={price}
                onChange={(e) => {
                  // Allow only numbers and commas
                  const cleaned = e.target.value.replace(/[^0-9,]/g, '');
                  setPrice(cleaned);
                  if (errors.price) {
                    setErrors((prev) => {
                      const { price, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                className={cn(
                  'w-full pl-8 pr-16 py-2.5 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
                  errors.price ? 'border-danger' : 'border-border'
                )}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted bg-surface px-2 py-0.5 rounded">
                GYD
              </span>
            </div>
            {errors.price && (
              <p className="text-xs text-danger mt-1">{errors.price}</p>
            )}
          </div>
        )}

        {isService && (
          <div className="px-3.5 py-3 bg-primary-light rounded-xl border border-primary/20">
            <p className="text-xs text-primary font-medium">
              Service listings show &quot;Contact for price&quot; to buyers. You can include pricing details in the description.
            </p>
          </div>
        )}

        {/* ─── Condition Selector ─────────────────────────────────────── */}
        {!isService && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Condition <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map(({ value, label, description: desc }) => (
                <button
                  key={value}
                  onClick={() => {
                    setCondition(value);
                    if (errors.condition) {
                      setErrors((prev) => {
                        const { condition, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  className={cn(
                    'flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left',
                    condition === value
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-white hover:border-primary/30'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      condition === value ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-[11px] text-muted mt-0.5">{desc}</span>
                </button>
              ))}
            </div>
            {errors.condition && (
              <p className="text-xs text-danger mt-1">{errors.condition}</p>
            )}
          </div>
        )}

        {/* ─── Description Textarea ──────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            placeholder={
              isService
                ? 'Describe your services, experience, and coverage areas...'
                : 'Describe your item, condition details, what is included...'
            }
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors((prev) => {
                  const { description, ...rest } = prev;
                  return rest;
                });
              }
            }}
            rows={5}
            maxLength={2000}
            className={cn(
              'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none',
              errors.description ? 'border-danger' : 'border-border'
            )}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-xs text-danger">{errors.description}</p>
            ) : (
              <span />
            )}
            <span className="text-[10px] text-muted">
              {description.length}/2000
            </span>
          </div>
        </div>

        {/* ─── Region Dropdown ────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Region <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <button
              onClick={() => setRegionOpen(!regionOpen)}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all',
                errors.region ? 'border-danger' : 'border-border',
                regionOpen && 'ring-2 ring-primary/20 border-primary'
              )}
            >
              <span className={region ? 'text-foreground' : 'text-muted/50'}>
                {region
                  ? REGIONS.find((r) => r.slug === region)?.name
                  : 'Select your region'}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  'text-muted transition-transform',
                  regionOpen && 'rotate-180'
                )}
              />
            </button>
            {regionOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setRegionOpen(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-lg py-1 max-h-[240px] overflow-y-auto">
                  {REGIONS.map((r) => (
                    <button
                      key={r.slug}
                      onClick={() => {
                        setRegion(r.slug);
                        setRegionOpen(false);
                        if (errors.region) {
                          setErrors((prev) => {
                            const { region, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm hover:bg-surface transition-colors',
                        region === r.slug
                          ? 'text-primary font-medium'
                          : 'text-foreground'
                      )}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {errors.region && (
            <p className="text-xs text-danger mt-1">{errors.region}</p>
          )}
        </div>

        {/* ─── WhatsApp Number ────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            WhatsApp Number <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-muted mb-2">
            Buyers will contact you on WhatsApp
          </p>
          <input
            type="tel"
            placeholder="+592 600 1234"
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value);
              if (errors.whatsapp) {
                setErrors((prev) => {
                  const { whatsapp, ...rest } = prev;
                  return rest;
                });
              }
            }}
            className={cn(
              'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
              errors.whatsapp ? 'border-danger' : 'border-border'
            )}
          />
          {errors.whatsapp && (
            <p className="text-xs text-danger mt-1">{errors.whatsapp}</p>
          )}
        </div>

        {/* ─── Submit Button ──────────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]',
            submitting
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-primary-dark'
          )}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish Listing'
          )}
        </button>

        <p className="text-[11px] text-muted text-center leading-relaxed">
          By publishing, you agree to YuhPlace&apos;s terms of service. Listings that violate our guidelines will be removed.
        </p>
      </div>
    </div>
  );
}
