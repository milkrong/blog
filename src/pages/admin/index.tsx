import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { trpc } from "../../utils/trpc";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";

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
    <div className="container py-6 space-y-6">
      {showList ? (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">文章管理</h1>
            <div className="flex gap-2">
              <Button onClick={startCreate}>新增</Button>
              <Button variant="outline" onClick={handleSignOut}>
                退出
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>文章列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">标题</th>
                      <th className="py-2 pr-2">状态</th>
                      <th className="py-2 pr-2">创建时间</th>
                      <th className="py-2 pr-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listPostsQuery.isLoading && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-4 text-center text-muted-foreground"
                        >
                          加载中...
                        </td>
                      </tr>
                    )}
                    {listPostsQuery.data?.length === 0 &&
                      !listPostsQuery.isLoading && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-muted-foreground"
                          >
                            暂无数据
                          </td>
                        </tr>
                      )}
                    {listPostsQuery.data?.map((p: any) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-2 pr-2 align-top">{p.id}</td>
                        <td className="py-2 pr-2 align-top max-w-[280px] truncate">
                          {p.title}
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2 pr-2 align-top text-xs text-muted-foreground">
                          {p.createdAt
                            ? new Date(p.createdAt).toISOString().slice(0, 10)
                            : ""}
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => startEdit(p)}
                          >
                            编辑
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "编辑文章" : "新建文章"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    resetForm();
                    setEditingId(null);
                    setShowList(true);
                  }}
                >
                  返回列表
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">标签 (逗号分隔)</Label>
                  <Input
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
                  className="border rounded min-h-[500px] p-3 prose max-w-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {!editingId && (
                  <>
                    <Button
                      type="button"
                      disabled={createPostMutation.isPending}
                      onClick={() => handleCreate(false)}
                    >
                      {createPostMutation.isPending
                        ? "保存中..."
                        : "保存(草稿)"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={createPostMutation.isPending}
                      onClick={() => handleCreate(true)}
                    >
                      {createPostMutation.isPending ? "发布中..." : "发布"}
                    </Button>
                  </>
                )}
                {editingId && (
                  <>
                    <Button
                      type="button"
                      disabled={updatePostMutation.isPending}
                      onClick={() => handleUpdate(false)}
                    >
                      {updatePostMutation.isPending ? "保存中..." : "保存草稿"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={updatePostMutation.isPending}
                      onClick={() => handleUpdate(true)}
                    >
                      {updatePostMutation.isPending ? "发布中..." : "发布"}
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetToOriginal}
                >
                  重置
                </Button>
                {createPostMutation.error && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRetry}
                  >
                    重试提交
                  </Button>
                )}
              </div>
              {createPostMutation.error && (
                <p className="text-sm text-destructive">
                  {createPostMutation.error.message}
                </p>
              )}
              {updatePostMutation.error && (
                <p className="text-sm text-destructive">
                  {updatePostMutation.error.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
