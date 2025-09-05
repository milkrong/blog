import { GetServerSideProps } from "next";
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
  console.log(post);
  return (
    <Layout>
      <article>
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <span aria-hidden>←</span> 返回
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4">{post.frontMatter.title}</h1>
        {post.createdDate && (
          <p className="text-sm text-gray-500 mb-4">{post.createdDate}</p>
        )}
        {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
          <div className="mb-4">
            {post.frontMatter.tags.map((tag) => (
              <Tag key={tag} tag={tag} />
            ))}
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
}) => {
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
    return { props: { post } };
  }
  return { notFound: true };
};
