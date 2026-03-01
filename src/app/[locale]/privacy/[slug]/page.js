import { createClient } from '@supabase/supabase-js';
import { localizedField } from '@/lib/localize';
import PrivacyPolicyContent from './PrivacyPolicyContent';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const { data: topic } = await supabase
    .from('roadmap_topics')
    .select('title')
    .eq('slug', slug)
    .single();
  if (!topic) return { title: 'Not found' };
  return {
    title: `Privacy Policy — ${localizedField(topic.title, locale)} — Regald Tech`,
  };
}

export default async function PrivacyPolicyPage({ params }) {
  const { slug } = await params;
  const { data: topic } = await supabase
    .from('roadmap_topics')
    .select('*')
    .eq('slug', slug)
    .single();
  if (!topic) notFound();
  return <PrivacyPolicyContent topic={topic} />;
}
