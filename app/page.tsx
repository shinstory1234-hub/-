export const revalidate = 60;
import { getCategories, getPostsWithError } from "@/lib/posts";
import { HomeClient } from "@/components/home-client";
import { PortfolioChart } from "@/components/portfolio-chart";

export default async function HomePage() {
  const [{ posts }, categories] = await Promise.all([
    getPostsWithError(undefined),
    getCategories(),
  ]);
  return (
    <section className="mx-auto max-w-2xl space-y-10">
      <PortfolioChart />
      <HomeClient posts={posts} categories={categories} />
    </section>
  );
}
