'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Flag,
  Compass,
  ShoppingBag,
  Home,
  Users,
  Star,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Sidebar Navigation Config
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Discover Posts', href: '/admin/discover', icon: Compass },
  { label: 'Market Listings', href: '/admin/market', icon: ShoppingBag },
  { label: 'Property Listings', href: '/admin/properties', icon: Home },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Featured', href: '/admin/featured', icon: Star },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col shrink-0 sticky top-0 h-screen">
        {/* Branding */}
        <div className="px-6 py-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">Y</span>
            </div>
            <div>
              <span className="text-base font-bold text-foreground">
                YuhPlace
              </span>
              <span className="ml-1.5 text-xs font-medium text-muted bg-surface px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-light text-primary-dark'
                    : 'text-muted hover:bg-surface hover:text-foreground',
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-xs text-muted">
            Logged in as <span className="font-medium text-foreground">Admin</span>
          </p>
          <Link
            href="/"
            className="text-xs text-primary hover:underline mt-1 inline-block"
          >
            Back to YuhPlace
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
