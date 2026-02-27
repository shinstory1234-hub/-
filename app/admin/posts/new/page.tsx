import { PostForm } from "@/components/editor/post-form";
import { createPostAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/posts";

export default async function AdminWritePage() {
  await requireAdmin();
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">새 글 작성</h1>
      <PostForm categories={categories} action={createPostAction} />
    </section>
  );
}
