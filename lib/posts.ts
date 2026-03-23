import { createClient } from "@/lib/supabase-server";
import { Category, Comment, Post } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const categoryOrder = { ascending: true as const };
  const createdOrder = { ascending: false as const };
  let { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,created_at,sort_order")
    .order("sort_order", categoryOrder)
    .order("created_at", createdOrder);

  if (error?.message?.includes("sort_order") && error.message.includes("schema cache")) {
    const fallback = await supabase
      .from("categories")
      .select("id,name,slug,description,created_at")
      .order("created_at", { ascending: false });
    data = fallback.data as any;
    error = fallback.error;
  }

  if (error) return [];
  return data ?? [];
}

export type PostListResult = { posts: Post[]; error: string | null };

export async function getPosts(categorySlug?: string): Promise<Post[]> {
  const result = await getPostsWithError(categorySlug);
  return result.posts;
}

export async function getPostsWithError(categorySlug?: string): Promise<PostListResult> {
  const supabase = await createClient();

  const selectWithViewCount =
    "id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,view_count,categories!posts_category_id_fkey(name,slug)";
  const selectWithoutViewCount =
    "id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,categories!posts_category_id_fkey(name,slug)";

  const runQuery = async (selectFields: string) => {
    let query = supabase
      .from("posts")
      .select(selectFields)
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (categorySlug) {
      const { data: cat, error: categoryError } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
      if (categoryError) return { data: null, error: categoryError };
      if (cat?.id) query = query.eq("category_id", cat.id);
    }

    return query;
  };

  const firstResult = await runQuery(selectWithViewCount);
  if (firstResult.error) {
    const isViewCountError =
      firstResult.error.message.includes("view_count") || firstResult.error.message.includes("does not exist");

    if (isViewCountError) {
      const fallbackResult = await runQuery(selectWithoutViewCount);
      if (fallbackResult.error) return { posts: [], error: fallbackResult.error.message };
      return {
        posts: (fallbackResult.data ?? []).map((row: any) => ({
          ...row,
          view_count: 0,
          category: row.categories ?? null
        })),
        error: null
      };
    }

    return { posts: [], error: firstResult.error.message };
  }

  return {
    posts: (firstResult.data ?? []).map((row: any) => ({
      ...row,
      view_count: Number(row.view_count ?? 0),
      category: row.categories ?? null
    })),
    error: null
  };
}

export async function getPostBySlug(slugParam: string): Promise<Post | null> {
  const supabase = await createClient();
  let decodedSlug = slugParam;

  try {
    decodedSlug = decodeURIComponent(slugParam);
  } catch {
    decodedSlug = slugParam;
  }

  const candidates = Array.from(
    new Set(
      [slugParam, decodedSlug, slugParam.trim(), decodedSlug.trim(), slugParam.toLowerCase(), decodedSlug.toLowerCase()]
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );

  const isMissingViewCountError = (message?: string | null) =>
    Boolean(message && message.includes("view_count") && (message.includes("does not exist") || message.includes("schema cache")));

  const isCategoryRelationError = (message?: string | null) =>
    Boolean(message && message.includes("posts_category_id_fkey") && message.includes("relationship"));

  const findBySlug = async (selectFields: string) => {
    let lastError: string | null = null;
    for (const candidate of candidates) {
      const { data, error } = await supabase
        .from("posts")
        .select(selectFields)
        .eq("is_published", true)
        .eq("slug", candidate)
        .maybeSingle();

      if (data && !error) return { data, error: null as string | null };
      if (error) lastError = error.message;
    }

    return { data: null, error: lastError };
  };

  const normalizePost = (row: any, category: { name: string; slug: string } | null): Post =>
    ({
      ...row,
      category,
      is_published: Boolean(row?.is_published ?? false),
      view_count: Number(row?.view_count ?? 0)
    } as Post);

  const mapWithCategory = async (row: any, includeJoinedCategory: boolean): Promise<Post> => {
    if (includeJoinedCategory) {
      return normalizePost(row, row.categories ?? null);
    }

    let category: { name: string; slug: string } | null = null;
    if (row.category_id) {
      const { data: categoryRow } = await supabase.from("categories").select("name,slug").eq("id", row.category_id).maybeSingle();
      category = categoryRow ?? null;
    }

    return normalizePost(row, category);
  };

  const joinedWithViewCount =
    "id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,view_count,categories!posts_category_id_fkey(name,slug)";
  const joinedWithoutViewCount =
    "id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,categories!posts_category_id_fkey(name,slug)";
  const plainWithViewCount =
    "id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,view_count";
  const plainWithoutViewCount =
    "id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at";

  const first = await findBySlug(joinedWithViewCount);
  if (first.data) return mapWithCategory(first.data, true);

  if (isMissingViewCountError(first.error)) {
    const second = await findBySlug(joinedWithoutViewCount);
    if (second.data) return mapWithCategory(second.data, true);
  }

  if (isCategoryRelationError(first.error)) {
    const third = await findBySlug(plainWithViewCount);
    if (third.data) return mapWithCategory(third.data, false);

    if (isMissingViewCountError(third.error)) {
      const fourth = await findBySlug(plainWithoutViewCount);
      if (fourth.data) return mapWithCategory(fourth.data, false);
    }
  }

  return null;
}

export async function getPostLikesCount(postId: string): Promise<number> {
  const supabase = await createClient();
  const categoryOrder = { ascending: true as const };
  const createdOrder = { ascending: false as const };
  const { count, error } = await supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", postId);
  if (error) return 0;
  return count ?? 0;
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const categoryOrder = { ascending: true as const };
  const createdOrder = { ascending: false as const };
  const { data, error } = await supabase
    .from("comments")
    .select("id,post_id,author_name,author_email,content,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

