import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export default async function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("id,title,excerpt,content").eq("id", id).single();
  if (!post) return notFound();

  return (
    <section>
      <Card>
        <CardHeader>
          <h2>글 수정</h2>
          <p className="mt-2 text-sm text-muted-foreground">현재 화면은 읽기/검토용 UI입니다. 저장 기능은 다음 단계에서 연결합니다.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input defaultValue={post.title} />
            <Textarea defaultValue={post.excerpt ?? ""} rows={3} />
            <Textarea defaultValue={post.content} rows={12} />
            <Button>수정 저장</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
