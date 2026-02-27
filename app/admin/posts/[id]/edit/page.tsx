import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export default async function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("id,title,excerpt,content").eq("id", id).single();
  if (!post) return notFound();

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">글 수정</h1>
      <form className="space-y-4">
        <Input defaultValue={post.title} />
        <Textarea defaultValue={post.excerpt ?? ""} rows={3} />
        <Textarea defaultValue={post.content} rows={12} />
        <Button>수정 저장</Button>
      </form>
    </section>
  );
}
