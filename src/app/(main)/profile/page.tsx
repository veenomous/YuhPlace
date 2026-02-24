'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  BadgeCheck,
  UserPen,
  Bell,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Package,
  MessageSquare,
  MapPin,
  Store,
  Home,
  ShoppingBag,
} from 'lucide-react';
import { cn, memberSince, formatPrice, timeAgo } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import type { AccountType, MarketListingWithDetails, PropertyListingWithDetails, DiscoverPostWithDetails } from '@/types/database';

const ACCOUNT_TYPE_CONFIG: Record<
  AccountType,
  { label: string; bgClass: string; textClass: string }
> = {
  individual: {
    label: 'Individual',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600',
  },
  business: {
    label: 'Business',
    bgClass: 'bg-accent-light',
    textClass: 'text-amber-700',
  },
  agent_landlord: {
    label: 'Agent / Landlord',
    bgClass: 'bg-primary-light',
    textClass: 'text-primary-dark',
  },
};

const SETTINGS_ITEMS = [
  { label: 'Edit Profile', icon: UserPen, href: '#', comingSoon: false },
  { label: 'Notification Preferences', icon: Bell, href: '#', comingSoon: true },
  { label: 'Safety Tips', icon: ShieldCheck, href: '#', comingSoon: false },
  { label: 'Help & Support', icon: HelpCircle, href: '#', comingSoon: false },
];

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Package;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-3 bg-surface rounded-xl border border-border">
      <Icon size={18} className="text-muted" />
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

function SettingsRow({
  label,
  icon: Icon,
  href,
  comingSoon,
  variant = 'default',
  onClick,
}: {
  label: string;
  icon: typeof UserPen;
  href?: string;
  comingSoon?: boolean;
  variant?: 'default' | 'danger';
  onClick?: () => void;
}) {
  const content = (
    <>
      <Icon
        size={18}
        className={cn(variant === 'danger' ? 'text-danger' : 'text-muted')}
      />
      <span
        className={cn(
          'flex-1 text-sm font-medium',
          variant === 'danger' ? 'text-danger' : 'text-foreground',
        )}
      >
        {label}
      </span>
      {comingSoon && (
        <span className="text-[10px] font-semibold text-muted bg-surface border border-border rounded-full px-2 py-0.5">
          Coming soon
        </span>
      )}
      <ChevronRight
        size={16}
        className={cn(variant === 'danger' ? 'text-danger/40' : 'text-border')}
      />
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface transition-colors text-left',
          variant === 'danger' && 'hover:bg-danger-light',
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href || '#'}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 hover:bg-surface transition-colors',
        variant === 'danger' && 'hover:bg-danger-light',
      )}
    >
      {content}
    </Link>
  );
}

function MyMarketCard({ listing }: { listing: MarketListingWithDetails }) {
  const img = listing.market_listing_images[0];
  const hasImage = img && img.image_url;

  return (
    <Link href={`/market/${listing.id}`} className="flex gap-3 p-3 hover:bg-surface transition-colors rounded-lg">
      <div className="w-14 h-14 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag size={20} className="text-border" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{listing.title}</p>
        <p className="text-xs text-primary font-medium">{formatPrice(listing.price_amount, listing.currency)}</p>
        <p className="text-[11px] text-muted">{timeAgo(listing.created_at)}</p>
      </div>
    </Link>
  );
}

function MyPropertyCard({ listing }: { listing: PropertyListingWithDetails }) {
  const img = listing.property_listing_images[0];
  const hasImage = img && img.image_url;
  const isRent = listing.listing_mode === 'rent';

  return (
    <Link href={`/property/${listing.id}`} className="flex gap-3 p-3 hover:bg-surface transition-colors rounded-lg">
      <div className="w-14 h-14 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <Home size={20} className="text-border" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{listing.title}</p>
        <p className="text-xs text-primary font-medium">
          {formatPrice(listing.price_amount, listing.currency)}{isRent ? '/mo' : ''}
        </p>
        <p className="text-[11px] text-muted">{timeAgo(listing.created_at)}</p>
      </div>
    </Link>
  );
}

