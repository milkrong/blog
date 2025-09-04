import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import { trpc } from '../utils/trpc';

export default function Home() {
  const { data: posts } = trpc.posts.useQuery();

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Blog Posts</h1>
      {posts?.map((post) => (
        <ArticleCard
          key={post.id}
          slug={post.slug}
          frontMatter={{ title: post.title, description: post.description }}
        />
      ))}
    </Layout>
  );
}
