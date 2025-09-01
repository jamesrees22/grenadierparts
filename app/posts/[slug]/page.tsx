// app/posts/[slug]/page.tsx
import AdSenseBlock from "@/components/AdSenseBlock";
import { getPostBySlug } from "@/lib/posts";

export const revalidate = 3600; // 1 hour

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    // @ts-ignore
    return <div>Not found</div>;
  }

  return (
    <article style={{ maxWidth: 820 }}>
      <h1>{post.title}</h1>

      {/* Date + single affiliate badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        <p className="muted" style={{ margin: 0 }}>{post.date}</p>
        <span className="badge" style={{ padding: "2px 8px", fontSize: 12 }}>Contains affiliate links</span>
        {post.category === "news" && (
          <span className="badge" style={{ padding: "2px 8px", fontSize: 12, background: "#0e2336" }}>News</span>
        )}
      </div>

      {/* Top ad (swap slot IDs after AdSense approval) */}
      <div style={{ marginTop: 14 }}>
        <AdSenseBlock
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      <div style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: post.html }} />

      {/* Bottom ad */}
      <div style={{ marginTop: 24 }}>
        <AdSenseBlock
          data-ad-slot="9876543210"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      <hr style={{ margin: "32px 0" }} />

      {/* Single footer disclosure */}
      <p className="muted" style={{ fontSize: 14 }}>
        This post may contain affiliate links that help support the site at no extra cost to you.
        Please read our{" "}
        <a href="/disclosure" style={{ textDecoration: "underline" }}>Affiliate Disclosure</a> and{" "}
        <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
      </p>
    </article>
  );
}
