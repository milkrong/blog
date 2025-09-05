import { ImageWithFallback } from "./ImageFallback";
import { PixelButton } from "./PixelButton";

interface BlogCardProps {
  slug?: string; // optional slug for linking
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl: string;
  readTime: string;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  date,
  category,
  imageUrl,
  readTime,
}: BlogCardProps) {
  return (
    <article className="bg-white border-4 border-gray-800 shadow-[4px_4px_0px_0px_#1f2937] hover:shadow-[6px_6px_0px_0px_#1f2937] transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px]">
      {/* Image */}
      <div className="relative overflow-hidden border-b-4 border-gray-800">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
        />
        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="font-mono text-xs bg-yellow-400 border-2 border-yellow-600 px-2 py-1 shadow-[2px_2px_0px_0px_#ca8a04] text-yellow-900">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta info */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-sm text-gray-600">{date}</span>
          <span className="font-mono text-sm text-gray-600">{readTime}</span>
        </div>

        {/* Title */}
        <h2 className="font-mono mb-3 text-gray-900 hover:text-blue-600 transition-colors">
          {slug ? (
            <a
              href={`/posts/${slug}`}
              className="outline-none focus:ring-2 focus:ring-blue-500"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h2>

        {/* Excerpt */}
        <p className="text-gray-700 mb-4 leading-relaxed">{excerpt}</p>

        {/* Read more button */}
        {slug && (
          <a href={`/posts/${slug}`} className="inline-block">
            <PixelButton variant="primary" size="sm">
              阅读更多 →
            </PixelButton>
          </a>
        )}
      </div>
    </article>
  );
}
