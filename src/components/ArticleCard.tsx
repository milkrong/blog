import Link from 'next/link';

interface Props {
  slug: string;
  frontMatter: {
    title: string;
    description?: string;
  };
}

export default function ArticleCard({ slug, frontMatter }: Props) {
  return (
    <article className="border rounded p-4 mb-4 hover:shadow">
      <h2 className="text-xl font-bold mb-2">
        <Link href={`/posts/${slug}`}>{frontMatter.title}</Link>
      </h2>
      {frontMatter.description && (
        <p className="text-gray-600">{frontMatter.description}</p>
      )}
    </article>
  );
}
