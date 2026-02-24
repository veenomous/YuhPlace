'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Calendar,
  Briefcase,
  Users,
  Camera,
  X,
  ChevronDown,
  Loader2,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { REGIONS } from '@/lib/constants';
import type { PostType } from '@/types/database';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const POST_TYPES: {
  value: PostType;
  label: string;
  description: string;
  icon: typeof AlertTriangle;
  activeClasses: string;
}[] = [
  {
    value: 'alert',
    label: 'Alert',
    description: 'Safety or urgent updates',
    icon: AlertTriangle,
    activeClasses: 'bg-danger-light text-danger border-danger',
  },
  {
    value: 'event',
    label: 'Event',
    description: 'Happenings & gatherings',
    icon: Calendar,
    activeClasses: 'bg-blue-50 text-blue-600 border-blue-400',
  },
  {
    value: 'business',
    label: 'Business',
    description: 'Promotions & openings',
    icon: Briefcase,
    activeClasses: 'bg-accent-light text-amber-700 border-amber-400',
  },
  {
    value: 'community',
    label: 'Community',
    description: 'General community posts',
    icon: Users,
    activeClasses: 'bg-primary-light text-primary-dark border-primary',
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CreatePostPage() {
  const { addDiscoverPost } = useData();
  const { user, loading: authLoading } = useAuth();
  const [postType, setPostType] = useState<PostType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormValid = postType && title.trim() && description.trim() && region;

  function handleAddPhoto() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = [...photos];
    for (let i = 0; i < files.length && newPhotos.length < 4; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newPhotos.push({ file, preview: URL.createObjectURL(file) });
      }
    }
    setPhotos(newPhotos);
    // Reset input so selecting the same file again works
    e.target.value = '';
  }

  function handleRemovePhoto(index: number) {
    const removed = photos[index];
    URL.revokeObjectURL(removed.preview);
    setPhotos(photos.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);
    setSubmitError('');

    const regionObj = REGIONS.find(r => r.slug === region);
    const { error } = await addDiscoverPost({
      post_type: postType!,
      title: title.trim(),
      description: description.trim(),
      region_slug: region,
      region_name: regionObj?.name || region,
      photos: photos.map(p => p.file),
    });

    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitted(true);
  }

  // Auth guard
  if (!authLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mb-4">
          <LogIn size={24} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Sign in to post</h2>
        <p className="text-sm text-muted mb-6">
          You need an account to share posts with the community.
        </p>
        <Link
          href="/login?redirect=/post"
          className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Sign In
        </Link>
        <Link href="/signup?redirect=/post" className="mt-3 text-sm text-primary font-medium hover:underline">
          Create an account
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Post Published!</h2>
        <p className="text-sm text-muted mb-6">
          Your post is now live in the Discover feed.
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => {
              setSubmitted(false);
              setPostType(null);
              setTitle('');
              setDescription('');
              setRegion('');
              photos.forEach((p) => URL.revokeObjectURL(p.preview));
              setPhotos([]);
            }}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Create Another Post
          </button>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-surface text-primary rounded-lg text-sm font-medium border border-border hover:bg-primary-light transition-colors"
          >
            View in Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-foreground">Create Post</h1>
        <p className="text-xs text-muted mt-0.5">
          Share updates with your community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Post type selector */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Post Type <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {POST_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = postType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPostType(type.value)}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all',
                    isActive
                      ? type.activeClasses
                      : 'bg-white border-border text-muted hover:border-primary/30',
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        isActive ? '' : 'text-foreground',
                      )}
                    >
                      {type.label}
                    </p>
                    <p
                      className={cn(
                        'text-[11px] leading-tight',
                        isActive ? 'opacity-80' : 'text-muted',
                      )}
                    >
                      {type.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Region selector */}
        <div>
          <label
            htmlFor="region"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Region <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full appearance-none bg-white border border-border rounded-xl px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="">Select a region</option>
              {REGIONS.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Title <span className="text-danger">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's happening?"
            maxLength={120}
            className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <p className="text-[11px] text-muted mt-1 text-right">
            {title.length}/120
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share the details with your community..."
            rows={5}
            maxLength={2000}
            className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <p className="text-[11px] text-muted mt-1 text-right">
            {description.length}/2000
          </p>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Photos{' '}
            <span className="font-normal text-muted">(optional, max 4)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex gap-2 flex-wrap">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt={`Photo ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center z-10"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <button
                type="button"
                onClick={handleAddPhoto}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Camera size={20} className="text-muted" />
                <span className="text-[10px] text-muted">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="px-4 py-3 bg-danger-light border border-danger/20 rounded-xl">
            <p className="text-sm text-danger">{submitError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid || submitting}
          className={cn(
            'w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2',
            isFormValid && !submitting
              ? 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] transform'
              : 'bg-border text-muted cursor-not-allowed',
          )}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish Post'
          )}
        </button>

        <p className="text-[11px] text-muted text-center">
          By posting, you agree to our community guidelines. Posts that violate
          our terms may be removed.
        </p>
      </form>
    </div>
  );
}
