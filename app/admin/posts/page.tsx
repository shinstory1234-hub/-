export const revalidate = 0;

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { AdminPostList } from "@/components/admin/admin-post-list";

export default async function AdminPostsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: rawPosts } = await supabase
    .from("posts")
    .select("id,title,slug,is_published,published_at,created_at,categories!posts_category_id_fkey(name,slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  const posts = (rawPosts ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    is_published: p.is_published,
    published_at: p.published_at,
    created_at: p.created_at,
    categories: Array.isArray(p.categories) ? p.categories[0] ?? null : p.categories ?? null,
  }));

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2>글 목록</h2>
        <Link href="/admin/posts/new">
          <Button>새 글 작성</Button>
        </Link>
      </div>
      <AdminPostList posts={posts} />
    </section>
  );
}
