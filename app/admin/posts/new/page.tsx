import { PostForm } from "@/components/editor/post-form";
import { createPostAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/posts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function AdminWritePage() {
  await requireAdmin();
  const categories = await getCategories();

  return (
    <section className="space-y-5">
      <Card>
        <CardHeader>
          <h2>새 글 작성</h2>
          <p className="mt-2 text-sm text-muted-foreground">제목을 입력하고 Enter를 누르면 본문 에디터로 포커스가 이동합니다.</p>
        </CardHeader>
        <CardContent>
          <PostForm categories={categories} action={createPostAction} />
        </CardContent>
      </Card>
    </section>
  );
}
