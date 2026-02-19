import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getPostsByCategory(categorySlug) {
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single();

  if (!category) return { category: null, posts: [] };

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('category_id', category.id)
    .eq('draft', false)
    .order('published_at', { ascending: false });

  return { category, posts: posts || [] };
}

export async function getAllPosts() {
  const { data } = await supabase
    .from('posts')
    .select('*, categories(name, slug)')
    .eq('draft', false)
    .order('published_at', { ascending: false });
  return data || [];
}

export async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  return data || [];
}

export async function getTags() {
  const { data } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });
  return data || [];
}
