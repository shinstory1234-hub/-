import { CategoryItem } from "@/components/admin/category-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCategoryAction } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id,name,slug,description").order("name");

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">카테고리 관리</h1>

      <form action={createCategoryAction} className="space-y-3 rounded-lg border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-semibold">새 카테고리</h2>
        <Input name="name" placeholder="예: 재테크" required />
        <Textarea name="description" placeholder="설명" rows={3} />
        <Button type="submit">생성</Button>
      </form>

      {categories?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => <CategoryItem key={category.id} category={category} />)}
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface p-6 text-sm text-muted-foreground">아직 카테고리가 없습니다.</p>
      )}
    </section>
  );
}
