import { getAllPosts } from "@/lib/posts";
import AffiliateBadge from "@/components/AffiliateBadge";

export const revalidate = 600; // ISR: 10 min

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <section>
      {/* Hero */}
      <section style={{ marginBottom: 32 }}>
        <div
          style={{
            width: "100%",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}
        >
          {/* Responsive hero image using your upload at /public/grenadier.jpg */}
          <img
            src="/grenadier.jpg"
            alt="Ineos Grenadier off-road in the mountains"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              maxHeight: 460,           // soft cap the height on large screens
              objectFit: "cover",       // crop gracefully if the aspect is tall
            }}
            loading="eager"
          />
        </div>

        <h2 style={{ margin: "14px 0 0" }}>
          Guides, gear & parts for the Ineos Grenadier
        </h2>
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
