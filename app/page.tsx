import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPosts } from "@/lib/posts";

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">최신 글</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="hover:-translate-y-0.5 hover:shadow-md transition">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Badge>{post.category}</Badge>
                {post.tags.map((tag) => (
                  <Badge key={tag}>#{tag}</Badge>
                ))}
              </div>
              <Link href={`/posts/${post.slug}`} className="text-lg font-semibold hover:underline">
                {post.title}
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">{post.excerpt}</p>
              <p className="mt-3 text-xs text-zinc-400">{post.published_at}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
