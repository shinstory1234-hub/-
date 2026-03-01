import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPostBySlug, getPosts } from "@/lib/posts";

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const all = await getPosts();
  const index = all.findIndex((item) => item.slug === slug);
  const prev = index >= 0 ? all[index + 1] : undefined;
  const next = index > 0 ? all[index - 1] : undefined;

  return (
    <article className="mx-auto max-w-content space-y-6">
      <Card className="p-8 md:p-10">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{post.category?.name ?? "미분류"}</Badge>
            {post.tags?.map((tag) => (
              <Badge key={tag}>#{tag}</Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>
          <p className="text-sm text-muted-foreground">{post.published_at?.slice(0, 10)}</p>
        </div>
        <div className="prose mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
          <Button variant="outline" size="sm">링크 공유</Button>
          <Button variant="outline" size="sm">카카오 공유</Button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/posts/${prev.slug}`} className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground hover:text-foreground">
            이전 글<br />
            <span className="font-semibold text-foreground">{prev.title}</span>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/posts/${next.slug}`} className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground hover:text-foreground sm:text-right">
            다음 글<br />
            <span className="font-semibold text-foreground">{next.title}</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
