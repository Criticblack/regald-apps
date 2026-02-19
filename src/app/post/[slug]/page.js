import { createClient } from '@supabase/supabase-js';
import PostContent from './PostContent';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { data: post } = await supabase.from('posts').select('title, description').eq('slug', params.slug).single();
  if (!post) return { title: 'Not found' };
  return { title: `${post.title} — Regald Apps`, description: post.description };
}

export default async function PostPage({ params }) {
  const { data: post } = await supabase.from('posts').select('*').eq('slug', params.slug).single();
  if (!post) notFound();
  return <PostContent post={post} />;
}
