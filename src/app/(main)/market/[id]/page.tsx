import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import MarketListingClient from './client-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from('market_listings')
    .select('title, description, price_amount, currency, condition, market_listing_images(image_url)')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (!listing) {
    return { title: 'Listing not found — YuhPlace' };
  }

  const DEFAULT_OG = 'https://yuhplace.vercel.app/opengraph-image';
  const image = (listing.market_listing_images as { image_url: string }[])?.[0]?.image_url ?? DEFAULT_OG;
  const price = listing.price_amount
    ? `$${listing.price_amount.toLocaleString()} ${listing.currency}`
    : 'Contact for price';
  const cond = (listing.condition as string).replace(/_/g, ' ');
  const suffix = ' | YuhPlace';
  const full = `${listing.title} — ${price}${suffix}`;
  const ogTitle = full.length <= 60
    ? full
    : `${listing.title}${suffix}`.length <= 60
      ? `${listing.title}${suffix}`
      : `${listing.title.slice(0, 60 - suffix.length - 3)}...${suffix}`;
  const description = `${price}. ${cond} item for sale on YuhPlace — Guyana's marketplace. ${listing.description.slice(0, 100)}`;

  return {
    title: ogTitle,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: `https://yuhplace.vercel.app/market/${id}`,
      type: 'article',
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [image],
    },
  };
}

export default async function MarketListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MarketListingClient id={id} />;
}
