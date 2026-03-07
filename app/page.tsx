export const dynamic = "force-dynamic";
import { getCategories, getPostsWithError } from "@/lib/posts";
import { PostSlugLink } from "@/components/post-slug-link";
import { VisitCounter } from "@/components/visit-counter";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { HomeClient } from "@/components/home-client";

const COOLDOWN_MS = 3 * 60 * 1000;

async function trackAndGetStats(ip: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const { data: recentVisit } = await supabase
    .from("visit_logs").select("id").eq("ip", ip).gte("visited_at", since).maybeSingle();
  const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }).replace(/\. /g, "-").replace(".", "");
  if (!recentVisit) {
    await supabase.from("visit_logs").insert({ ip });
    const { data, error } = await supabase.from("daily_stats").select("visits").eq("day", today).single();
    if (error || !data) {
      await supabase.from("daily_stats").insert({ day: today, date: today, visits: 1 });
    } else {
      await supabase.from("daily_stats").update({ visits: data.visits + 1 }).eq("day", today);
    }
  }
  const { data: allStats } = await supabase.from("daily_stats").select("visits");
  const total = allStats?.reduce((sum, row) => sum + (row.visits ?? 0), 0) ?? 0;
  const { data: todayStats } = await supabase.from("daily_stats").select("visits").eq("day", today).single();
  return { today: todayStats?.visits ?? 0, total };
}

export default async function HomePage() {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const [{ posts }, categories, stats] = await Promise.all([
    getPostsWithError(undefined),
    getCategories(),
    trackAndGetStats(ip),
  ]);

  return (
    <section className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">VC심사역 출신의 인사이트</h1>
        <VisitCounter today={stats.today} total={stats.total} />
      </header>
      <HomeClient posts={posts} categories={categories} />
    </section>
  );
}
