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
      <p style={{ opacity: 0.75, marginTop: -8 }}>{post.date}</p>

      {/* Top ad (replace slot ID after AdSense approval) */}
      <AdSenseBlock
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      <div dangerouslySetInnerHTML={{ __html: post.html }} />

      {/* Bottom ad */}
      <div style={{ marginTop: 24 }}>
        <AdSenseBlock
          data-ad-slot="9876543210"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      <hr style={{ margin: "32px 0" }} />

      {/* Disclaimer */}
      <p style={{ fontSize: 14, opacity: 0.8 }}>
        This post may contain affiliate links that help support the site at no extra cost to you.  
        Please read our{" "}
        <a href="/disclosure" style={{ textDecoration: "underline" }}>Affiliate Disclosure</a> and{" "}
        <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
      </p>
    </article>
  );
}
