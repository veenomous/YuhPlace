import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AgentStorefrontClient from './client-page';
import type { PropertyListingWithDetails } from '@/types/database';

interface Agent {
  id: string;
  name: string;
  avatar_url: string | null;
  partner_name: string | null;
  partner_logo_url: string | null;
  partner_slug: string;
  partner_tagline: string | null;
  partner_bio: string | null;
  partner_banner_url: string | null;
  whatsapp_number: string | null;
  phone: string | null;
  created_at: string;
}

async function loadAgent(slug: string): Promise<{
  agent: Agent | null;
  active: PropertyListingWithDetails[];
  archived: PropertyListingWithDetails[];
}> {
  const supabase = await createClient();
  const { data: agentJson } = await supabase.rpc('get_agent_storefront', { p_slug: slug });
  const agent = agentJson as Agent | null;
  if (!agent?.id) {
    return { agent: null, active: [], archived: [] };
  }

  const profileJoin =
    'id, name, avatar_url, is_verified_business, is_verified_partner, partner_name, partner_logo_url, created_at';
  const selectStr = `*, profiles(${profileJoin}), regions(name, slug), property_listing_images(*)`;

  const [{ data: activeData }, { data: archivedData }] = await Promise.all([
    supabase
      .from('property_listings')
      .select(selectStr)
      .eq('user_id', agent.id)
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('property_listings')
      .select(selectStr)
      .eq('user_id', agent.id)
      .in('status', ['sold', 'rented'])
      .order('updated_at', { ascending: false })
      .limit(12),
  ]);

  return {
    agent,
    active: (activeData as unknown as PropertyListingWithDetails[]) ?? [],
    archived: (archivedData as unknown as PropertyListingWithDetails[]) ?? [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { agent } = await loadAgent(slug);
  if (!agent) return { title: 'Agent not found' };
  const name = agent.partner_name || agent.name;
  const tagline = agent.partner_tagline || 'Verified Partner on YuhPlace';
  return {
    title: `${name} · YuhPlace`,
    description: `${tagline}. Browse active listings and request a viewing — on YuhPlace.`,
    openGraph: {
      title: `${name} · YuhPlace`,
      description: tagline,
      images: agent.partner_banner_url ? [{ url: agent.partner_banner_url }] : undefined,
    },
  };
}

export default async function AgentStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { agent, active, archived } = await loadAgent(slug);
  if (!agent) notFound();
  return <AgentStorefrontClient agent={agent} activeListings={active} archivedListings={archived} />;
}
