import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export function getPostSlugs(): string[] {
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.md'));
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => {
    const fullPath = path.join(postsDirectory, slug);
    const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
    return {
      slug: slug.replace(/\.md$/, ''),
      frontMatter: data,
    };
  });
}

export async function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  return {
    slug: realSlug,
    frontMatter: data,
    content: processedContent.toString(),
  };
}
