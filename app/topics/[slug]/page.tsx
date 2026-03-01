import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { getCategories, getPosts } from "@/lib/posts";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [posts, categories] = await Promise.all([getPosts(slug === "all" ? undefined : slug), getCategories()]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">카테고리</h1>
      <Tabs
        items={[
          { label: "전체", href: "/topics/all", active: slug === "all" },
          ...categories.map((cat) => ({ label: cat.name, href: `/topics/${cat.slug}`, active: slug === cat.slug }))
        ]}
      />
      <div className="space-y-3">
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
      </div>
    </section>
  );
}
