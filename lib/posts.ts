import { createClient } from "@/lib/supabase-server";
import { Category, Comment, Post } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id,name,slug,description,created_at").order("name");
  if (error) return [];
  return data ?? [];
}

export async function getPosts(categorySlug?: string): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,categories!posts_category_id_fkey(name,slug)")
    .eq("is_published", true)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

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

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,categories!posts_category_id_fkey(name,slug)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    category: (data as any).categories ?? null
  } as Post;
}

export async function getPostLikesCount(postId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", postId);
  if (error) return 0;
  return count ?? 0;
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient();
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
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.from("daily_stats").select("visits").eq("date", today).maybeSingle();
  return data?.visits ?? 0;
}
