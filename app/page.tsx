// force redeploy
export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { getCategories, getPostsWithError } from "@/lib/posts";
import { PostSlugLink } from "@/components/post-slug-link";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [{ posts, error: postsError }, categories] = await Promise.all([getPostsWithError(category), getCategories()]);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-xl font-bold md:text-2xl">VC심사역 출신의 인사이트</h1>
      </header>

      <Tabs
        items={[
          { href: "/", label: "전체", active: !category },
          ...categories.map((cat) => ({ href: `/?category=${cat.slug}`, label: cat.name, active: category === cat.slug }))
        ]}
      />

      {postsError ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-danger">글 목록 조회 실패: {postsError}</CardContent>
        </Card>
      ) : null}

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
                    {post.tags?.slice(0, 2).map((tag, idx) => (
                      <Badge key={`${post.id}-tag-${idx}-${tag}`}>#{tag}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{post.published_at?.slice(0, 10) ?? "임시저장"}</span>
                </div>
                <PostSlugLink slug={post.slug} className="line-clamp-2 text-left text-lg font-semibold leading-7 hover:text-accent">
                  {post.title}
                </PostSlugLink>
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
