'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, MapPin, X, LogOut, ChevronDown, Bell, Car, Store } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRegion } from '@/context/RegionContext';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';
import { REGIONS_WITH_ALL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { FeyButton } from '@/components/ui/fey-button';

export default function TopNav() {
  const { selectedRegion, setSelectedRegion, regionName } = useRegion();
  const { query, setQuery } = useSearch();
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [regionOpen, setRegionOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase.rpc('get_unread_notification_count');
    if (typeof data === 'number') setUnreadCount(data);
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    // Re-fetch when notifications are marked read (dispatched from notifications page)
    const handleRead = () => fetchUnreadCount();
    window.addEventListener('notifications-read', handleRead);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications-read', handleRead);
    };
  }, [fetchUnreadCount]);

  // Re-fetch unread count when navigating away from notifications page
  useEffect(() => {
    if (pathname !== '/notifications') fetchUnreadCount();
  }, [pathname, fetchUnreadCount]);

  // Push notification subscription
  useEffect(() => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    async function subscribePush() {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) return; // already subscribed

        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });
        const json = sub.toJSON();
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
        });
      } catch (err) {
        console.error('Push subscription failed:', err);
      }
    }
    subscribePush();
  }, [user]);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const isRidesPage = pathname.startsWith('/rides');
  const isStoreLanding = pathname === '/store' || pathname.startsWith('/store/about') || pathname.startsWith('/store/directory');
  const isHomeServices = pathname.startsWith('/home-services');
  const isFullWidthPage = isRidesPage || isStoreLanding || isHomeServices;

  const displayName = profile?.name || user?.user_metadata?.name || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-soft">
      <div className={cn(
        "mx-auto flex items-center justify-between px-4",
        isFullWidthPage ? "max-w-6xl h-16" : "max-w-3xl h-14"
      )}>
        {/* Logo — show sub-brand on /rides and /store pages */}
        {isRidesPage ? (
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/rides" className="flex items-center gap-1">
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">YuhRide</span>
            </Link>
            <Link href="/" className="hidden sm:flex items-center gap-1">
              <span className="text-xs text-muted font-medium">powered by</span>
              <img src="/logo.svg" alt="YuhPlace" className="h-6" />
            </Link>
          </div>
        ) : isStoreLanding ? (
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/store" className="flex items-center gap-1">
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">YuhStore</span>
            </Link>
            <Link href="/" className="hidden sm:flex items-center gap-1">
              <span className="text-xs text-muted font-medium">powered by</span>
              <img src="/logo.svg" alt="YuhPlace" className="h-6" />
            </Link>
          </div>
        ) : (
          <Link href="/" className="flex-shrink-0">
            <img src="/logo.svg" alt="YuhPlace" className="h-9" />
          </Link>
        )}

        {/* Region selector + Search + Auth */}
        <div className="flex items-center gap-0.5">
          {/* Rides page header actions */}
          {isRidesPage && (
            <>
              <Link href="/rides/about" className="hidden sm:block mr-1 text-xs text-muted hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-surface">
                Learn More
              </Link>
              <Link href="/rides/register" className="hidden sm:block mr-2">
                <FeyButton icon={<Car size={16} />}>
                  Register as a Driver
                </FeyButton>
              </Link>
            </>
          )}

          {/* Store page header actions */}
          {isStoreLanding && (
            <>
              <Link href="/store/about" className="hidden sm:block mr-1 text-xs text-muted hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-surface">
                Learn More
              </Link>
              <Link href="/store/create" className="hidden sm:block mr-2">
                <FeyButton icon={<Store size={16} />}>
                  Create a Store
                </FeyButton>
              </Link>
            </>
          )}

          <div className="relative">
            <button
              onClick={() => { setRegionOpen(!regionOpen); setSearchOpen(false); }}
              className="flex items-center gap-1 text-xs sm:text-sm text-muted hover:text-foreground transition-colors px-1.5 py-1 rounded-lg hover:bg-surface"
            >
              <MapPin size={13} className={cn('flex-shrink-0', selectedRegion !== 'all' && 'text-primary')} />
              <span className="max-w-[72px] sm:max-w-[100px] truncate">{regionName}</span>
            </button>
            {regionOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRegionOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[200px] max-h-[300px] overflow-y-auto">
                  {REGIONS_WITH_ALL.map((region) => (
                    <button
                      key={region.slug}
                      onClick={() => {
                        setSelectedRegion(region.slug);
                        setRegionOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface transition-colors ${
                        selectedRegion === region.slug ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => { setSearchOpen(!searchOpen); setRegionOpen(false); }}
            className={cn(
              'p-1.5 transition-colors rounded-lg',
              searchOpen ? 'text-primary bg-primary-light' : 'text-muted hover:text-foreground hover:bg-surface'
            )}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* Notifications bell */}
          {user && (
            <Link
              href="/notifications"
              className="relative p-1.5 text-muted hover:text-foreground hover:bg-surface transition-colors rounded-lg"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] font-bold rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth indicator */}
          {!loading && (
            user ? (
              <div className="relative ml-0.5">
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setRegionOpen(false); setSearchOpen(false); }}
                  className="flex items-center gap-0.5 flex-shrink-0"
                >
                  <span className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-dark">
                      {initials}
                    </span>
                  </span>
                  <ChevronDown size={12} className={cn('text-muted transition-transform', userMenuOpen && 'rotate-180')} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors flex items-center gap-2"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOut();
                          router.push('/');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-surface transition-colors flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href={`/login${pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : ''}`}
                className="ml-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark transition-colors whitespace-nowrap"
              >
                Log in
              </Link>
            )
          )}
        </div>
      </div>

      {/* Search bar (expandable) */}
      {searchOpen && (
        <form onSubmit={handleSearch} className="border-t border-border/30 px-4 py-2 bg-white">
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search listings, rentals, services, or updates..."
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </form>
      )}
    </header>
  );
}
