import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/app/admin/actions";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id,name,slug,description").order("name");

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">카테고리 관리</h1>

      <form action={createCategoryAction} className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
        <h2 className="font-semibold">새 카테고리</h2>
        <Input name="name" placeholder="예: 재테크" required />
        <Textarea name="description" placeholder="설명" rows={3} />
        <Button type="submit">생성</Button>
      </form>

      <div className="space-y-3">
        {categories?.map((category) => (
          <form key={category.id} action={updateCategoryAction} className="rounded-2xl border bg-white p-5 shadow-sm space-y-2">
            <input type="hidden" name="id" value={category.id} />
            <Input name="name" defaultValue={category.name} required />
            <Textarea name="description" defaultValue={category.description ?? ""} rows={2} />
            <div className="flex gap-2">
              <Button type="submit">수정</Button>
              <button
                type="submit"
                formAction={deleteCategoryAction}
                className="inline-flex h-11 items-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-500"
              >
                삭제
              </button>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
