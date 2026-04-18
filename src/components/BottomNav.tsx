'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ShoppingBag, Home, User, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/property', label: 'Property', icon: Home },
  { href: '/home-services', label: 'Services', icon: Plane },
  { href: '/market', label: 'Market', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-soft-up">
      <div className="mx-auto max-w-3xl flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors min-w-[50px]',
                isActive ? 'text-primary' : 'text-muted'
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
