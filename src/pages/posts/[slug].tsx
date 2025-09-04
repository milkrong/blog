import { GetStaticPaths, GetStaticProps } from 'next';
import { getPostSlugs, getPostBySlug } from '../../lib/posts';

type Props = {
  post: {
    slug: string;
    frontMatter: Record<string, any>;
    content: string;
  };
};

export default function PostPage({ post }: Props) {
  return (
    <article>
      <h1>{post.frontMatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getPostSlugs();
  const paths = slugs.map((slug) => ({ params: { slug: slug.replace(/\.md$/, '') } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = await getPostBySlug(slug);
  return { props: { post } };
};
