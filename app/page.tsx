import { getAllPosts } from "@/lib/posts";
import AffiliateBadge from "@/components/AffiliateBadge";

export const revalidate = 600; // ISR: 10 min

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <section>
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
