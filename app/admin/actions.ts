"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

function toSlug(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  await supabase.from("categories").insert({ name, slug: toSlug(name), description: description || null });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!id || !name) return;

  const supabase = await createClient();
  await supabase.from("categories").update({ name, slug: toSlug(name), description: description || null }).eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function createPostAction(formData: FormData) {
  const user = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const intent = String(formData.get("intent") ?? "draft");
  const isPublished = intent === "publish";
  if (!title || !slug || !content) return;

  const supabase = await createClient();
  await supabase.from("posts").insert({
    author_id: user.id,
    title,
    slug,
    excerpt: excerpt || null,
    content,
    category_id: categoryId,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null
  });

  revalidatePath("/");
  redirect("/admin");
}
