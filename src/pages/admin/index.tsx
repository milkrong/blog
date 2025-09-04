import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function AdminPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null;
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('sb-access-token');
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = editor?.getHTML() || '';
    const token = localStorage.getItem('sb-access-token');
    await fetch(`${supabaseUrl}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });
    setTitle('');
    editor?.commands.clearContent();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">New Post</h1>
        <button onClick={handleSignOut} className="text-sm text-blue-600">Sign Out</button>
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
        <EditorContent editor={editor} className="border rounded p-2 min-h-[200px]" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
