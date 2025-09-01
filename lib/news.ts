// lib/news.ts
import * as fs from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";

export type NewsPost = {
  slug: string;
  title: string;
  date: string;           // YYYY-MM-DD
  excerpt?: string;
  tags?: string[];
  locations?: string[];
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export function getAllNewsPosts(): NewsPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort() // sort by filename so newer (usually) last; we’ll sort by date below anyway
    .reverse();

  const posts: NewsPost[] = [];
  for (const file of files) {
    const full = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    const { data } = matter(raw);

    const slug = file.replace(/\.md$/, "");
    const post: NewsPost = {
      slug,
      title: (data.title as string) || slug,
      date: (data.date as string) || "",
      excerpt: (data.excerpt as string) || "",
      tags: (data.tags as string[]) || [],
      locations: (data.locations as string[]) || [],
    };
    posts.push(post);
  }

  // Final sort by front-matter date desc if available
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}
