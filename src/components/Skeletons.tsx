'use client';

import { cn } from '@/lib/utils';

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-border/60',
        className,
      )}
    />
  );
}

// ─── Discover Feed ──────────────────────────────────────────────────────────

export function DiscoverPostSkeleton() {
  return (
    <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-card">
      {/* Badge row */}
      <div className="flex items-center justify-between mb-3">
        <Bone className="h-6 w-20 rounded-full" />
        <Bone className="h-4 w-28" />
      </div>
      {/* Content */}
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-3/4" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-2/3" />
        </div>
        <Bone className="w-20 h-20 rounded-lg flex-shrink-0" />
      </div>
      {/* Author */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <Bone className="w-5 h-5 rounded-full" />
        <Bone className="h-3 w-24" />
        <div className="flex-1" />
        <Bone className="h-3 w-12" />
      </div>
    </div>
  );
}

export function DiscoverFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <DiscoverPostSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Market Feed ────────────────────────────────────────────────────────────

export function MarketCardSkeleton() {
  return (
    <div className="bg-white border border-border/50 rounded-2xl overflow-hidden shadow-card">
      {/* Image */}
      <Bone className="aspect-[4/3] w-full rounded-none" />
      {/* Details */}
      <div className="p-2.5 space-y-2">
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-2/3" />
        <Bone className="h-4 w-20" />
        <Bone className="h-3 w-24" />
      </div>
    </div>
  );
}

export function MarketFeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <MarketCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Property Feed ──────────────────────────────────────────────────────────

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white border border-border/50 rounded-2xl overflow-hidden shadow-card">
      {/* Image */}
      <Bone className="h-48 w-full rounded-none" />
      {/* Content */}
      <div className="p-4 space-y-3">
        <Bone className="h-5 w-full" />
        <Bone className="h-5 w-3/4" />
        {/* Meta row */}
        <div className="flex gap-3">
          <Bone className="h-3 w-16" />
          <Bone className="h-3 w-14" />
          <Bone className="h-3 w-14" />
        </div>
        {/* Location */}
        <Bone className="h-3 w-40" />
        {/* Footer */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <Bone className="w-6 h-6 rounded-full" />
          <Bone className="h-3 w-24" />
          <div className="flex-1" />
          <Bone className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function PropertyFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Search Results ─────────────────────────────────────────────────────────

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Discover section */}
      <div className="space-y-2">
        <Bone className="h-5 w-32 mb-2" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-border/50 rounded-xl p-3 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <Bone className="h-5 w-16 rounded-full" />
              <Bone className="h-3 w-12" />
            </div>
            <Bone className="h-4 w-full" />
            <Bone className="h-3 w-3/4" />
            <Bone className="h-3 w-28" />
          </div>
        ))}
      </div>
      {/* Market section */}
      <div className="space-y-2">
        <Bone className="h-5 w-36 mb-2" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <MarketCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Page ────────────────────────────────────────────────────────────

export function DetailPageSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      <Bone className="h-5 w-16" />
      <Bone className="aspect-video w-full rounded-xl" />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Bone className="h-6 w-20 rounded-full" />
          <Bone className="h-4 w-28" />
        </div>
        <Bone className="h-6 w-full" />
        <Bone className="h-6 w-3/4" />
        <Bone className="h-3 w-20" />
        <div className="space-y-2 pt-2">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ───────────────────────────────────────────────────────────

export function ProfileSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header card */}
      <div className="bg-white border border-border/50 rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-4">
          <Bone className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Bone className="h-5 w-40" />
            <Bone className="h-5 w-20 rounded-full" />
            <Bone className="h-3 w-32" />
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 py-3 bg-surface rounded-xl border border-border">
            <Bone className="w-5 h-5" />
            <Bone className="h-6 w-8" />
            <Bone className="h-3 w-12" />
          </div>
        ))}
      </div>
      {/* Sections */}
      {[1, 2].map((i) => (
        <div key={i} className="bg-white border border-border/50 rounded-xl overflow-hidden shadow-card">
          <div className="px-4 py-3 border-b border-border">
            <Bone className="h-4 w-32" />
          </div>
          <div className="px-4 py-6 flex justify-center">
            <Bone className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}
