import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { AdminPostList } from "@/components/admin/admin-post-list";

export default async function AdminPostsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id,title,slug,is_published,published_at,created_at,categories!posts_category_id_fkey(name,slug)")
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
      <AdminPostList posts={posts ?? []} />
    </section>
  );
}
