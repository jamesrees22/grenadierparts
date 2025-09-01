// app/news/page.tsx
import { getAllNewsPosts } from "@/lib/news";
import NewsList from "@/components/NewsList";

export const revalidate = 1800; // 30 mins

export default async function NewsPage() {
  const posts = getAllNewsPosts();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Grenadier News</h1>
      <p className="opacity-80 mt-1">
        Filter by region and date. These posts are generated automatically from trusted sources.
      </p>

      <div className="mt-6">
        <NewsList initialPosts={posts} />
      </div>
    </main>
  );
}
