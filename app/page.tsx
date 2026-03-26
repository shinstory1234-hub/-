export const revalidate = 3600;

import { createClient } from "@supabase/supabase-js";
import { HomeHeader } from "@/components/home-header";
import { HomeClient } from "@/components/home-client";
import { PortfolioChart } from "@/components/portfolio-chart";
import { FadeIn } from "@/components/fade-in";
import { VisitCounter } from "@/components/visit-counter";

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
    .select("id,title,slug,excerpt,cover_url,content,tags,published_at,categories!posts_category_id_fkey(name,slug)")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map((row: any) => ({ ...row, category: row.categories ?? null }));
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
    <section className="mx-auto max-w-3xl space-y-10">
      <HomeHeader />
      <div className="flex items-center justify-between -mt-6">
        <p className="text-sm text-muted-foreground">VC심사역 출신의 투자 기록</p>
        <VisitCounter />
      </div>
      <FadeIn delay={50}>
        <PortfolioChart data={portfolioData} />
      </FadeIn>
      <FadeIn delay={150}>
        <HomeClient posts={posts} categories={categories} />
      </FadeIn>
    </section>
  );
}
