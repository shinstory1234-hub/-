"use server";

import { revalidatePath } from "next/cache";
<<<<<<< HEAD
=======
import { redirect } from "next/navigation";
>>>>>>> origin/main
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

function toSlug(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");
}

<<<<<<< HEAD
export type CreatePostState = {
  ok: boolean;
  id?: string;
  error?: string;
  redirectTo?: string;
};

=======
>>>>>>> origin/main
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

<<<<<<< HEAD
export async function createPostAction(_prev: CreatePostState, formData: FormData): Promise<CreatePostState> {
  const user = await requireAdmin();

=======
export async function createPostAction(formData: FormData) {
  const user = await requireAdmin();
>>>>>>> origin/main
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
<<<<<<< HEAD
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;
  const intent = String(formData.get("intent") ?? "draft").trim();
  const isPublished = intent === "publish";

  if (!title || !slug || !content) {
    return {
      ok: false,
      error: "제목, slug, 본문은 필수입니다."
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      slug,
      excerpt: excerpt || null,
      content,
      category_id: categoryId,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null
    })
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      error: error.message
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
  revalidatePath("/topics/all");

  return {
    ok: true,
    id: data.id,
    redirectTo: "/admin/posts"
  };
=======
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
>>>>>>> origin/main
}
