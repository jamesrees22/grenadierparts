// app/page.tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 600; // 10 minutes

export default async function HomePage() {
  const posts = await getAllPosts();

  // newest first
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));

  const latestPosts = sorted.slice(0, 6);
  const latestNews = sorted.filter(p => p.category === "news").slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="container" style={{ marginTop: 24 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <img
            src="/grenadier.jpg"
            alt="Ineos Grenadier in the mountains"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "cover",
              aspectRatio: "16/7",
            }}
          />
          <div style={{ padding: 16 }}>
            <h1 style={{ margin: 0 }}>Guides, gear & parts for the Ineos Grenadier</h1>
            <p className="muted" style={{ marginTop: 6, marginBottom: 0 }}>
              Practical upgrades, maintenance advice, and curated accessories. Updated regularly.
            </p>
          </div>
        </div>
      </section>

      {/* LATEST NEWS (top 3) */}
      {latestNews.length > 0 && (
        <section className="container" style={{ marginTop: 28 }}>
          <h2 style={{ marginBottom: 12 }}>Latest news</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {latestNews.map((p) => (
              <Link key={p.slug} href={`/posts/${p.slug}`} className="card link" style={{ display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
                  <div>
                    <strong>{p.title}</strong>
                    {p.excerpt && (
                      <p className="muted" style={{ margin: "6px 0 0" }}>
                        {p.excerpt}
                      </p>
                    )}
                  </div>
                  <span className="badge" style={{ padding: "2px 8px", fontSize: 12 }}>News</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* LATEST POSTS */}
      <section className="container" style={{ marginTop: 28, marginBottom: 40 }}>
        <h2 style={{ marginBottom: 12 }}>Latest posts</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {latestPosts.map((p) => (
            <Link key={p.slug} href={`/posts/${p.slug}`} className="card link" style={{ display: "block" }}>
              <div>
                <strong>{p.title}</strong>
                {p.excerpt && (
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {p.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
