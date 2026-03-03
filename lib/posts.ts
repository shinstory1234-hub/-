import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { Category, Comment, Post } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  noStore();
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
  noStore();
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

  const selectFields =
    "id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,view_count,categories!posts_category_id_fkey(name,slug)";

  const { data, error } = await supabase
    .from("posts")
    .select(selectFields)
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (error) {
    throw new Error(`getPostBySlug failed: ${error.message}`);
  }

  if (!data && decodedSlug !== slugParam) {
    const fallback = await supabase
      .from("posts")
      .select(selectFields)
      .eq("slug", slugParam)
      .maybeSingle();

    if (fallback.error) {
      throw new Error(`getPostBySlug failed: ${fallback.error.message}`);
    }

    if (!fallback.data) return null;

    return {
      ...fallback.data,
      view_count: Number((fallback.data as any).view_count ?? 0),
      category: (fallback.data as any).categories ?? null
    } as Post;
  }

  if (!data) return null;

  return {
    ...data,
    view_count: Number((data as any).view_count ?? 0),
    category: (data as any).categories ?? null
  } as Post;
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

export async function getTodayVisits(): Promise<number> {
  const supabase = await createClient();
  const categoryOrder = { ascending: true as const };
  const createdOrder = { ascending: false as const };
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.from("daily_stats").select("visits").eq("date", today).maybeSingle();
  return data?.visits ?? 0;
}


export async function getVisitStats(): Promise<{ today: number; total: number }> {
  const supabase = await createClient();
  const categoryOrder = { ascending: true as const };
  const createdOrder = { ascending: false as const };
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: todayRow }, { data: rows }] = await Promise.all([
    supabase.from("daily_stats").select("visits").eq("date", today).maybeSingle(),
    supabase.from("daily_stats").select("visits")
  ]);

  const total = (rows ?? []).reduce((sum, row: any) => sum + Number(row.visits ?? 0), 0);
  return { today: Number(todayRow?.visits ?? 0), total };
}
