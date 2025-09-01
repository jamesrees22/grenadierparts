import { getPostsByTag } from "@/lib/posts";

export const revalidate = 300;

export default async function NewsPage() {
  const posts = await getPostsByTag("news");

  return (
    <section>
      <h2 style={{ marginBottom: 16 }}>Grenadier News</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 16 }}>
        {posts.map((p) => (
          <li key={p.slug} className="card">
            <a href={`/posts/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <h3 style={{ margin: "0 0 6px" }}>{p.title}</h3>
            </a>
            <p className="muted" style={{ margin: "0 0 6px" }}>{p.excerpt}</p>
            <small className="muted">{p.date}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
