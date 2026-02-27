import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug } from "@/lib/posts";

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      {post.category?.name ? <Badge>{post.category.name}</Badge> : null}
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-zinc-400">{post.published_at?.slice(0, 10)}</p>
      <div className="prose prose-zinc mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
