import Link from "next/link";
import { ImageWithFallback } from "./ImageFallback";

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
  const href = slug ? `/posts/${slug}` : undefined;

  const card = (
    <article className="pixel-panel pixel-lift group flex h-full flex-col">
      {/* Image */}
      <div className="relative overflow-hidden border-b-[3px] border-[var(--ink)]">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="h-44 w-full object-cover"
        />
        <div className="absolute left-3 top-3">
          <span className="pixel-chip bg-[var(--hi)] text-[var(--hi-ink)] font-bold">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-xs text-fg-muted">
          <span>{date}</span>
          <span aria-hidden>·</span>
          <span>{readTime}</span>
        </div>

        <h2 className="mb-2 font-mono text-lg font-bold leading-snug text-fg group-hover:text-accent transition-colors">
          {title}
        </h2>

        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-fg-muted">
          {excerpt}
        </p>

        {href && (
          <span className="mt-auto inline-flex items-center gap-1 font-mono text-sm font-bold text-accent">
            阅读
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        )}
      </div>
    </article>
  );

  return href ? (
    <Link
      href={href}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  ) : (
    card
  );
}
