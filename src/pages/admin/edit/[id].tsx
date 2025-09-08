import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
const lowlight = createLowlight({ js, javascript: js, ts, typescript: ts, json, xml, html: xml, css });
import { PixelButton } from "../../../components/PixelButton";
import { PixelInput } from "../../../components/PixelInput";
import { Label } from "../../../components/ui/label";
import { trpc } from "../../../utils/trpc";
import EditorToolbar from "../../../components/EditorToolbar";
import { useAdminGuard } from "../../../lib/admin-guard";

export default function AdminEditPage() {
    const router = useRouter();
    const { isLoading, isValid } = useAdminGuard();

    // Note: avoid early return to keep hooks order stable
    const id = useMemo(() => {
        const raw = router.query.id;
        if (!raw) return null;
        const n = Array.isArray(raw) ? parseInt(raw[0], 10) : parseInt(raw, 10);
        return Number.isFinite(n) ? n : null;
    }, [router.query.id]);

    // Always call hooks; enable fetch only when ready
    const listPostsQuery = trpc.listAdminPosts.useQuery(undefined, { enabled: !isLoading && isValid });
    const current = listPostsQuery.data?.find((p: any) => p.id === id);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Link.configure({ openOnClick: true, autolink: true, HTMLAttributes: { rel: "noreferrer", target: "_blank" } }),
            Image,
            CodeBlockLowlight.configure({ lowlight })
        ],
        content: "",
        immediatelyRender: false,
    });

    useEffect(() => {
        if (current) {
            setTitle(current.title || "");
            editor?.commands.setContent(current.content || "");
        }
    }, [current, editor]);

    const updatePostMutation = trpc.updatePost.useMutation();

    const handleUpdate = async (publish: boolean) => {
        if (!id) return;
        await updatePostMutation.mutateAsync({
            id,
            title,
            content: editor?.getHTML() || "",
            status: publish ? "published" : "draft",
        });
        router.push("/admin");
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-mono">
            {isLoading ? (
                <div className="text-center">
                    <p className="text-lg">验证中...</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">编辑文章</h1>
                        <PixelButton variant="secondary" size="sm" onClick={() => router.push("/admin")}>返回列表</PixelButton>
                    </div>
                    <div className="bg-white border-4 border-gray-800 shadow-[6px_6px_0_0_#1f2937] p-6 space-y-6">
                        {!current && (
                            <p className="text-gray-600 text-sm">加载中或未找到该文章…</p>
                        )}
                        {current && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="title">标题</Label>
                                    <PixelInput id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">分类</Label>
                                        <PixelInput id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="tags">标签 (逗号分隔)</Label>
                                        <PixelInput id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>内容</Label>
                                    <EditorToolbar editor={editor} />
                                    <EditorContent editor={editor} className="min-h-[500px] border-4 border-gray-800 bg-white shadow-[4px_4px_0_0_#1f2937] p-3 prose max-w-none" />
                                </div>
                                <div className="flex gap-3">
                                    <PixelButton disabled={updatePostMutation.isPending} onClick={() => handleUpdate(false)}>
                                        {updatePostMutation.isPending ? "保存中..." : "保存草稿"}
                                    </PixelButton>
                                    <PixelButton variant="secondary" disabled={updatePostMutation.isPending} onClick={() => handleUpdate(true)}>
                                        {updatePostMutation.isPending ? "发布中..." : "发布"}
                                    </PixelButton>
                                </div>
                                {updatePostMutation.error && (
                                    <p className="text-sm text-red-600">{updatePostMutation.error.message}</p>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}


