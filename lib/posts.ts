import { createClient } from "@/lib/supabase-server";
import { Category, Post } from "@/lib/types";

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
    .select("id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,categories(id,name,slug,description)")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
    if (cat?.id) query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error) return [];

  return (data ?? []).map((row: any) => ({
    ...row,
    category: Array.isArray(row.categories) ? row.categories[0] ?? null : row.categories ?? null
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,content,cover_url,category_id,tags,is_published,published_at,created_at,updated_at,categories(id,name,slug,description)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    category: Array.isArray((data as any).categories) ? (data as any).categories[0] ?? null : (data as any).categories ?? null
  } as Post;
}
