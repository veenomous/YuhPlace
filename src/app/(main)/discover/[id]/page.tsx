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
    .select('title, description, discover_post_images(image_url)')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (!post) {
    return { title: 'Post not found — YuhPlace' };
  }

  const image = (post.discover_post_images as { image_url: string }[])?.[0]?.image_url;
  const description = post.description.slice(0, 160);

  return {
    title: `${post.title} — YuhPlace`,
    description,
    openGraph: {
      title: post.title,
      description,
      url: `https://yuhplace.vercel.app/discover/${id}`,
      type: 'article',
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      ...(image && { images: [image] }),
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
