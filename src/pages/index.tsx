import Layout from "../components/Layout";
// ArticleCard removed in favor of pixel styled BlogCard
import { BlogCard } from "../components/BlogCard";
import { trpc } from "../utils/trpc";
import type { GetStaticProps } from "next";
import { appRouter } from "../server/router";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { Skeleton } from "../components/ui/skeleton";
import ProfileHeader from "../components/ProfileHeader";

export default function Home() {
  const { data: posts, isLoading } = trpc.posts.useQuery(undefined, { staleTime: 60000 });

  return (
    <Layout>
      <ProfileHeader
        name="Milkrong"
        title="Full Stack Developer"
        github="https://github.com/milkrong"
        avatarSrc="https://github.com/milkrong.png"
        bio="热爱构建高质量 Web 应用，关注架构演进、开发者体验与性能优化。这里记录一些实践、思考与笔记。"
        location="Shanghai"
        company="Independent"
      />
      <div className="mb-5 flex items-baseline gap-3">
        <h2 className="font-mono text-xl font-extrabold tracking-tight text-fg">
          最新文章
        </h2>
        <span className="h-[3px] flex-1 bg-[var(--ink)]" aria-hidden />
        {!isLoading && posts && (
          <span className="font-mono text-sm text-fg-muted">
            {posts.length} 篇
          </span>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pixel-panel p-5">
              <div className="mb-4 flex items-start justify-between">
                <Skeleton className="h-10 w-10 rounded-none" />
                <Skeleton className="h-5 w-14 rounded-none" />
              </div>
              <Skeleton className="mb-3 h-3 w-1/3 rounded-none" />
              <Skeleton className="mb-2 h-6 w-3/4 rounded-none" />
              <Skeleton className="h-4 w-full rounded-none" />
              <Skeleton className="mt-2 h-4 w-2/3 rounded-none" />
            </div>
          ))}
        {!isLoading &&
          posts?.map((post) => (
            <BlogCard
              key={post.id}
              slug={post.slug as string}
              title={post.title as string}
              excerpt={(post.description as string) || ""}
              date={
                post.createdAt
                  ? new Date(post.createdAt as any).toISOString().slice(0, 10)
                  : ""
              }
              category={post.category?.name || "未分类"}
              imageUrl={(post as any).cover || undefined}
              readTime="约 3 分钟"
            />
          ))}
      </div>

      {!isLoading && (!posts || posts.length === 0) && (
        <div className="pixel-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div
            aria-hidden
            className="grid h-12 w-12 place-items-center border-[3px] border-[var(--ink)] bg-[var(--hi)] text-[var(--hi-ink)] text-xl font-black shadow-[3px_3px_0_0_var(--ink)]"
          >
            !
          </div>
          <p className="font-mono text-lg font-bold text-fg">还没有文章</p>
          <p className="max-w-sm text-sm text-fg-muted">
            第一篇还在路上。登录管理后台即可发布新内容。
          </p>
        </div>
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient();
  if (process.env.NEXT_SKIP_DB === "1") {
    // Skip DB prefetch during Docker image build
  } else {
    // prefetch via direct call to router instead of SSG helpers to avoid version mismatch
    const caller = appRouter.createCaller({});
    const data = await caller.posts();
    const jsonSafe = (data as any[]).map((p) => ({
      ...p,
      createdAt: p.createdAt ? new Date(p.createdAt as any).toISOString() : null,
    }));
    await queryClient.setQueryData(["posts"], jsonSafe as any);
  }
  return {
    props: {
      trpcState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
};
