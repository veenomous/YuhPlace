'use client';

import Link from 'next/link';
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
} from 'lucide-react';
import { cn, memberSince } from '@/lib/utils';
import type { AccountType } from '@/types/database';

// ---------------------------------------------------------------------------
// Mock profile data
// ---------------------------------------------------------------------------

const MOCK_PROFILE = {
  id: 'mock-user-1',
  name: 'Rajesh Persaud',
  account_type: 'individual' as AccountType,
  avatar_url: null,
  region: 'Georgetown',
  is_verified_business: false,
  created_at: '2024-11-15T00:00:00Z',
  stats: {
    listings: 4,
    posts: 7,
  },
};

// ---------------------------------------------------------------------------
// Account type badge config
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Settings items
// ---------------------------------------------------------------------------

const SETTINGS_ITEMS = [
  {
    label: 'Edit Profile',
    icon: UserPen,
    href: '#',
    comingSoon: false,
  },
  {
    label: 'Notification Preferences',
    icon: Bell,
    href: '#',
    comingSoon: true,
  },
  {
    label: 'Safety Tips',
    icon: ShieldCheck,
    href: '#',
    comingSoon: false,
  },
  {
    label: 'Help & Support',
    icon: HelpCircle,
    href: '#',
    comingSoon: false,
  },
];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

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
}: {
  label: string;
  icon: typeof UserPen;
  href: string;
  comingSoon?: boolean;
  variant?: 'default' | 'danger';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 hover:bg-surface transition-colors',
        variant === 'danger' && 'hover:bg-danger-light',
      )}
    >
      <Icon
        size={18}
        className={cn(
          variant === 'danger' ? 'text-danger' : 'text-muted',
        )}
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
        className={cn(
          variant === 'danger' ? 'text-danger/40' : 'text-border',
        )}
      />
    </Link>
  );
}

function PlaceholderSection({
  title,
  count,
  icon: Icon,
  linkHref,
}: {
  title: string;
  count: number;
  icon: typeof Package;
  linkHref: string;
}) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-xs text-muted">({count})</span>
        </div>
        <Link href={linkHref} className="text-xs text-primary font-semibold hover:underline">
          View all
        </Link>
      </div>
      <div className="px-4 py-8 text-center">
        <Icon size={28} className="text-border mx-auto mb-2" />
        <p className="text-xs text-muted">
          Your {title.toLowerCase()} will appear here
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const profile = MOCK_PROFILE;
  const typeConfig = ACCOUNT_TYPE_CONFIG[profile.account_type];
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

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
                {profile.name}
              </h1>
              {profile.is_verified_business && (
                <BadgeCheck size={18} className="text-primary flex-shrink-0" />
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

            {/* Region & member since */}
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-muted">
                <MapPin size={12} />
                {profile.region}
              </span>
              <span className="text-xs text-muted">
                Member since {memberSince(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-4">
        <StatCard
          label="Listings"
          value={profile.stats.listings}
          icon={Store}
        />
        <StatCard
          label="Posts"
          value={profile.stats.posts}
          icon={MessageSquare}
        />
      </div>

      {/* My Listings section */}
      <div className="mb-4">
        <PlaceholderSection
          title="My Listings"
          count={profile.stats.listings}
          icon={Package}
          linkHref="/market"
        />
      </div>

      {/* My Posts section */}
      <div className="mb-4">
        <PlaceholderSection
          title="My Posts"
          count={profile.stats.posts}
          icon={MessageSquare}
          linkHref="/discover"
        />
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
          href="/login"
          variant="danger"
        />
      </div>
    </div>
  );
}
