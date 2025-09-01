import { getPostsByTag } from "@/lib/posts";
import CategoryBadge from "@/components/CategoryBadge";

export const revalidate = 300;

export default async function TagPage({ params }: { params: { slug: string } }) {
  const posts = await getPostsByTag(params.slug);

  return (
    <section>
      <h2 style={{ marginBottom: 16 }}>Tag: {params.slug}</h2>
      {posts.length === 0 ? (
        <p className="muted">No posts yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 16 }}>
          {posts.map((p) => (
            <li key={p.slug} className="card">
              <a href={`/posts/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <h3 style={{ margin: "0 0 6px", display: "flex", alignItems: "center" }}>
                  {p.title}
                  <CategoryBadge label={p.category} />
                </h3>
              </a>
              <p className="muted" style={{ margin: "0 0 6px" }}>{p.excerpt}</p>
              <small className="muted">{p.date}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
