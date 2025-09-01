import { getAllPosts } from "@/lib/posts";
import AffiliateBadge from "@/components/AffiliateBadge";

export const revalidate = 600; // ISR: 10 min

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <section>
      {/* Hero */}
      <section style={{ marginBottom: 32, textAlign: "center" }}>
        <img
          src="/hero-grenadier.jpg"
          alt="Ineos Grenadier off-road"
          style={{ width: "100%", borderRadius: 12, marginBottom: 16, border: "1px solid var(--border)" }}
        />
        <h2 style={{ margin: 0 }}>Guides, gear & parts for the Ineos Grenadier</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          Practical upgrades, maintenance advice, and curated accessories. Updated regularly.
        </p>
      </section>

      {/* Post list */}
      <h2 style={{ marginBottom: 16 }}>Latest posts</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 16 }}>
        {posts.map((p) => (
          <li key={p.slug} className="card">
            <a
              href={`/posts/${p.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
              aria-label={`Read: ${p.title}`}
            >
              <h3 style={{ margin: "0 0 6px" }}>{p.title}</h3>
            </a>
            <p className="muted" style={{ margin: "0 0 10px" }}>{p.excerpt}</p>
            <AffiliateBadge />
          </li>
        ))}
      </ul>
    </section>
  );
}
