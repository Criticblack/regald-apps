import { getPostsByCategory } from '@/lib/queries';
import CategoryPage from '@/components/CategoryPage';
import { notFound } from 'next/navigation';

export const revalidate = 60;
export const metadata = { title: 'Streamuri — Regald Tech' };

export default async function StreamuriPage() {
  const { category, posts } = await getPostsByCategory('streamuri');
  if (!category) notFound();
  return <CategoryPage category={category} posts={posts} />;
}
