import Link from 'next/link';

interface Props {
  slug: string;
  frontMatter: {
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
  };
}

export default function ArticleCard({ slug, frontMatter }: Props) {
  return (
    <article className="border rounded p-4 mb-4 hover:shadow">
      <h2 className="text-xl font-bold mb-2">
        <Link href={`/posts/${slug}`}>{frontMatter.title}</Link>
      </h2>
      {frontMatter.category && (
        <p className="text-sm text-gray-500 mb-1">{frontMatter.category}</p>
      )}
      {frontMatter.description && (
        <p className="text-gray-600 mb-1">{frontMatter.description}</p>
      )}
      {frontMatter.tags && frontMatter.tags.length > 0 && (
        <div className="text-sm text-gray-500">
          {frontMatter.tags.map((tag) => (
            <span key={tag} className="mr-2">#{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
}
