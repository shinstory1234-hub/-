import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

export default async function AdminPostsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id,title,slug,is_published,published_at,created_at,categories(name)")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2>글 목록</h2>
        <Link href="/admin/posts/new">
          <Button>새 글 작성</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {posts?.map((post: any) => (
          <Card key={post.id}>
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-base font-semibold">{post.title}</p>
                <p className="text-xs text-muted-foreground">/{post.slug}</p>
                <div className="flex gap-2">
                  <Badge>{post.is_published ? "발행" : "임시저장"}</Badge>
                  <Badge>{Array.isArray(post.categories) ? post.categories[0]?.name ?? "미분류" : post.categories?.name ?? "미분류"}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{(post.published_at ?? post.created_at)?.slice(0, 10)}</span>
                <Link href={`/admin/posts/${post.id}/edit`}>
                  <Button variant="outline">수정</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
