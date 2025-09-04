import { GetStaticProps } from 'next';
import { getAllPosts } from '../lib/posts';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';

type Post = {
  slug: string;
  frontMatter: Record<string, any>;
};

interface Props {
  posts: Post[];
}

export default function Home({ posts }: Props) {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Blog Posts</h1>
      {posts.map((post) => (
        <ArticleCard key={post.slug} slug={post.slug} frontMatter={post.frontMatter} />
      ))}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = getAllPosts();
  return {
    props: {
      posts,
    },
  };
};
