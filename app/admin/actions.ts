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

function makePostSlug(raw: string, title: string) {
  const base = (raw || title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (base) return base;
  return `post-${Date.now().toString(36)}`;
}

function getText(formData: FormData, key: string) {
  const exact = formData.get(key);
  if (typeof exact === "string" && exact.trim()) return exact;

  for (const [k, v] of formData.entries()) {
    const isMatchedKey = k === key || k.endsWith(`_${key}`);
    if (isMatchedKey && typeof v === "string" && v.trim()) return v;
  }
  return "";
}


function isSortOrderSchemaError(message?: string | null) {
  if (!message) return false;
  return message.includes("sort_order") && message.includes("schema cache");
}

export type ActionState = {
  ok: boolean;
  id?: string;
  error?: string;
  redirectTo?: string;
};

export async function createCategoryAction(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(getText(formData, "name") ?? "").trim();
  const description = String(getText(formData, "description") ?? "").trim();
  if (!name) return { ok: false, error: "카테고리 이름은 필수입니다." };

  const supabase = await createClient();
  const { data: maxRow, error: maxError } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError && !isSortOrderSchemaError(maxError.message)) {
    return { ok: false, error: maxError.message };
  }

  const nextSortOrder = Number(maxRow?.sort_order ?? 0) + 1;

  let { error } = await supabase
    .from("categories")
    .insert({ name, slug: toSlug(name), description: description || null, sort_order: nextSortOrder });

  if (error && isSortOrderSchemaError(error.message)) {
    const fallbackInsert = await supabase.from("categories").insert({ name, slug: toSlug(name), description: description || null });
    error = fallbackInsert.error;
  }

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts/new");
  revalidatePath("/");
  return { ok: true };
}

export async function updateCategoryAction(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(getText(formData, "id") ?? "");
  const name = String(getText(formData, "name") ?? "").trim();
  const description = String(getText(formData, "description") ?? "").trim();
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
  const id = String(getText(formData, "id") ?? "");
  if (!id) return { ok: false, error: "카테고리 id가 없습니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts/new");
  revalidatePath("/");
  return { ok: true };
}


export async function moveCategoryOrderAction(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = String(getText(formData, "id") ?? "").trim();
  const direction = String(getText(formData, "direction") ?? "").trim();
  if (!id || !["up", "down"].includes(direction)) {
    return { ok: false, error: "순서 변경 정보가 올바르지 않습니다." };
  }

  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id,sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !categories) return { ok: false, error: error?.message ?? "카테고리를 찾을 수 없습니다." };

  const index = categories.findIndex((item) => item.id === id);
  if (index < 0) return { ok: false, error: "카테고리를 찾을 수 없습니다." };

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= categories.length) return { ok: true };

  const current = categories[index];
  const target = categories[targetIndex];
  const currentOrder = Number(current.sort_order ?? index + 1);
  const targetOrder = Number(target.sort_order ?? targetIndex + 1);

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("categories").update({ sort_order: targetOrder }).eq("id", current.id),
    supabase.from("categories").update({ sort_order: currentOrder }).eq("id", target.id)
  ]);

  if (e1 || e2) return { ok: false, error: e1?.message ?? e2?.message ?? "순서 저장에 실패했습니다." };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/admin/posts/new");

  return { ok: true };
}


export async function createCategoryStateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return createCategoryAction(formData);
}

export async function createPostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();

  const title = String(getText(formData, "title") ?? "").trim();
  const slugRaw = String(getText(formData, "slug") ?? "").trim();
  const content = String(getText(formData, "content") ?? "").trim();
  const excerpt = String(getText(formData, "excerpt") ?? "").trim();
  const categoryId = String(getText(formData, "category_id") ?? "").trim() || null;
  const intent = String(getText(formData, "intent") || "draft").trim();

  const slug = makePostSlug(slugRaw, title);
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

  const id = String(getText(formData, "id") ?? "").trim();
  const title = String(getText(formData, "title") ?? "").trim();
  const slugRaw = String(getText(formData, "slug") ?? "").trim();
  const content = String(getText(formData, "content") ?? "").trim();
  const excerpt = String(getText(formData, "excerpt") ?? "").trim();
  const categoryId = String(getText(formData, "category_id") ?? "").trim() || null;
  const intent = String(getText(formData, "intent") || "save").trim();

  const slug = makePostSlug(slugRaw, title);

  if (!id) return { ok: false, error: "post id가 없습니다." };
  if (!title || !slug || !content) return { ok: false, error: "제목, slug, 본문은 필수입니다." };
  if (!categoryId) return { ok: false, error: "카테고리를 먼저 선택해 주세요." };

  const supabase = await createClient();
  const { data: currentPost, error: currentError } = await supabase
    .from("posts")
    .select("is_published,published_at")
    .eq("id", id)
    .single();
  if (currentError || !currentPost) return { ok: false, error: currentError?.message ?? "글을 찾을 수 없습니다." };

  const isPublishIntent = intent === "publish";
  const nextPublished = isPublishIntent ? true : Boolean(currentPost.is_published);
  const nextPublishedAt = isPublishIntent
    ? (currentPost.published_at ?? new Date().toISOString())
    : currentPost.published_at;

  const { error } = await supabase
    .from("posts")
    .update({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      category_id: categoryId,
      is_published: nextPublished,
      published_at: nextPublishedAt
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
  const id = String(getText(formData, "id") ?? "").trim();
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
  const id = String(getText(formData, "id") ?? "").trim();
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
  await createCategoryStateAction({ ok: false }, formData);
}

export async function updateCategoryFormAction(formData: FormData): Promise<void> {
  await updateCategoryAction(formData);
}

export async function deleteCategoryFormAction(formData: FormData): Promise<void> {
  await deleteCategoryAction(formData);
}

export async function moveCategoryOrderFormAction(formData: FormData): Promise<void> {
  await moveCategoryOrderAction(formData);
}
