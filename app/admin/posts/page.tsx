import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deletePostFormAction, togglePublishFormAction } from "@/app/admin/actions";
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{(post.published_at ?? post.created_at)?.slice(0, 10)}</span>
                <form action={togglePublishFormAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="publish" value={post.is_published ? "false" : "true"} />
                  <Button variant="outline" type="submit">{post.is_published ? "비공개" : "발행"}</Button>
                </form>
                <form action={deletePostFormAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <Button variant="danger" type="submit">삭제</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
