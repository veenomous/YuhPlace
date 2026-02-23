'use client';

import Link from 'next/link';
import { use } from 'react';
import { Construction, ArrowLeft } from 'lucide-react';

const PAGE_NAMES: Record<string, string> = {
  discover: 'Discover Posts',
  market: 'Market Listings',
  properties: 'Property Listings',
  users: 'Users',
  featured: 'Featured',
  settings: 'Settings',
};

export default function AdminPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const pageName = PAGE_NAMES[slug[0]] || slug[0];

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
        <Construction size={28} className="text-muted" />
      </div>
      <h1 className="text-xl font-bold text-foreground mb-2">{pageName}</h1>
      <p className="text-sm text-muted mb-6 max-w-md">
        This section is coming soon. The admin dashboard will include full
        management tools for {pageName.toLowerCase()} once connected to
        Supabase.
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light rounded-lg transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
}