function MyPostCard({ post }: { post: DiscoverPostWithDetails }) {
  return (
    <Link href={`/discover/${post.id}`} className="flex gap-3 p-3 hover:bg-surface transition-colors rounded-lg">
      <div className="w-14 h-14 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
        <MessageSquare size={20} className="text-border" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{post.title}</p>
        <p className="text-xs text-muted capitalize">{post.post_type} post</p>
        <p className="text-[11px] text-muted">{timeAgo(post.created_at)}</p>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const { marketListings, propertyListings, discoverPosts } = useData();

  const myMarketListings = useMemo(
    () => (user ? marketListings.filter((l) => l.user_id === user.id) : []),
    [marketListings, user],
  );
  const myPropertyListings = useMemo(
    () => (user ? propertyListings.filter((p) => p.user_id === user.id) : []),
    [propertyListings, user],
  );
  const myPosts = useMemo(
    () => (user ? discoverPosts.filter((p) => p.user_id === user.id) : []),
    [discoverPosts, user],
  );

  const totalListings = myMarketListings.length + myPropertyListings.length;
  const totalPosts = myPosts.length;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Not logged in
  if (!loading && !user) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4">
          <UserPen size={28} className="text-muted" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Sign in to view your profile</h2>
        <p className="text-sm text-muted mb-6">
          Create an account or log in to manage your listings and posts.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-surface text-primary rounded-lg text-sm font-medium border border-border hover:bg-primary-light transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-muted">Loading profile...</p>
      </div>
    );
  }

  const displayName = profile?.name || user?.user_metadata?.name || user?.email || 'User';
  const accountType: AccountType = (profile?.account_type as AccountType) || 'individual';
  const typeConfig = ACCOUNT_TYPE_CONFIG[accountType];
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="px-4 py-4">
      {/* Profile header card */}
      <div className="bg-white border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary-dark">
              {initials}
            </span>
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-foreground truncate">
                {displayName}
              </h1>
              {profile?.is_verified_business && (
                <BadgeCheck size={18} className="text-blue-500 flex-shrink-0" />
              )}
            </div>

            {/* Account type badge */}
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                typeConfig.bgClass,
                typeConfig.textClass,
              )}
            >
              {typeConfig.label}
            </span>

            {/* Member since */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted">
                Member since {memberSince(profile?.created_at || user?.created_at || '')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-4">
        <StatCard label="Listings" value={totalListings} icon={Store} />
        <StatCard label="Posts" value={totalPosts} icon={MessageSquare} />
      </div>

      {/* My Market Listings */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Market Listings</h3>
            <span className="text-xs text-muted">({myMarketListings.length})</span>
          </div>
          {myMarketListings.length > 0 && (
            <Link href="/market" className="text-xs text-primary font-semibold hover:underline">
              View all
            </Link>
          )}
        </div>
        {myMarketListings.length > 0 ? (
          <div className="divide-y divide-border">
            {myMarketListings.slice(0, 3).map((listing) => (
              <MyMarketCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center">
            <ShoppingBag size={24} className="text-border mx-auto mb-2" />
            <p className="text-xs text-muted mb-2">No market listings yet</p>
            <Link href="/market/create" className="text-xs text-primary font-semibold hover:underline">
              Create a listing
            </Link>
          </div>
        )}
      </div>

      {/* My Property Listings */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Home size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Property Listings</h3>
            <span className="text-xs text-muted">({myPropertyListings.length})</span>
          </div>
          {myPropertyListings.length > 0 && (
            <Link href="/property" className="text-xs text-primary font-semibold hover:underline">
              View all
            </Link>
          )}
        </div>
        {myPropertyListings.length > 0 ? (
          <div className="divide-y divide-border">
            {myPropertyListings.slice(0, 3).map((listing) => (
              <MyPropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center">
            <Home size={24} className="text-border mx-auto mb-2" />
            <p className="text-xs text-muted mb-2">No property listings yet</p>
            <Link href="/property/create" className="text-xs text-primary font-semibold hover:underline">
              List a property
            </Link>
          </div>
        )}
      </div>

      {/* My Posts */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">My Posts</h3>
            <span className="text-xs text-muted">({myPosts.length})</span>
          </div>
          {myPosts.length > 0 && (
            <Link href="/discover" className="text-xs text-primary font-semibold hover:underline">
              View all
            </Link>
          )}
        </div>
        {myPosts.length > 0 ? (
          <div className="divide-y divide-border">
            {myPosts.slice(0, 3).map((post) => (
              <MyPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center">
            <MessageSquare size={24} className="text-border mx-auto mb-2" />
            <p className="text-xs text-muted mb-2">No posts yet</p>
            <Link href="/post" className="text-xs text-primary font-semibold hover:underline">
              Create a post
            </Link>
          </div>
        )}
      </div>

      {/* Settings section */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Settings</h3>
        </div>
        <div className="divide-y divide-border">
          {SETTINGS_ITEMS.map((item) => (
            <SettingsRow
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={item.href}
              comingSoon={item.comingSoon}
            />
          ))}
        </div>
      </div>

      {/* Log out */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
        <SettingsRow
          label="Log Out"
          icon={LogOut}
          variant="danger"
          onClick={handleSignOut}
        />
      </div>
    </div>
  );
}
