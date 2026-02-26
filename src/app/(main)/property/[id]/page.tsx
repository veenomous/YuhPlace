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
    .select('title, description, price_amount, currency, listing_mode, property_type, bedrooms, bathrooms, neighborhood_text, property_listing_images(image_url)')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (!property) {
    return { title: 'Property not found — YuhPlace' };
  }

  const DEFAULT_OG = 'https://yuhplace.vercel.app/opengraph-image';
  const image = (property.property_listing_images as { image_url: string }[])?.[0]?.image_url ?? DEFAULT_OG;
  const price = `$${property.price_amount.toLocaleString()} ${property.currency}`;
  const mode = property.listing_mode === 'rent' ? 'Rent' : 'Sale';
  const priceSuffix = property.listing_mode === 'rent' ? '/mo' : '';
  const type = (property.property_type as string).replace(/_/g, ' ');
  const location = property.neighborhood_text ? ` in ${property.neighborhood_text}` : '';
  const beds = property.bedrooms ? `${property.bedrooms} bed` : '';
  const baths = property.bathrooms ? `${property.bathrooms} bath` : '';
  const specs = [beds, baths].filter(Boolean).join(', ');
  const suffix = ' | YuhPlace';
  const full = `${property.title} — for ${mode}${suffix}`;
  const ogTitle = full.length <= 60
    ? full
    : `${property.title}${suffix}`.length <= 60
      ? `${property.title}${suffix}`
      : `${property.title.slice(0, 60 - suffix.length - 3)}...${suffix}`;
  const description = `${price}${priceSuffix}. ${specs ? specs + ' ' : ''}${type} for ${mode.toLowerCase()}${location} on YuhPlace. ${property.description.slice(0, 100)}`;

  return {
    title: ogTitle,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: `https://yuhplace.vercel.app/property/${id}`,
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

export default async function PropertyListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyListingClient id={id} />;
}
