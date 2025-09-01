import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  html: string;
  content_md: string;
  tags?: string[];
  category?: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function readOne(fullPath: string, slug: string): Post {
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const html = marked.parse(content) as string;

  return {
    slug,
    title: (data.title as string) || slug,
    excerpt: (data.excerpt as string) || content.slice(0, 160),
    date: (data.date as string) || "",
    html,
    content_md: content,
    tags: (data.tags as string[]) || undefined,
    category: (data.category as string) || undefined,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((f) => readOne(path.join(POSTS_DIR, f), f.replace(/\.md$/, "")));
  posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const full = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(full)) return null;
  return readOne(full, slug);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => (p.tags || []).map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
}

export async function getPostsByCategory(cat: string): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => (p.category || "").toLowerCase() === cat.toLowerCase());
}
