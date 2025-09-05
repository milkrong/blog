import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { trpc } from "../../utils/trpc";
import { PixelButton } from "../../components/PixelButton";
import { PixelInput } from "../../components/PixelInput"; // pixel input
import { Label } from "../../components/ui/label";

export default function AdminPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [showList, setShowList] = useState(true); // show table first
  const [editingId, setEditingId] = useState<number | null>(null); // null means creating
  const [retryPayload, setRetryPayload] = useState<any | null>(null);
  const originalPostRef = useRef<any | null>(null); // for reset when editing
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
  });

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("sb-access-token")
        : null;
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("sb-access-token");
    router.push("/login");
  };

  const utils = trpc.useUtils?.() as any;
  const createPostMutation = trpc.createPost.useMutation({
    onSuccess: () => {
      utils?.listAdminPosts?.invalidate?.();
    },
  });
  const listPostsQuery = trpc.listAdminPosts.useQuery();
  const updatePostMutation = trpc.updatePost.useMutation({
    onSuccess: () => {
      utils?.listAdminPosts?.invalidate?.();
      setEditingId(null);
    },
  });

  const buildCommonPayload = () => {
    const content = editor?.getHTML() || "";
    const tagsArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    return { title, content, category: category || undefined, tags: tagsArr };
  };

  const handleCreate = async (publish: boolean) => {
    const base = buildCommonPayload();
    const payload: {
      title: string;
      content: string;
      category?: string;
      tags: string[];
      status: "draft" | "published";
    } = {
      ...base,
      status: publish ? "published" : "draft",
    };
    setRetryPayload(payload);
    try {
      await createPostMutation.mutateAsync(payload);
      resetForm();
      setShowList(true);
    } catch (err) {
      /* keep retry */
    }
  };

  const handleUpdate = async (publish: boolean) => {
    if (!editingId) return;
    const base = buildCommonPayload();
    await updatePostMutation.mutateAsync({
      id: editingId,
      ...base,
      status: publish ? "published" : "draft",
    });
    resetForm();
    setEditingId(null);
    setShowList(true);
  };

  const handleRetry = () =>
    retryPayload && createPostMutation.mutate(retryPayload);

  const startCreate = () => {
    resetForm();
    setEditingId(null);
    originalPostRef.current = null;
    setShowList(false);
  };

  const startEdit = (post: any) => {
    originalPostRef.current = post;
    setEditingId(post.id);
    setTitle(post.title || "");
    editor?.commands.setContent(post.content || "");
    setCategory(post.category || "");
    // tags not loaded originally (if required could fetch) leaving blank or parse later
    setShowList(false);
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setTags("");
    editor?.commands.clearContent();
  };

  const resetToOriginal = () => {
    if (editingId && originalPostRef.current) {
      const p = originalPostRef.current;
      setTitle(p.title || "");
      setCategory(p.category || "");
      editor?.commands.setContent(p.content || "");
      // tags not tracked yet
    } else {
      resetForm();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-mono">
      {showList ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">文章管理</h1>
            <div className="flex gap-3">
              <PixelButton onClick={startCreate}>新增</PixelButton>
              <PixelButton variant="secondary" onClick={handleSignOut}>
                退出
              </PixelButton>
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
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      加载中...
                    </td>
                  </tr>
                )}
                {listPostsQuery.data?.length === 0 &&
                  !listPostsQuery.isLoading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-gray-500"
                      >
                        暂无数据
                      </td>
                    </tr>
                  )}
                {listPostsQuery.data?.map((p: any) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 pr-2 align-top">{p.id}</td>
                    <td className="py-2 pr-2 align-top max-w-[240px] truncate">
                      {p.title}
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <span
                        className={`inline-block border-2 px-2 py-0.5 text-xs shadow-[2px_2px_0_0_#1f2937] ${
                          p.status === "published"
                            ? "bg-green-300 border-green-600 text-green-900"
                            : "bg-yellow-200 border-yellow-600 text-yellow-900"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 pr-2 align-top text-[11px] text-gray-600">
                      {p.createdAt
                        ? new Date(p.createdAt).toISOString().slice(0, 10)
                        : ""}
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <PixelButton
                        variant="secondary"
                        size="sm"
                        onClick={() => startEdit(p)}
                      >
                        编辑
                      </PixelButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white border-4 border-gray-800 shadow-[6px_6px_0_0_#1f2937] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {editingId ? "编辑文章" : "新建文章"}
            </h2>
            <PixelButton
              variant="secondary"
              size="sm"
              onClick={() => {
                resetForm();
                setEditingId(null);
                setShowList(true);
              }}
            >
              返回列表
            </PixelButton>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <PixelInput
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <PixelInput
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tags">标签 (逗号分隔)</Label>
                <PixelInput
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>内容</Label>
              <EditorContent
                editor={editor}
                className="min-h-[500px] border-4 border-gray-800 bg-white shadow-[4px_4px_0_0_#1f2937] p-3 prose max-w-none"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {!editingId && (
                <>
                  <PixelButton
                    type="button"
                    disabled={createPostMutation.isPending}
                    onClick={() => handleCreate(false)}
                  >
                    {createPostMutation.isPending ? "保存中..." : "保存(草稿)"}
                  </PixelButton>
                  <PixelButton
                    type="button"
                    variant="secondary"
                    disabled={createPostMutation.isPending}
                    onClick={() => handleCreate(true)}
                  >
                    {createPostMutation.isPending ? "发布中..." : "发布"}
                  </PixelButton>
                </>
              )}
              {editingId && (
                <>
                  <PixelButton
                    type="button"
                    disabled={updatePostMutation.isPending}
                    onClick={() => handleUpdate(false)}
                  >
                    {updatePostMutation.isPending ? "保存中..." : "保存草稿"}
                  </PixelButton>
                  <PixelButton
                    type="button"
                    variant="secondary"
                    disabled={updatePostMutation.isPending}
                    onClick={() => handleUpdate(true)}
                  >
                    {updatePostMutation.isPending ? "发布中..." : "发布"}
                  </PixelButton>
                </>
              )}
              <PixelButton
                type="button"
                variant="secondary"
                onClick={resetToOriginal}
              >
                重置
              </PixelButton>
              {createPostMutation.error && (
                <PixelButton
                  type="button"
                  variant="danger"
                  onClick={handleRetry}
                >
                  重试提交
                </PixelButton>
              )}
            </div>
            {createPostMutation.error && (
              <p className="text-sm text-red-600">
                {createPostMutation.error.message}
              </p>
            )}
            {updatePostMutation.error && (
              <p className="text-sm text-red-600">
                {updatePostMutation.error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
