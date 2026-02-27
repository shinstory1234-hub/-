import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getPosts } from "@/lib/posts";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getPosts(slug === "all" ? undefined : slug);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">카테고리: {slug}</h1>
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="flex items-center justify-between py-5">
            <Link href={`/posts/${post.slug}`} className="font-medium hover:underline">
              {post.title}
            </Link>
            <span className="text-xs text-zinc-400">{post.published_at?.slice(0, 10)}</span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
