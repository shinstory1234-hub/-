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
    <section className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">머니NPC의 액티브 ETF</h1>
        <VisitCounter />
      </header>
      <PortfolioChart />
      <HomeClient posts={posts} categories={categories} />
    </section>
  );
}
