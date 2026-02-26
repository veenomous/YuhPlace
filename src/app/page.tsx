'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Compass,
  ShoppingBag,
  Home,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Briefcase,
  Users,
  Globe,
  Zap,
  Heart,
  ShieldCheck,
  BedDouble,
  Bath,
  Car,
  Building2,
  LandPlot,
  Facebook,
  Instagram,
  Twitter,
  User,
  LogOut,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const FEATURED_LISTINGS = [
  {
    id: 'm1',
    title: 'Samsung Galaxy S24 Ultra - 256GB',
    price: 385000,
    region: 'Georgetown',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'm2',
    title: '2019 Honda Civic LX - Low Mileage',
    price: 6500000,
    region: 'East Bank Demerara',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'm6',
    title: '55" TCL Smart TV - 4K Android',
    price: 145000,
    region: 'Georgetown',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    id: 'm7',
    title: 'Kipor 8kVA Generator - Like New',
    price: 520000,
    region: 'Linden',
    gradient: 'from-orange-400 to-red-500',
  },
];

const DISCOVER_POSTS = [
  {
    id: 'd1',
    type: 'alert' as const,
    title: 'Flooding on Sheriff Street - Avoid the Area',
    region: 'Georgetown',
    time: '25m ago',
  },
  {
    id: 'd2',
    type: 'event' as const,
    title: 'Mashramani Float Parade - Route & Schedule',
    region: 'Georgetown',
    time: '3h ago',
  },
  {
    id: 'd3',
    type: 'business' as const,
    title: 'New Roti Shop Opening in Berbice!',
    region: 'Berbice',
    time: '8h ago',
  },
  {
    id: 'd4',
    type: 'community' as const,
    title: 'Community Clean-Up Day - East Coast Demerara',
    region: 'East Coast Demerara',
    time: '14h ago',
  },
];

const FEATURED_PROPERTIES = [
  {
    id: 'p1',
    title: 'Modern 2-Bedroom Apartment in Georgetown',
    price: 120000,
    mode: 'rent' as const,
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    region: 'Georgetown',
    gradient: 'from-sky-400 to-blue-600',
  },
  {
    id: 'p2',
    title: 'Elegant 3-Bedroom House in Bel Air Park',
    price: 45000000,
    mode: 'sale' as const,
    type: 'House',
    bedrooms: 3,
    bathrooms: 2,
    region: 'Georgetown',
    gradient: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'p6',
    title: 'Modern 4-Bedroom House in Providence',
    price: 65000000,
    mode: 'sale' as const,
    type: 'House',
    bedrooms: 4,
    bathrooms: 3,
    region: 'East Bank Demerara',
    gradient: 'from-lime-400 to-green-600',
  },
];

const POST_TYPE_CONFIG = {
  alert: {
    label: 'Alert',
    bgClass: 'bg-tag-alert-light',
    textClass: 'text-tag-alert',
    icon: AlertTriangle,
  },
  event: {
    label: 'Event',
    bgClass: 'bg-tag-event-light',
    textClass: 'text-tag-event',
    icon: Calendar,
  },
  business: {
    label: 'Business',
    bgClass: 'bg-tag-business-light',
    textClass: 'text-tag-business',
    icon: Briefcase,
  },
  community: {
    label: 'Community',
    bgClass: 'bg-tag-community-light',
    textClass: 'text-tag-community',
    icon: Users,
  },
} as const;

const VALUE_PROPS = [
  {
    icon: Globe,
    title: 'Local-First',
    description: 'Built specifically for Guyana. Content, categories, and regions made for your community.',
  },
  {
    icon: Zap,
    title: 'Easy to Post',
    description: 'List in under 60 seconds. No complicated forms, just what matters.',
  },
  {
    icon: Heart,
    title: 'Community-Powered',
    description: 'Real updates from real people. Alerts, events, and news from your neighbours.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted',
    description: 'Verified profiles and active moderation to keep the community safe.',
  },
];

