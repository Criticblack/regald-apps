import { getPostsByCategory } from '@/lib/queries';
import { localizedField } from '@/lib/localize';
import CategoryPage from '@/components/CategoryPage';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { category: categorySlug, locale } = await params;
  const { category } = await getPostsByCategory(categorySlug);
  if (!category) return { title: 'Not found' };
  const name = localizedField(category.name, locale);
  const desc = localizedField(category.description, locale);
  return {
    title: `${name} — Regald Tech`,
    description: desc || `${name} — Regald Tech`,
  };
}

export default async function DynamicCategoryPage({ params }) {
  const { category: categorySlug } = await params;
  const { category, posts } = await getPostsByCategory(categorySlug);
  if (!category) notFound();
  return <CategoryPage category={category} posts={posts} />;
}
