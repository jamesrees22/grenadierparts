import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AdSenseBlock from "@/components/AdSenseBlock";
import AffiliateBadge from "@/components/AffiliateBadge";
import { getPostBySlug } from "@/lib/posts";

export const revalidate = 3600; // 1 hour

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    // @ts-ignore
    return <div>Not found</div>;
  }

  // Split markdown into first paragraph + the rest (split on first blank line)
  const parts = post.content_md.split(/\n\s*\n/);
  const firstBlock = parts[0] ?? "";
  const restBlocks = parts.slice(1).join("\n\n");

  return (
    <article style={{ maxWidth: 820 }}>
      <h1>{post.title}</h1>
      <p style={{ opacity: 0.75, marginTop: -8 }}>{post.date}</p>

      {/* Small badge just under date for consistency */}
      <div style={{ margin: "6px 0 14px" }}>
        <AffiliateBadge />
      </div>

      {/* Top ad (replace slot ID after AdSense approval) */}
      <AdSenseBlock
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      {/* Render first paragraph */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{firstBlock}</ReactMarkdown>

      {/* Inject badge INSIDE the content flow, right after first paragraph */}
      <div style={{ margin: "12px 0 16px" }}>
        <AffiliateBadge />
      </div>

      {/* Render the remainder of the content */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{restBlocks}</ReactMarkdown>

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
        This post may contain affiliate links that help support the site at no extra cost to you.{" "}
        Please read our{" "}
        <a href="/disclosure" style={{ textDecoration: "underline" }}>Affiliate Disclosure</a> and{" "}
        <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
      </p>
    </article>
  );
}
