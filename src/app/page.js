import { getAllPosts, getCategories } from '@/lib/queries';
import HomeClient from './HomeClient';

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getAllPosts();
  const categories = await getCategories();
  return <HomeClient posts={posts} categories={categories} />;
}
