import Link from "next/link";
import { ImageWithFallback } from "./ImageFallback";
import { PixelGlyph } from "./PixelGlyph";

interface BlogCardProps {
  slug?: string; // optional slug for linking
  title: string;
  excerpt: string;
  date: string;
  category: string;
  /** Real cover image. Omit/empty → the text-forward variant with a pixel stamp. */
  imageUrl?: string;
  readTime: string;
}

function hasRealCover(src?: string): src is string {
  return !!src && src.trim() !== "" && !src.includes("placeholder");
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
  const withCover = hasRealCover(imageUrl);

  const meta = (
    <div className="flex items-center gap-2 font-mono text-xs text-fg-muted">
      <span>{date}</span>
      <span aria-hidden>·</span>
      <span>{readTime}</span>
    </div>
  );

  const readMore = href && (
    <span className="mt-auto inline-flex items-center gap-1 pt-1 font-mono text-sm font-bold text-accent">
      阅读
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </span>
  );

  const card = withCover ? (
    // ── Cover variant: real image leads the card ──
    <article className="pixel-panel pixel-lift group flex h-full flex-col">
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
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3">{meta}</div>
        <h2 className="mb-2 break-words font-mono text-lg font-bold leading-snug text-fg transition-colors line-clamp-2 group-hover:text-accent">
          {title}
        </h2>
        {excerpt && (
          <p className="mb-5 break-words text-sm leading-relaxed text-fg-muted line-clamp-3">
            {excerpt}
          </p>
        )}
        {readMore}
      </div>
    </article>
  ) : (
    // ── Text-forward variant (default): generative pixel stamp, no empty box ──
    <article className="pixel-panel pixel-lift group flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[var(--ink)] bg-[var(--surface-2)] p-1.5 shadow-[2px_2px_0_0_var(--ink)]"
        >
          <PixelGlyph seed={slug || title} className="h-full w-full" />
        </span>
        <span className="pixel-chip bg-[var(--hi)] text-[var(--hi-ink)] font-bold">
          {category}
        </span>
      </div>
      <div className="mb-3">{meta}</div>
      <h2 className="mb-2 break-words font-mono text-xl font-bold leading-snug text-fg transition-colors line-clamp-3 group-hover:text-accent">
        {title}
      </h2>
      {excerpt && (
        <p className="mb-5 break-words text-sm leading-relaxed text-fg-muted line-clamp-3">
          {excerpt}
        </p>
      )}
      {readMore}
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
