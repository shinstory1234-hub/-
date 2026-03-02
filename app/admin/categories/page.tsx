import { CategoryItem } from "@/components/admin/category-item";
import { CategoryCreateForm } from "@/components/admin/category-create-form";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,description,sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">카테고리 관리</h1>

      <CategoryCreateForm />

      {categories?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category, index) => (
            <CategoryItem key={category.id} category={category} isFirst={index === 0} isLast={index === categories.length - 1} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface p-6 text-sm text-muted-foreground">아직 카테고리가 없습니다.</p>
      )}
    </section>
  );
}
