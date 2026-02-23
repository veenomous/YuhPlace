'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRegion } from '@/context/RegionContext';
import { useSearch } from '@/context/SearchContext';
import { REGIONS_WITH_ALL } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TopNav() {
  const { selectedRegion, setSelectedRegion, regionName } = useRegion();
  const { query, setQuery } = useSearch();
  const router = useRouter();
  const [regionOpen, setRegionOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
      <div className="mx-auto max-w-lg flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-xl font-bold text-primary">YuhPlace</span>
        </Link>

        {/* Region selector + Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => { setRegionOpen(!regionOpen); setSearchOpen(false); }}
              className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-surface"
            >
              <MapPin size={14} className={cn(selectedRegion !== 'all' && 'text-primary')} />
              <span className="max-w-[100px] truncate">{regionName}</span>
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
              'p-2 transition-colors rounded-lg',
              searchOpen ? 'text-primary bg-primary-light' : 'text-muted hover:text-foreground hover:bg-surface'
            )}
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </div>
      </div>

      {/* Search bar (expandable) */}
      {searchOpen && (
        <form onSubmit={handleSearch} className="border-t border-border px-4 py-2 bg-white">
          <div className="mx-auto max-w-lg">
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
