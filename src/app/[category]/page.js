import { getPostsByCategory, getCategories } from '@/lib/queries';
import CategoryPage from '@/components/CategoryPage';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { category } = await getPostsByCategory(params.category);
  if (!category) return { title: 'Not found' };
  return {
    title: `${category.name} — Regald Apps`,
    description: category.description || `${category.name} — Regald Apps`,
  };
}

export default async function DynamicCategoryPage({ params }) {
  const { category, posts } = await getPostsByCategory(params.category);
  if (!category) notFound();
  return <CategoryPage category={category} posts={posts} />;
}
