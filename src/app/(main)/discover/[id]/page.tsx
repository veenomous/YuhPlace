import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import DiscoverPostClient from './client-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('discover_posts')
    .select('title, description, post_type, discover_post_images(image_url)')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (!post) {
    return { title: 'Post not found — YuhPlace' };
  }

  const DEFAULT_OG = 'https://yuhplace.vercel.app/opengraph-image';
  const image = (post.discover_post_images as { image_url: string }[])?.[0]?.image_url ?? DEFAULT_OG;
  const type = (post.post_type as string).replace(/_/g, ' ');
  const suffix = ' | YuhPlace';
  const full = `${post.title} — ${type}${suffix}`;
  const ogTitle = full.length <= 60
    ? full
    : `${post.title}${suffix}`.length <= 60
      ? `${post.title}${suffix}`
      : `${post.title.slice(0, 60 - suffix.length - 3)}...${suffix}`;
  const descText = post.description.length >= 110
    ? post.description.slice(0, 155)
    : `${post.description} — Discover local updates, news, and community posts in Guyana on YuhPlace.`;
  const description = descText.slice(0, 160);

  return {
    title: ogTitle,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: `https://yuhplace.vercel.app/discover/${id}`,
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

export default async function DiscoverPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DiscoverPostClient id={id} />;
}
