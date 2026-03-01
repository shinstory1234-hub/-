import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { getCategories, getPosts } from "@/lib/posts";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [posts, categories] = await Promise.all([getPosts(category), getCategories()]);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">투자 · 커리어 · 생산성 기록</p>
        <h1 className="text-3xl font-bold md:text-4xl">최신 글</h1>
      </header>

      <Tabs
        items={[
          { href: "/", label: "전체", active: !category },
          ...categories.map((cat) => ({ href: `/?category=${cat.slug}`, label: cat.name, active: category === cat.slug }))
        ]}
      />

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">아직 글이 없습니다. 첫 글을 발행해보세요.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden transition hover:-translate-y-0.5">
              {post.cover_url ? <div className="h-40 w-full bg-cover bg-center" style={{ backgroundImage: `url(${post.cover_url})` }} /> : null}
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.category?.name ? <Badge>{post.category.name}</Badge> : <Badge>미분류</Badge>}
                    {post.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag}>#{tag}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{post.published_at?.slice(0, 10) ?? "임시저장"}</span>
                </div>
                <Link href={`/posts/${post.slug}`} className="line-clamp-2 text-lg font-semibold leading-7 hover:text-accent">
                  {post.title}
                </Link>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt || "요약이 없습니다."}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
