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

export async function getPosts(categorySlug?: string): Promise<Post[]> {
  noStore();
  const supabase = await createClient();
  const categoryOrder = { ascending: true as const };
  const createdOrder = { ascending: false as const };
  let query = supabase
    .from("posts")
    .select("id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,view_count,categories!posts_category_id_fkey(name,slug)")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
    if (cat?.id) query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error) return [];

  return (data ?? []).map((row: any) => ({
    ...row,
    category: row.categories ?? null
  }));
}

export async function getPostBySlug(slugParam: string): Promise<Post | null> {
  const supabase = await createClient();
  const categoryOrder = { ascending: true as const };
  const createdOrder = { ascending: false as const };
  let decodedSlug = slugParam;

  try {
    decodedSlug = decodeURIComponent(slugParam);
  } catch {
    decodedSlug = slugParam;
  }

  const query = () =>
    supabase
      .from("posts")
      .select("id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,view_count,categories!posts_category_id_fkey(name,slug)")
      .eq("is_published", true);

  let { data, error } = await query().eq("slug", decodedSlug).maybeSingle();

  if ((!data || error) && decodedSlug !== slugParam) {
    const fallback = await query().eq("slug", slugParam).maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) return null;
  return {
    ...data,
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
