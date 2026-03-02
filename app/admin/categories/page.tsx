import { CategoryItem } from "@/components/admin/category-item";
import { CategoryCreateForm } from "@/components/admin/category-create-form";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const categoryOrder = { ascending: true as const };
  const createdOrder = { ascending: false as const };
  let { data: categories, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,sort_order,created_at")
    .order("sort_order", categoryOrder)
    .order("created_at", createdOrder);

  if (error?.message?.includes("sort_order") && error.message.includes("schema cache")) {
    const fallback = await supabase
      .from("categories")
      .select("id,name,slug,description,created_at")
      .order("created_at", { ascending: false });
    categories = fallback.data as any;
    error = fallback.error;
  }

  const loadError = error?.message ?? null;
  const categoryItems = categories ?? [];

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">카테고리 관리</h1>

      <CategoryCreateForm initialLoadError={loadError} />

      {loadError ? (
        <p className="rounded-lg border border-danger/20 bg-danger/10 p-4 text-sm text-danger">카테고리 조회 실패: {loadError}</p>
      ) : null}

      {categoryItems.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {categoryItems.map((category, index) => (
            <CategoryItem key={category.id} category={category} isFirst={index === 0} isLast={index === categoryItems.length - 1} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface p-6 text-sm text-muted-foreground">아직 카테고리가 없습니다.</p>
      )}
    </section>
  );
}
