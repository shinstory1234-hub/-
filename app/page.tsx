export const revalidate = 60;
import { getCategories, getPostsWithError } from "@/lib/posts";
import { VisitCounter } from "@/components/visit-counter";
import { HomeClient } from "@/components/home-client";
import { PortfolioChart } from "@/components/portfolio-chart";

export default async function HomePage() {
  const [{ posts }, categories] = await Promise.all([
    getPostsWithError(undefined),
    getCategories(),
  ]);
  return (
    <section className="mx-auto max-w-2xl space-y-10">
      <header className="space-y-1 pt-4">
        <h1 className="text-3xl font-bold tracking-tight">머니NPC의 액티브 ETF</h1>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">VC심사역 출신의 투자 기록</p>
          <VisitCounter />
        </div>
      </header>
      <PortfolioChart />
      <HomeClient posts={posts} categories={categories} />
    </section>
  );
}
