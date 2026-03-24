export const revalidate = 60;
import Link from "next/link";
import { getCategories, getPostsWithError } from "@/lib/posts";
import { VisitCounter } from "@/components/visit-counter";
import { HomeClient } from "@/components/home-client";
import { PortfolioChart } from "@/components/portfolio-chart";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_MENUS = [
  { href: "/about", label: "소개" },
  { href: "/portfolio", label: "포트폴리오" },
];

export default async function HomePage() {
  const [{ posts }, categories] = await Promise.all([
    getPostsWithError(undefined),
    getCategories(),
  ]);
  return (
    <section className="mx-auto max-w-2xl space-y-10">
      {/* 홈 전용 헤더 */}
      <header className="space-y-2 pt-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight text-foreground hover:text-accent transition-colors">
            머니NPC의 액티브 ETF
          </Link>
          <div className="flex items-center gap-1">
            <nav className="flex items-center">
              {NAV_MENUS.map((menu) => (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
                >
                  {menu.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
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
