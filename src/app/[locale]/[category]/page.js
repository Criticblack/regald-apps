import { getPostsByCategory } from '@/lib/queries';
import CategoryPage from '@/components/CategoryPage';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { category: categorySlug, locale } = await params;
  const { category } = await getPostsByCategory(categorySlug);
  if (!category) return { title: 'Not found' };
  const name = typeof category.name === 'object' ? (category.name[locale] || category.name.en || category.name.ro || '') : category.name;
  return {
    title: `${name} — Regald Apps`,
    description: typeof category.description === 'object' ? (category.description[locale] || category.description.en || category.description.ro || '') : (category.description || `${name} — Regald Apps`),
  };
}

export default async function DynamicCategoryPage({ params }) {
  const { category: categorySlug } = await params;
  const { category, posts } = await getPostsByCategory(categorySlug);
  if (!category) notFound();
  return <CategoryPage category={category} posts={posts} />;
}