const QUICK_ACCESS = [
  {
    icon: Compass,
    title: 'Discover',
    description: 'Local alerts, events, and community updates',
    href: '/discover',
    color: 'text-primary',
    bgColor: 'bg-primary-light',
  },
  {
    icon: ShoppingBag,
    title: 'Market',
    description: 'Buy, sell, and find services',
    href: '/market',
    color: 'text-success',
    bgColor: 'bg-success-light',
  },
  {
    icon: Home,
    title: 'Property',
    description: 'Rentals, homes, land, and more',
    href: '/property',
    color: 'text-accent',
    bgColor: 'bg-accent-light',
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  const displayName = profile?.name || user?.user_metadata?.name || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ────────── Top Bar ────────── */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-end">
          {!loading && (
            user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-border hover:bg-white transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-dark">{initials}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{displayName.split(' ')[0]}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[160px] z-50">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors"
                    >
                      <User size={15} className="text-muted" />
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-danger hover:bg-surface transition-colors"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      {/* ────────── Section 1: Hero ────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-light via-background to-background">
        {/* Decorative background circles */}
        <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] rounded-full bg-primary/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[200px] h-[200px] rounded-full bg-primary/5" />

        <div className="relative max-w-3xl mx-auto px-5 pt-16 pb-12 md:pt-24 md:pb-20 text-center">
          {/* Logo / Wordmark */}
          <div className="inline-flex items-center mb-6">
            <img src="/logo.png" alt="YuhPlace" className="h-10" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight mb-4">
            Your place for{' '}
            <span className="text-primary">Guyana.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-lg text-muted max-w-lg mx-auto leading-relaxed mb-8">
            Discover local updates, buy and sell nearby, and find rentals, homes, and services.
          </p>

          {/* Search Bar */}
          <form
            className="relative max-w-md mx-auto mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            }}
          >
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search listings, rentals, services, or updates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-border rounded-2xl text-base text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
            />
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link
              href="/discover"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
            >
              Browse YuhPlace
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/post"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white text-primary text-sm font-semibold rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary-light transition-all"
            >
              Post on YuhPlace
            </Link>
          </div>

          {/* Region indicator */}
          <div className="flex items-center justify-center gap-1.5 text-sm text-muted">
            <MapPin size={14} className="text-primary" />
            <span>Starting in <span className="font-medium text-foreground">Georgetown</span></span>
          </div>
        </div>
      </section>

      {/* ────────── Section 2: Quick Access Cards ────────── */}
      <section className="max-w-3xl mx-auto px-5 -mt-2 pb-12 md:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_ACCESS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-start gap-3 p-4 bg-white border border-border rounded-2xl hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className={cn('flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center', item.bgColor)}>
                  <Icon size={20} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <ChevronRight size={16} className="text-border group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted leading-relaxed mt-0.5">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ────────── Section 3: Featured Market Listings ────────── */}
      <section className="bg-surface-warm py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">What&apos;s on the Market</h2>
            <Link
              href="/market"
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
            {FEATURED_LISTINGS.map((listing) => (
              <Link
                key={listing.id}
                href={`/market/${listing.id}`}
                className="group flex-shrink-0 w-[200px] bg-white border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
              >
                {/* Image Placeholder */}
                <div className={cn('w-full h-32 bg-gradient-to-br relative', listing.gradient)}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag size={28} className="text-white/40" />
                  </div>
                </div>
                {/* Details */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                    {listing.title}
                  </h3>
                  <p className="text-sm font-bold text-primary mb-1">
                    {formatPrice(listing.price)}
                  </p>
                  <span className="flex items-center gap-0.5 text-xs text-muted">
                    <MapPin size={10} />
                    {listing.region}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── Section 4: Latest in Discover ────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">What&apos;s Happening</h2>
            <Link
              href="/discover"
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DISCOVER_POSTS.map((post) => {
              const config = POST_TYPE_CONFIG[post.type];
              const TypeIcon = config.icon;
              return (
                <Link
                  key={post.id}
                  href={`/discover/${post.id}`}
                  className="group flex flex-col p-4 bg-white border border-border rounded-xl hover:shadow-sm hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                        config.bgClass,
                        config.textClass
                      )}
                    >
                      <TypeIcon size={12} />
                      {config.label}
                    </span>
                    <span className="text-xs text-muted">{post.time}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-muted mt-auto">
                    <MapPin size={11} />
                    {post.region}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── Section 5: Featured Properties ────────── */}
      <section className="bg-surface py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Find Your Place</h2>
            <Link
              href="/property"
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURED_PROPERTIES.map((property) => {
              const isRent = property.mode === 'rent';
              return (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
                >
                  {/* Image Placeholder */}
                  <div className={cn('relative w-full h-36 bg-gradient-to-br', property.gradient)}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Home size={32} className="text-white/40" />
                    </div>
                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide',
                          isRent ? 'bg-primary text-white' : 'bg-success text-white'
                        )}
                      >
                        For {property.mode}
                      </span>
                    </div>
                    {/* Price overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-6">
                      <p className="text-white font-bold text-base">
                        {formatPrice(property.price)}
                        {isRent && <span className="text-xs font-normal text-white/80">/mo</span>}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2.5 text-xs text-muted mb-1.5">
                      <span>{property.type}</span>
                      {property.bedrooms !== null && (
                        <span className="flex items-center gap-0.5">
                          <BedDouble size={12} />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms !== null && (
                        <span className="flex items-center gap-0.5">
                          <Bath size={12} />
                          {property.bathrooms}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-0.5 text-xs text-muted">
                      <MapPin size={11} />
                      {property.region}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── Section 6: Why YuhPlace ────────── */}
      <section className="bg-surface-warm py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Why YuhPlace?</h2>
            <p className="text-sm text-muted max-w-md mx-auto">
              A platform made for Guyanese, by Guyanese. Here is what makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUE_PROPS.map((prop) => {
              const Icon = prop.icon;
              return (
                <div
                  key={prop.title}
                  className="flex items-start gap-3.5 p-5 bg-white border border-border rounded-2xl"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{prop.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{prop.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── Section 7: Footer ────────── */}
      <footer className="bg-foreground text-white">
        <div className="max-w-3xl mx-auto px-5 py-10 md:py-14">
          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <MapPin size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">YuhPlace</span>
              </div>
              <p className="text-sm text-white/60 max-w-xs leading-relaxed">
                Your local platform for Guyana. Discover, buy, sell, rent, and connect with your community.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
              <Link href="#" className="text-white/60 hover:text-white transition-colors">About</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Safety Tips</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Contact</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Report Content</Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} YuhPlace. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
