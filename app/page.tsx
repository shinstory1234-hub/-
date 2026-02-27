import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCategories, getPosts } from "@/lib/posts";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [posts, categories] = await Promise.all([getPosts(category), getCategories()]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">머니NPC</h1>
          <p className="text-sm text-zinc-500">돈과 생산성에 대한 실전 노트를 정리합니다.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/" className={`rounded-full px-3 py-1.5 text-sm ${!category ? "bg-zinc-900 text-white" : "bg-white text-zinc-600"}`}>
          전체
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.slug}`}
            className={`rounded-full px-3 py-1.5 text-sm ${category === cat.slug ? "bg-zinc-900 text-white" : "bg-white text-zinc-600"}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              {post.category?.name ? <Badge>{post.category.name}</Badge> : null}
              <Link href={`/posts/${post.slug}`} className="mt-2 line-clamp-2 text-lg font-semibold hover:underline">
                {post.title}
              </Link>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-zinc-600">{post.excerpt || "요약이 없습니다."}</p>
              <p className="mt-4 text-xs text-zinc-400">{post.published_at?.slice(0, 10) ?? "임시저장"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
