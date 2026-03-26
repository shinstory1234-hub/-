export const revalidate = 3600;

import { createClient } from "@supabase/supabase-js";
import { SearchClient } from "@/components/search-client";

async function getAllPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,content,tags,published_at,categories!posts_category_id_fkey(name,slug)")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  return (data ?? []).map((row: any) => ({ ...row, category: row.categories ?? null }));
}

export default async function SearchPage() {
  const posts = await getAllPosts();
  return (
    <section className="mx-auto max-w-3xl px-6 md:px-5 space-y-6 pt-4">
      <SearchClient posts={posts} />
    </section>
  );
}
