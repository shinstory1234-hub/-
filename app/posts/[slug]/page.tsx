import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug } from "@/lib/posts";

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <article className="mx-auto max-w-3xl rounded-xl border bg-white p-8">
      <div className="mb-4 flex gap-2">
        <Badge>{post.category}</Badge>
        {post.tags.map((tag) => (
          <Badge key={tag}>#{tag}</Badge>
        ))}
      </div>
      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      <p className="mb-6 text-sm text-zinc-400">{post.published_at}</p>
      <p className="leading-7 text-zinc-700">{post.content}</p>
    </article>
  );
}
