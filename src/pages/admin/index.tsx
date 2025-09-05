import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { trpc } from "../../utils/trpc";

export default function AdminPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
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

  const createPostMutation = trpc.createPost.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = editor?.getHTML() || "";
    const tagsArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    await createPostMutation.mutateAsync({
      title,
      content,
      category: category || undefined,
      tags: tagsArr,
    });
    setTitle("");
    setCategory("");
    setTags("");
    editor?.commands.clearContent();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">New Post</h1>
        <button onClick={handleSignOut} className="text-sm text-blue-600">
          Sign Out
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Title"
          required
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Category"
        />
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Tags (comma separated)"
        />
        <EditorContent
          editor={editor}
          className="border rounded p-2 min-h-[200px]"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={createPostMutation.status === "pending"}
        >
          {createPostMutation.status === "pending" ? "Submitting..." : "Submit"}
        </button>
        {createPostMutation.error && (
          <p className="text-red-600 text-sm">
            {createPostMutation.error.message}
          </p>
        )}
      </form>
    </div>
  );
}
