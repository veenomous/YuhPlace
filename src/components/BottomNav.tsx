'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ShoppingBag, Home, PlusCircle, User, Tag, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/market', label: 'Market', icon: ShoppingBag },
  { href: '__action__', label: 'Post', icon: PlusCircle },
  { href: '/property', label: 'Property', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
];

// Determines what the center action button should show based on current page
function getActionButton(pathname: string) {
  if (pathname.startsWith('/market')) {
    return { href: '/market/create', label: 'Sell', icon: Tag };
  }
  if (pathname.startsWith('/property')) {
    return { href: '/property/create', label: 'List', icon: Building2 };
  }
  return { href: '/post', label: 'Post', icon: PlusCircle };
}

export default function BottomNav() {
  const pathname = usePathname();
  const actionButton = getActionButton(pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-soft-up">
      <div className="mx-auto max-w-lg flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isAction = item.href === '__action__';
          const href = isAction ? actionButton.href : item.href;
          const label = isAction ? actionButton.label : item.label;
          const Icon = isAction ? actionButton.icon : item.icon;
          const isActive = !isAction && pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-xs transition-colors min-w-[64px]',
                isAction && 'relative -mt-3',
                isActive && !isAction && 'text-primary',
                !isActive && !isAction && 'text-muted'
              )}
            >
              {isAction ? (
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg ring-4 ring-primary/10">
                  <Icon size={24} />
                </span>
              ) : (
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              )}
              <span className={cn(
                'font-medium',
                isAction && 'mt-0.5 text-primary'
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
