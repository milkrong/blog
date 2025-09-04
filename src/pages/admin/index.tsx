import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function AdminPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
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
    const slug = title.toLowerCase().replace(/\s+/g, '-');

    // upsert category
    let categoryId: number | null = null;
    if (category) {
      const catRes = await fetch(
        `${supabaseUrl}/rest/v1/categories?name=eq.${encodeURIComponent(category)}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const existing = await catRes.json();
      if (existing.length > 0) {
        categoryId = existing[0].id;
      } else {
        const newCatRes = await fetch(`${supabaseUrl}/rest/v1/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${token}`,
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ name: category, slug: category }),
        });
        const inserted = await newCatRes.json();
        categoryId = inserted[0].id;
      }
    }

    const postRes = await fetch(`${supabaseUrl}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${token}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ title, content, slug, category_id: categoryId }),
    });
    const post = (await postRes.json())[0];

    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    for (const tagName of tagsArr) {
      const tagRes = await fetch(
        `${supabaseUrl}/rest/v1/tags?name=eq.${encodeURIComponent(tagName)}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const existingTag = await tagRes.json();
      let tagId: number;
      if (existingTag.length > 0) {
        tagId = existingTag[0].id;
      } else {
        const newTagRes = await fetch(`${supabaseUrl}/rest/v1/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${token}`,
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ name: tagName, slug: tagName }),
        });
        const insertedTag = await newTagRes.json();
        tagId = insertedTag[0].id;
      }

      await fetch(`${supabaseUrl}/rest/v1/posts_to_tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: post.id, tag_id: tagId }),
      });
    }

    setTitle('');
    setCategory('');
    setTags('');
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
        <EditorContent editor={editor} className="border rounded p-2 min-h-[200px]" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
