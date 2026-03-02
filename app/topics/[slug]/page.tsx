import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { getCategories, getPosts } from "@/lib/posts";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await getCategories();
  const selected = categories.find((cat) => cat.slug === slug);
  const showPosts = slug !== "all" && Boolean(selected);
  const posts = showPosts ? await getPosts(slug) : [];

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">카테고리</h1>
      <Tabs
        items={[
          { label: "카테고리 목록", href: "/topics/all", active: slug === "all" },
          ...categories.map((cat) => ({ label: cat.name, href: `/topics/${cat.slug}`, active: slug === cat.slug }))
        ]}
      />

      {slug === "all" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/topics/${cat.slug}`}>
              <Card className="transition hover:-translate-y-0.5">
                <CardContent className="py-5">
                  <p className="font-semibold">{cat.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">/{cat.slug}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}

      {showPosts ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{selected?.name} 카테고리 글</p>
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-center justify-between py-5">
                <Link href={`/posts/${post.slug}`} className="font-medium hover:text-accent">
                  {post.title}
                </Link>
                <span className="text-xs text-muted-foreground">{post.published_at?.slice(0, 10)}</span>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 ? <p className="text-sm text-muted-foreground">아직 글이 없습니다.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
