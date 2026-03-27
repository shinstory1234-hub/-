import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { EditPostForm } from "@/components/editor/edit-post-form";
import { createClient as createServiceClient } from "@supabase/supabase-js";

async function getAttachments(postId: string) {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("attachments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export default async function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: post }, { data: categories }, { data: postCategories }, attachments] = await Promise.all([
    supabase.from("posts").select("id,title,slug,excerpt,content,cover_url,is_published").eq("id", id).single(),
    supabase.from("categories").select("id,name,slug,description,created_at,sort_order").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
    supabase.from("post_categories").select("category_id").eq("post_id", id),
    getAttachments(id),
  ]);
  if (!post) return notFound();
  const initialCategoryIds = (postCategories ?? []).map((r: any) => String(r.category_id));
  return (
    <section>
      <Card>
        <CardHeader>
          <h2>글 수정</h2>
          <p className="mt-2 text-sm text-muted-foreground">수정 화면에서도 이미지 업로드/커서 삽입을 동일하게 지원합니다.</p>
        </CardHeader>
        <CardContent>
          <EditPostForm post={post} categories={categories ?? []} initialCategoryIds={initialCategoryIds} initialAttachments={attachments} />
        </CardContent>
      </Card>
    </section>
  );
}