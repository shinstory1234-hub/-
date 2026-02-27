import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getPostsByTopic } from "@/lib/posts";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getPostsByTopic(slug);

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">카테고리/태그: {slug}</h1>
      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="flex items-center justify-between">
              <Link href={`/posts/${post.slug}`} className="font-medium hover:underline">
                {post.title}
              </Link>
              <span className="text-xs text-zinc-400">{post.published_at}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
