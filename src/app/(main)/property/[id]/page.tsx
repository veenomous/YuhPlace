import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PropertyListingClient from './client-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('property_listings')
    .select('title, description, price_amount, currency, listing_mode, property_listing_images(image_url)')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (!property) {
    return { title: 'Property not found — YuhPlace' };
  }

  const image = (property.property_listing_images as { image_url: string }[])?.[0]?.image_url;
  const price = `$${property.price_amount.toLocaleString()} ${property.currency}`;
  const suffix = property.listing_mode === 'rent' ? '/mo' : '';
  const description = `${price}${suffix} — ${property.description.slice(0, 140)}`;

  return {
    title: `${property.title} — YuhPlace`,
    description,
    openGraph: {
      title: property.title,
      description,
      url: `https://yuhplace.vercel.app/property/${id}`,
      type: 'article',
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: property.title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function PropertyListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyListingClient id={id} />;
}
