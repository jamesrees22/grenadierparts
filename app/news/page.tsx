import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 600; // 10 min

export default async function NewsIndex() {
  const posts = await getAllPosts();
  const news = posts
    .filter(p => p.category === "news")
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <section className="container" style={{ marginTop: 24, marginBottom: 40 }}>
      <h1 style={{ marginBottom: 8 }}>News</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Roundups and headlines from around the Grenadier community.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {news.map(p => (
          <Link key={p.slug} href={`/posts/${p.slug}`} className="card link" style={{ display: "block" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
              <div>
                <strong>{p.title}</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>{p.date}</p>
              </div>
              <span className="badge" style={{ padding: "2px 8px", fontSize: 12 }}>News</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
