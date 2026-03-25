export const revalidate = 3600; // 1시간 캐시 (포트폴리오 데이터는 하루 1회 갱신)

import { createClient } from "@supabase/supabase-js";
import { getCategories, getPostsWithError } from "@/lib/posts";
import { HomeHeader } from "@/components/home-header";
import { HomeClient } from "@/components/home-client";
import { PortfolioChart } from "@/components/portfolio-chart";

async function getPortfolioData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("portfolio_snapshots")
    .select("snapshot_at, total_eval_amt, profit_loss_rate")
    .order("snapshot_at", { ascending: true })
    .limit(168);
  return data ?? [];
}

export default async function HomePage() {
  const [{ posts }, categories, portfolioData] = await Promise.all([
    getPostsWithError(undefined),
    getCategories(),
    getPortfolioData(),
  ]);
  return (
    <section className="mx-auto max-w-2xl space-y-10">
      <HomeHeader />
      <PortfolioChart data={portfolioData} />
      <HomeClient posts={posts} categories={categories} />
    </section>
  );
}
