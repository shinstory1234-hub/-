import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { EditPostForm } from "@/components/editor/edit-post-form";

export default async function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from("posts").select("id,title,slug,excerpt,content,category_id,is_published").eq("id", id).single(),
    supabase.from("categories").select("id,name,slug,description,created_at,sort_order").order("sort_order", { ascending: true }).order("created_at", { ascending: true })
  ]);

  if (!post) return notFound();

  return (
    <section>
      <Card>
        <CardHeader>
          <h2>글 수정</h2>
          <p className="mt-2 text-sm text-muted-foreground">수정 화면에서도 이미지 업로드/커서 삽입을 동일하게 지원합니다.</p>
        </CardHeader>
        <CardContent>
          <EditPostForm post={post} categories={categories ?? []} />
        </CardContent>
      </Card>
    </section>
  );
}
