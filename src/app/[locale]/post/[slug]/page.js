import { createClient } from '@supabase/supabase-js';
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
  const title = typeof post.title === 'object' ? (post.title[locale] || post.title.en || post.title.ro || '') : post.title;
  const description = typeof post.description === 'object' ? (post.description[locale] || post.description.en || post.description.ro || '') : post.description;
  return { title: `${title} — Regald Apps`, description };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const { data: post } = await supabase.from('posts').select('*').eq('slug', slug).single();
  if (!post) notFound();
  return <PostContent post={post} />;
}
