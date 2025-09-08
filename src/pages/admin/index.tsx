import { useEffect } from "react";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { PixelButton } from "../../components/PixelButton";
import { useAdminGuard } from "../../lib/admin-guard";


export default function AdminPage() {
  const router = useRouter();
  const { isLoading, isValid, user } = useAdminGuard();

  // Always call hooks on every render; gate fetching with `enabled`
  const listPostsQuery = trpc.listAdminPosts.useQuery(undefined, { enabled: !isLoading && isValid });

  // Show loading state while verifying token
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-mono">
        <div className="text-center">
          <p className="text-lg">验证中...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    localStorage.removeItem("sb-access-token");
    router.push("/login");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-mono">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">文章管理</h1>
        <div className="flex gap-3">
          <PixelButton onClick={() => router.push("/admin/new")}>新增</PixelButton>
          <PixelButton variant="secondary" onClick={handleSignOut}>退出</PixelButton>
        </div>
      </div>
      <div className="bg-white border-4 border-gray-800 shadow-[6px_6px_0_0_#1f2937] p-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">文章列表</h2>
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-2 text-left">ID</th>
              <th className="py-2 pr-2 text-left">标题</th>
              <th className="py-2 pr-2 text-left">状态</th>
              <th className="py-2 pr-2 text-left">创建时间</th>
              <th className="py-2 pr-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {listPostsQuery.isLoading && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">加载中...</td>
              </tr>
            )}
            {listPostsQuery.data?.length === 0 && !listPostsQuery.isLoading && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">暂无数据</td>
              </tr>
            )}
            {listPostsQuery.data?.map((p: any) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2 pr-2 align-top">{p.id}</td>
                <td className="py-2 pr-2 align-top max-w-[240px] truncate">{p.title}</td>
                <td className="py-2 pr-2 align-top">
                  <span className={`inline-block border-2 px-2 py-0.5 text-xs shadow-[2px_2px_0_0_#1f2937] ${p.status === "published"
                    ? "bg-green-300 border-green-600 text-green-900"
                    : "bg-yellow-200 border-yellow-600 text-yellow-900"
                    }`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-2 pr-2 align-top text-[11px] text-gray-600">
                  {p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : ""}
                </td>
                <td className="py-2 pr-2 align-top">
                  <PixelButton variant="secondary" size="sm" onClick={() => router.push(`/admin/edit/${p.id}`)}>
                    编辑
                  </PixelButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
