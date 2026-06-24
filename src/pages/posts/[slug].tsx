import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Layout from "../../components/Layout";
import Tag from "../../components/Tag";
import { remark } from "remark";
import html from "remark-html";
import { db } from "../../lib/db";
import { posts, categories, postsToTags, tags } from "../../lib/schema";
import { eq, inArray } from "drizzle-orm";

type PostData = {
  slug: string;
  frontMatter: {
    title: string;
    description: string | null;
    category: string | null;
    tags: string[];
  };
  content: string; // already HTML
  createdAt: string; // ISO string
  createdDate: string; // stable display (YYYY-MM-DD)
};

interface Props {
  post: PostData;
}

export default function PostPage({ post }: Props) {
  return (
    <Layout>
      <article className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/"
            className="pixel-chip bg-[var(--surface)] text-fg-muted hover:text-accent active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <span aria-hidden>←</span> 返回首页
          </Link>
        </div>

        {/* Title block */}
        <header className="pixel-panel mb-8 p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-xs text-fg-muted">
            {post.frontMatter.category && (
              <span className="pixel-chip bg-[var(--hi)] text-[var(--hi-ink)] font-bold">
                {post.frontMatter.category}
              </span>
            )}
            {post.createdDate && <time>{post.createdDate}</time>}
          </div>
          <h1 className="font-mono text-3xl font-extrabold leading-tight tracking-tight text-fg md:text-4xl">
            {post.frontMatter.title}
          </h1>
          {post.frontMatter.description && (
            <p className="mt-3 text-base leading-relaxed text-fg-muted">
              {post.frontMatter.description}
            </p>
          )}
          {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap">
              {post.frontMatter.tags.map((tag) => (
                <Tag key={tag} tag={tag} />
              ))}
            </div>
          )}
        </header>

        {/* Body */}
        <div
          className="pixel-prose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 border-t-[3px] border-dashed border-[var(--ink)] pt-6">
          <Link
            href="/"
            className="pixel-chip bg-[var(--surface)] text-fg-muted hover:text-accent active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <span aria-hidden>←</span> 返回首页
          </Link>
        </div>
      </article>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  // Fetch from database only (markdown removed)
  const dbPost = await db.query.posts.findFirst({
    where: (p, { eq }) => eq(p.slug, slug),
  });
  if (dbPost) {
    // category
    let categoryName: string | undefined;
    if (dbPost.categoryId) {
      const cat = await db
        .select()
        .from(categories)
        .where(eq(categories.id, dbPost.categoryId))
        .limit(1);
      if (cat.length) categoryName = cat[0].name as string;
    }
    // tags
    const ptRows = await db
      .select({ tagId: postsToTags.tagId })
      .from(postsToTags)
      .where(eq(postsToTags.postId, dbPost.id as number));
    let tagNames: string[] = [];
    if (ptRows.length) {
      const tagIds = ptRows
        .map((r) => r.tagId)
        .filter((v): v is number => typeof v === "number");
      if (tagIds.length) {
        const tagRows = await db
          .select()
          .from(tags)
          .where(inArray(tags.id, tagIds));
        tagNames = tagRows.map((t) => t.name as string);
      }
    }
    // content: stored content now already HTML (TipTap). Fallback: if plain text, run remark.
    let htmlContent = "";
    if (dbPost.content) {
      htmlContent = dbPost.content as string;
    }
    const createdAtISO = dbPost.createdAt
      ? new Date(dbPost.createdAt as Date).toISOString()
      : new Date().toISOString();
    const createdDate = createdAtISO.slice(0, 10); // YYYY-MM-DD
    const post: PostData = {
      slug,
      frontMatter: {
        title: (dbPost.title as string) ?? "Untitled",
        description: (dbPost as any).description ?? null,
        category: categoryName ?? null,
        tags: tagNames,
      },
      content: htmlContent,
      createdAt: createdAtISO,
      createdDate,
    };
    return { props: { post }, revalidate: 60 };
  }
  return { notFound: true };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Pre-render none; fallback to on-demand build
  return { paths: [], fallback: 'blocking' };
};
