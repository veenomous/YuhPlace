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
    .select('title, description, price_amount, currency, market_listing_images(image_url)')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (!listing) {
    return { title: 'Listing not found — YuhPlace' };
  }

  const image = (listing.market_listing_images as { image_url: string }[])?.[0]?.image_url;
  const price = listing.price_amount
    ? `$${listing.price_amount.toLocaleString()} ${listing.currency}`
    : 'Contact for price';
  const description = `${price} — ${listing.description.slice(0, 140)}`;

  return {
    title: `${listing.title} — YuhPlace`,
    description,
    openGraph: {
      title: listing.title,
      description,
      url: `https://yuhplace.vercel.app/market/${id}`,
      type: 'article',
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: listing.title,
      description,
      ...(image && { images: [image] }),
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
