import { createClient } from '@supabase/supabase-js';
import { localizedField } from '@/lib/localize';
import PostContent from './PostContent';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const { data: post } = await supabase.from('posts').select('title, description').eq('slug', slug).single();
  if (!post) return { title: 'Not found' };
  return {
    title: `${localizedField(post.title, locale)} — Regald Apps`,
    description: localizedField(post.description, locale),
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const { data: post } = await supabase.from('posts').select('*').eq('slug', slug).single();
  if (!post) notFound();
  return <PostContent post={post} />;
}
