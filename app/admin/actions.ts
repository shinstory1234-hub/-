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
    .replace(/[^a-z0-9가-힣\s-]/g, "")
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
    const isMatchedKey = k === key || k.endsWith(`_${key}`) || k.endsWith(`:${key}`);
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

export async function swapCategoryOrderAction(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const keys = Array.from(formData.keys());
  const id = String(getText(formData, "id") ?? "").trim();
  const direction = String(getText(formData, "direction") ?? "").trim().toLowerCase();

  if (!id) return { ok: false, error: `id 누락: keys=${keys.join(",") || "(none)"}` };
  if (!["up", "down"].includes(direction)) {
    return { ok: false, error: `순서 변경 정보가 올바르지 않습니다. direction=${direction || "(empty)"}` };
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("categories")
    .select("id,sort_order,created_at")
    .eq("id", id)
    .single();

  if (currentError || !current) {
    return { ok: false, error: `카테고리를 찾을 수 없습니다. ${currentError?.message ?? ""}`.trim() };
  }

  let neighborQuery = supabase
    .from("categories")
    .select("id,sort_order")
    .neq("id", id)
    .order("sort_order", { ascending: direction === "down" })
    .order("created_at", { ascending: false })
    .limit(1);

  if (direction === "up") {
    neighborQuery = neighborQuery.lt("sort_order", current.sort_order ?? 0);
  } else {
    neighborQuery = neighborQuery.gt("sort_order", current.sort_order ?? 0);
  }

  const { data: neighbor, error: neighborError } = await neighborQuery.maybeSingle();
  if (neighborError) return { ok: false, error: `이웃 카테고리 조회 실패: ${neighborError.message}` };
  if (!neighbor) return { ok: false, error: direction === "up" ? "이미 최상단" : "이미 최하단" };

  const currentOrder = Number(current.sort_order ?? 0);
  const neighborOrder = Number(neighbor.sort_order ?? 0);
  const tempOrder = Math.max(currentOrder, neighborOrder) + 1_000_000;

  const { error: e1 } = await supabase.from("categories").update({ sort_order: tempOrder }).eq("id", current.id);
  if (e1) return { ok: false, error: `순서 저장 실패(1/3): ${e1.message}` };

  const { error: e2 } = await supabase.from("categories").update({ sort_order: currentOrder }).eq("id", neighbor.id);
  if (e2) return { ok: false, error: `순서 저장 실패(2/3): ${e2.message}` };

  const { error: e3 } = await supabase.from("categories").update({ sort_order: neighborOrder }).eq("id", current.id);
  if (e3) return { ok: false, error: `순서 저장 실패(3/3): ${e3.message}` };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/admin/posts/new");
  return { ok: true };
}

export async function moveCategoryOrderStateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return swapCategoryOrderAction(formData);
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
  const categoryIdsJson = String(getText(formData, "category_ids_json") ?? "[]");
  const categoryIds = (() => { try { return JSON.parse(categoryIdsJson).map(String).filter(Boolean); } catch { return []; } })();
  const intent = String(getText(formData, "intent") || "draft").trim();
  const coverUrl = String(getText(formData, "cover_url") ?? "").trim() || null;

  const slug = makePostSlug(slugRaw, title);
  const isPublished = intent === "publish";

  if (!title || !slug || !content) {
    return { ok: false, error: "제목, slug, 본문은 필수입니다." };
  }
  if (categoryIds.length === 0) return { ok: false, error: "카테고리를 최소 1개 선택해 주세요." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      slug,
      excerpt: excerpt || null,
      content,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      cover_url: coverUrl,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await supabase.from("post_categories").insert(
    categoryIds.map((cid) => ({ post_id: data.id, category_id: Number(cid) }))
  );

  const attachmentsRaw = String(getText(formData, "attachments") ?? "").trim();
  if (attachmentsRaw && attachmentsRaw !== "[]") {
    try {
      const attachments = JSON.parse(attachmentsRaw) as { name: string; url: string }[];
      if (attachments.length > 0) {
        await supabase.from("attachments").insert(
          attachments.map((a) => ({ post_id: data.id, name: a.name, url: a.url }))
        );
      }
    } catch {}
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/posts/new");
  revalidatePath("/topics/all");
  revalidatePath(`/posts/${slug}`);

  return { ok: true, id: data.id, redirectTo: "/admin/posts" };
}

export async function updatePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = String(getText(formData, "id") ?? "").trim();
  const title = String(getText(formData, "title") ?? "").trim();
  const slugRaw = String(getText(formData, "slug") ?? "").trim();
  const content = String(getText(formData, "content") ?? "").trim();
  const excerpt = String(getText(formData, "excerpt") ?? "").trim();
  const categoryIdsJson = String(getText(formData, "category_ids_json") ?? "[]");
  const categoryIds = (() => { try { return JSON.parse(categoryIdsJson).map(String).filter(Boolean); } catch { return []; } })();
  const intent = String(getText(formData, "intent") || "save").trim();
  const coverUrl = String(getText(formData, "cover_url") ?? "").trim() || null;

  const slug = makePostSlug(slugRaw, title);

  if (!id) return { ok: false, error: "post id가 없습니다." };
  if (!title || !slug || !content) return { ok: false, error: "제목, slug, 본문은 필수입니다." };
  if (categoryIds.length === 0) return { ok: false, error: "카테고리를 최소 1개 선택해 주세요." };

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
      is_published: nextPublished,
      published_at: nextPublishedAt,
      cover_url: coverUrl,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  await supabase.from("post_categories").delete().eq("post_id", id);
  await supabase.from("post_categories").insert(
    categoryIds.map((cid) => ({ post_id: id, category_id: Number(cid) }))
  );

  revalidatePath("/");
  revalidatePath("/admin/posts");
  revalidatePath(`/posts/${slug}`);
  return { ok: true, id, redirectTo: `/posts/${slug}` };
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
  await swapCategoryOrderAction(formData);
}

export async function moveToEdgeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(getText(formData, "id") ?? "").trim();
  const direction = String(getText(formData, "direction") ?? "").trim();

  if (!id || !["first", "last"].includes(direction)) {
    return { ok: false, error: "잘못된 요청입니다." };
  }

  const supabase = await createClient();
  const { data: all } = await supabase
    .from("categories")
    .select("id,sort_order")
    .order("sort_order", { ascending: true });

  if (!all || all.length === 0) return { ok: false, error: "카테고리가 없습니다." };

  const minOrder = all[0].sort_order ?? 0;
  const maxOrder = all[all.length - 1].sort_order ?? 0;

  const newOrder = direction === "first" ? minOrder - 1 : maxOrder + 1;

  const { error } = await supabase.from("categories").update({ sort_order: newOrder }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function uploadAttachmentAction(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const postId = String(formData.get("post_id") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!postId || !file || file.size === 0) {
    return { ok: false, error: "파일 또는 게시글 정보가 없습니다." };
  }

  const supabase = await createClient();
  const filePath = `${postId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(filePath, file);

  if (uploadError) return { ok: false, error: uploadError.message };

  const { error: dbError } = await supabase.from("post_attachments").insert({
    post_id: postId,
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    mime_type: file.type,
  });

  if (dbError) return { ok: false, error: dbError.message };

  revalidatePath(`/admin/posts`);
  return { ok: true };
}

export async function deleteAttachmentAction(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const filePath = String(formData.get("file_path") ?? "").trim();
  if (!id || !filePath) return { ok: false, error: "첨부파일 정보가 없습니다." };

  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from("attachments")
    .remove([filePath]);

  if (storageError) return { ok: false, error: storageError.message };

  const { error: dbError } = await supabase.from("post_attachments").delete().eq("id", id);
  if (dbError) return { ok: false, error: dbError.message };

  revalidatePath(`/admin/posts`);
  return { ok: true };
}
