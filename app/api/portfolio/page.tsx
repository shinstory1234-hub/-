export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { PortfolioPageClient } from "@/components/portfolio-page-client";

async function getLatestSnapshot() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("portfolio_snapshots")
    .select("*")
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export default async function PortfolioPage() {
  const snapshot = await getLatestSnapshot();
  return (
    <section className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">포트폴리오</h1>
        <p className="text-sm text-muted-foreground mt-1">머니NPC 모의투자 현황</p>
      </div>
      <PortfolioPageClient snapshot={snapshot} />
    </section>
  );
}
