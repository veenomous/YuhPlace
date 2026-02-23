'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ShoppingBag, Home, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/market', label: 'Market', icon: ShoppingBag },
  { href: '/post', label: 'Post', icon: PlusCircle },
  { href: '/property', label: 'Property', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
      <div className="mx-auto max-w-lg flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          const isPost = href === '/post';

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-xs transition-colors min-w-[64px]',
                isPost && 'relative -mt-3',
                isActive && !isPost && 'text-primary',
                !isActive && !isPost && 'text-muted'
              )}
            >
              {isPost ? (
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg">
                  <Icon size={24} />
                </span>
              ) : (
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              )}
              <span className={cn(
                'font-medium',
                isPost && 'mt-0.5 text-primary'
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
