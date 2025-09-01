import { getAllPosts } from "@/lib/posts";

export const revalidate = 600; // ISR: 10 min

export default async function HomePage() {
  const posts = await getAllPosts();
  return (
    <section>
      <h2>Latest posts</h2>
      <ul>
        {posts.map(p => (
          <li key={p.slug} style={{ margin: "16px 0" }}>
            <a href={`/posts/${p.slug}`}><strong>{p.title}</strong></a>
            <div style={{ fontSize: 14, opacity: 0.8 }}>{p.excerpt}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
