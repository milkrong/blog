import Layout from "../components/Layout";
import ArticleCard from "../components/ArticleCard";
import { trpc } from "../utils/trpc";
import { Skeleton } from "../components/ui/skeleton";
import ProfileHeader from "../components/ProfileHeader";

export default function Home() {
  const { data: posts, isLoading } = trpc.posts.useQuery();

  return (
    <Layout>
      <ProfileHeader
        name="Milkrong"
        title="Full Stack Developer"
        github="https://github.com/milkrong"
        avatarSrc="/avatar.jpg"
        bio="热爱构建高质量 Web 应用，关注架构演进、开发者体验与性能优化。这里记录一些实践、思考与笔记。"
        location="Shanghai"
        company="Independent"
      />
      <h2 className="text-xl font-semibold mb-4">最新文章</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        {!isLoading &&
          posts?.map((post) => (
            <ArticleCard
              key={post.id}
              slug={post.slug}
              frontMatter={{
                title: post.title,
                description: post.description,
                category: post.category?.name,
                tags: post.tags?.map((t) => t.name),
              }}
            />
          ))}
      </div>
    </Layout>
  );
}
