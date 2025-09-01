import { getPostBySlug } from "@/lib/posts";

export const revalidate = 3600; // 1 hour

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    // @ts-ignore
    return <div>Not found</div>;
  }
  return (
    <article>
      <h1>{post.title}</h1>
      <p style={{ opacity: 0.75, marginTop: -8 }}>{post.date}</p>
      {/* Ad placeholder (paste AdSense component once approved) */}
      {/* <AdSense /> */}

      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <hr style={{ margin: "32px 0" }} />
      <p style={{ fontSize: 14, opacity: 0.8 }}>
        This post may contain affiliate links that help support the site at no extra cost to you.
      </p>
    </article>
  );
}
