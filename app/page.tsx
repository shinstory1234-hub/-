export const revalidate = 3600;

import { createClient } from "@supabase/supabase-js";
import { HomeHeader } from "@/components/home-header";
import { HomeClient } from "@/components/home-client";
import { PortfolioChart } from "@/components/portfolio-chart";
import { FadeIn } from "@/components/fade-in";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getPosts() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,cover_url,content,tags,published_at,post_categories(categories(id,name,slug))")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map((row: any) => ({
    ...row,
    categories: (row.post_categories ?? []).map((pc: any) => pc.categories).filter(Boolean),
  }));
}

async function getCategories() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

async function getPortfolioData() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("portfolio_snapshots")
    .select("snapshot_at,total_eval_amt,profit_loss_rate")
    .order("snapshot_at", { ascending: true })
    .limit(168);
  return data ?? [];
}

export default async function HomePage() {
  const [posts, categories, portfolioData] = await Promise.all([
    getPosts(),
    getCategories(),
    getPortfolioData(),
  ]);
  return (
    <div className="mx-auto w-full max-w-2xl px-4">
      <HomeHeader />
      <div className="space-y-5 mt-5">
        <FadeIn delay={50}>
          <PortfolioChart data={portfolioData} />
        </FadeIn>
        <FadeIn delay={150}>
          <HomeClient posts={posts} categories={categories} />
        </FadeIn>
      </div>
    </div>
  );
}
