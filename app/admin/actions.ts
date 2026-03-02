"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

function toSlug(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getField(formData: FormData, key: string) {
  const exact = formData.get(key);
  if (typeof exact === "string" && exact.trim()) return exact;

  for (const [k, v] of formData.entries()) {
    if (k.endsWith(`_${key}`) && typeof v === "string" && v.trim()) return v;
  }
  return "";
}

export type ActionState = {
  ok: boolean;
  id?: string;
  error?: string;
  redirectTo?: string;
};

export async function createCategoryAction(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return { ok: false, error: "카테고리 이름은 필수입니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name, slug: toSlug(name), description: description || null });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts/new");
  revalidatePath("/");
  return { ok: true };
}

export async function updateCategoryAction(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!id || !name) return { ok: false, error: "카테고리 정보가 올바르지 않습니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, slug: toSlug(name), description: description || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts/new");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategoryAction(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "카테고리 id가 없습니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts/new");
  revalidatePath("/");
  return { ok: true };
}

export async function createPostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();

  const title = String(getField(formData, "title") ?? "").trim();
  const slugRaw = String(getField(formData, "slug") ?? "").trim();
  const content = String(getField(formData, "content") ?? "").trim();
  const excerpt = String(getField(formData, "excerpt") ?? "").trim();
  const categoryId = String(getField(formData, "category_id") ?? "").trim() || null;
  const intent = String(getField(formData, "intent") || "draft").trim();

  const slug = slugRaw || toSlug(title);
  const isPublished = intent === "publish";

  if (!title || !slug || !content) {
    return {
      ok: false,
      error: "제목, slug, 본문은 필수입니다."
    };
  }
  if (!categoryId) return { ok: false, error: "카테고리를 먼저 선택해 주세요." };

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
  revalidatePath("/admin/posts/new");
  revalidatePath("/topics/all");

  return {
    ok: true,
    id: data.id,
    redirectTo: "/admin/posts"
  };
}


export async function updatePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = String(getField(formData, "id") ?? "").trim();
  const title = String(getField(formData, "title") ?? "").trim();
  const slugRaw = String(getField(formData, "slug") ?? "").trim();
  const content = String(getField(formData, "content") ?? "").trim();
  const excerpt = String(getField(formData, "excerpt") ?? "").trim();
  const categoryId = String(getField(formData, "category_id") ?? "").trim() || null;
  const intent = String(getField(formData, "intent") || "draft").trim();

  const slug = slugRaw || toSlug(title);
  const isPublished = intent === "publish";

  if (!id) return { ok: false, error: "post id가 없습니다." };
  if (!title || !slug || !content) return { ok: false, error: "제목, slug, 본문은 필수입니다." };
  if (!categoryId) return { ok: false, error: "카테고리를 먼저 선택해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      category_id: categoryId,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/posts");
  revalidatePath(`/posts/${slug}`);
  return { ok: true, id, redirectTo: "/admin/posts" };
}

export async function deletePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "post id가 없습니다." };

  const supabase = await createClient();

  const { error: commentsError } = await supabase.from("comments").delete().eq("post_id", id);
  if (commentsError) return { ok: false, error: commentsError.message };

  const { error: likesError } = await supabase.from("likes").delete().eq("post_id", id);
  if (likesError) return { ok: false, error: likesError.message };

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { ok: true };
}

export async function togglePublishAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const publish = String(formData.get("publish") ?? "false") === "true";
  if (!id) return { ok: false, error: "post id가 없습니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ is_published: publish, published_at: publish ? new Date().toISOString() : null })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { ok: true };
}


export async function deletePostFormAction(formData: FormData): Promise<void> {
  await deletePostAction({ ok: false }, formData);
}

export async function togglePublishFormAction(formData: FormData): Promise<void> {
  await togglePublishAction({ ok: false }, formData);
}


export async function createCategoryFormAction(formData: FormData): Promise<void> {
  await createCategoryAction(formData);
}

export async function updateCategoryFormAction(formData: FormData): Promise<void> {
  await updateCategoryAction(formData);
}

export async function deleteCategoryFormAction(formData: FormData): Promise<void> {
  await deleteCategoryAction(formData);
}
