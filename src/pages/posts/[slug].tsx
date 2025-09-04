import { GetStaticPaths, GetStaticProps } from 'next';
import { getPostSlugs, getPostBySlug } from '../../lib/posts';
import Layout from '../../components/Layout';
import Tag from '../../components/Tag';

type Props = {
  post: {
    slug: string;
    frontMatter: Record<string, any>;
    content: string;
  };
};

export default function PostPage({ post }: Props) {
  return (
    <Layout>
      <article>
        <h1 className="text-3xl font-bold mb-4">{post.frontMatter.title}</h1>
        {post.frontMatter.tags && (
          <div className="mb-4">
            {post.frontMatter.tags.map((tag: string) => (
              <Tag key={tag} tag={tag} />
            ))}
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </Layout>
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
