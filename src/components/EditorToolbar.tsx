import React from "react";
import type { Editor } from "@tiptap/react";
import { PixelButton } from "./PixelButton";

import { trpc } from "../utils/trpc";
import PixelModal from "./PixelModal";

type EditorToolbarProps = {
    editor: Editor | null;
};

export function EditorToolbar({ editor }: EditorToolbarProps) {
    if (!editor) return null;

    const buttonCls = (active: boolean) => (active ? "!bg-yellow-200" : "");

    const getUploadUrl = trpc.r2GetUploadUrl.useMutation();
    const [uploading, setUploading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [uploadError, setUploadError] = React.useState<string | null>(null);
    const lastFileRef = React.useRef<File | null>(null);

    const MAX_MB = 5;
    const validateFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            throw new Error('仅支持图片文件');
        }
        const mb = file.size / (1024 * 1024);
        if (mb > MAX_MB) {
            throw new Error(`图片大小不能超过 ${MAX_MB}MB`);
        }
    };

    const uploadWithProgress = async (file: File) => {
        setUploadError(null);
        setUploadProgress(0);
        setUploading(true);
        try {
            const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({ filename: file.name, contentType: file.type || 'application/octet-stream' });

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', uploadUrl, true);
                xhr.setRequestHeader('content-type', file.type || 'application/octet-stream');
                xhr.upload.onprogress = (evt) => {
                    if (evt.lengthComputable) {
                        const pct = Math.round((evt.loaded / evt.total) * 100);
                        setUploadProgress(pct);
                    }
                };
                xhr.onerror = () => reject(new Error('上传失败'));
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve();
                    else reject(new Error('上传失败'));
                };
                xhr.send(file);
            });

            editor.chain().focus().setImage({ src: publicUrl }).run();
        } catch (e: any) {
            setUploadError(e?.message || '上传失败');
            throw e;
        } finally {
            setUploading(false);
        }
    };

    const [imgModalOpen, setImgModalOpen] = React.useState(false);
    const [imgUrl, setImgUrl] = React.useState("");

    return (
        <>
            <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 border-4 border-gray-800 bg-white p-2 shadow-[4px_4px_0_0_#1f2937]">
                <div className="flex gap-2">
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("bold"))}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        B
                    </PixelButton>
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("italic"))}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        I
                    </PixelButton>
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("strike"))}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                        S
                    </PixelButton>
                </div>
                <span className="mx-2 h-5 w-px bg-gray-300" />
                <div className="flex gap-2">
                    <PixelButton variant="secondary" size="sm" onClick={() => {
                        const url = prompt("输入链接地址:");
                        if (!url) return;
                        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                    }}>Link</PixelButton>
                    <PixelButton variant="secondary" size="sm" disabled={uploading} onClick={() => setImgModalOpen(true)}>Image</PixelButton>
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("heading", { level: 1 }))}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        H1
                    </PixelButton>
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("heading", { level: 2 }))}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        H2
                    </PixelButton>
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("heading", { level: 3 }))}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                        H3
                    </PixelButton>
                </div>
                <span className="mx-2 h-5 w-px bg-gray-300" />
                <div className="flex gap-2">
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("bulletList"))}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        • List
                    </PixelButton>
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("orderedList"))}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        1. List
                    </PixelButton>
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("blockquote"))}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        “Quote”
                    </PixelButton>
                    <PixelButton
                        variant="secondary"
                        size="sm"
                        className={buttonCls(editor.isActive("codeBlock"))}
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    >
                        {'</>'}
                    </PixelButton>
                </div>
                <span className="mx-2 h-5 w-px bg-gray-300" />
                <div className="flex gap-2">
                    <PixelButton title="撤销 (⌘/Ctrl+Z)" variant="secondary" size="sm" onClick={() => editor.chain().focus().undo().run()}>
                        Undo
                    </PixelButton>
                    <PixelButton title="重做 (⌘/Ctrl+Shift+Z / Ctrl+Y)" variant="secondary" size="sm" onClick={() => editor.chain().focus().redo().run()}>
                        Redo
                    </PixelButton>
                </div>
                {uploading && (
                    <span className="text-xs text-gray-600">上传中 {uploadProgress}%</span>
                )}
                {uploadError && (
                    <span className="text-xs text-red-600">
                        {uploadError}
                        {lastFileRef.current && (
                            <button className="ml-2 underline" onClick={async () => {
                                const f = lastFileRef.current;
                                if (f) {
                                    try { await uploadWithProgress(f); } catch { }
                                }
                            }}>重试</button>
                        )}
                    </span>
                )}
            </div>
            <PixelModal
                open={imgModalOpen}
                title="插入图片"
                onClose={() => setImgModalOpen(false)}
                footer={(
                    <>
                        <button
                            className="font-mono px-3 py-1 border-2 bg-gray-300 border-gray-600 text-gray-900 shadow-[2px_2px_0_0_#1f2937]"
                            onClick={() => setImgModalOpen(false)}
                        >
                            取消
                        </button>
                        <button
                            className="font-mono px-3 py-1 border-2 bg-blue-500 border-blue-700 text-white shadow-[2px_2px_0_0_#1d4ed8]"
                            onClick={() => {
                                const url = imgUrl.trim();
                                if (url) {
                                    editor?.chain().focus().setImage({ src: url }).run();
                                    setImgUrl("");
                                    setImgModalOpen(false);
                                }
                            }}
                        >
                            使用链接
                        </button>
                        <button
                            className="font-mono px-3 py-1 border-2 bg-green-500 border-green-700 text-white shadow-[2px_2px_0_0_#166534] disabled:opacity-50"
                            disabled={uploading}
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = async () => {
                                    const file = input.files?.[0];
                                    if (!file) return;
                                    try {
                                        validateFile(file);
                                        lastFileRef.current = file;
                                        await uploadWithProgress(file);
                                        setImgModalOpen(false);
                                    } catch { }
                                };
                                input.click();
                            }}
                        >
                            上传图片
                        </button>
                    </>
                )}
            >
                <div className="space-y-2">
                    <label className="block text-sm font-mono">图片链接</label>
                    <input
                        value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        className="w-full border-2 border-gray-800 px-3 py-2 font-mono shadow-[2px_2px_0_0_#1f2937]"
                        placeholder="https://..."
                    />
                    {uploading && (
                        <div className="text-xs text-gray-600">上传中 {uploadProgress}%</div>
                    )}
                    {uploadError && (
                        <div className="text-xs text-red-600">{uploadError}</div>
                    )}
                </div>
            </PixelModal>
        </>
    );
}

export default EditorToolbar;


