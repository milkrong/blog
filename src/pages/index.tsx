import Link from 'next/link';
import { GetStaticProps } from 'next';
import { getAllPosts } from '../lib/posts';

type Post = {
  slug: string;
  frontMatter: Record<string, any>;
};

interface Props {
  posts: Post[];
}

export default function Home({ posts }: Props) {
  return (
    <main>
      <h1>Blog Posts</h1>
      <ul>
        {posts.map(({ slug, frontMatter }) => (
          <li key={slug}>
            <Link href={`/posts/${slug}`}>{frontMatter.title}</Link>
            {frontMatter.description && <p>{frontMatter.description}</p>}
          </li>
        ))}
      </ul>
    </main>
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
