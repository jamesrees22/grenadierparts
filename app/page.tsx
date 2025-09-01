import { getAllPosts } from "@/lib/posts";

export const revalidate = 600; // ISR: 10 min

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <section style={{ maxWidth: 980, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>Latest posts</h2>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 16 }}>
        {posts.map((p) => (
          <li
            key={p.slug}
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <a
              href={`/posts/${p.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
              aria-label={`Read: ${p.title}`}
            >
              <h3 style={{ margin: "0 0 6px" }}>{p.title}</h3>
            </a>

            <p style={{ margin: "0 0 10px", opacity: 0.85 }}>{p.excerpt}</p>

            {/* Compliance/Trust badge */}
            <span
              title="Some posts include affiliate links that may earn us a small commission."
              style={{
                display: "inline-block",
                fontSize: 12,
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.06)",
                opacity: 0.85,
              }}
            >
              May contain affiliate links
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
