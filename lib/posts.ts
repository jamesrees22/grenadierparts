import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  html: string;        // kept for compatibility
  content_md: string;  // <-- new: raw markdown for React rendering
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export async function getAllPosts(): Promise<Post[]> {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data, content } = matter(raw);
    const html = marked.parse(content) as string;
    return {
      slug,
      title: (data.title as string) || slug,
      excerpt: (data.excerpt as string) || content.slice(0, 160),
      date: (data.date as string) || "",
      html,
      content_md: content, // expose markdown
    };
  });
  posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const full = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const html = marked.parse(content) as string;
  return {
    slug,
    title: (data.title as string) || slug,
    excerpt: (data.excerpt as string) || content.slice(0, 160),
    date: (data.date as string) || "",
    html,
    content_md: content,
  };
}
