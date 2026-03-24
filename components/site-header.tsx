"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { VisitCounter } from "@/components/visit-counter";

const menus = [
  { href: "/about", label: "소개" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/admin", label: "관리자" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="mx-auto w-full max-w-2xl space-y-2 pt-6 pb-4">
      {/* 1행: 블로그 제목 + 메뉴 + 다크모드 */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight text-foreground hover:text-accent transition-colors">
          머니NPC의 액티브 ETF
        </Link>
        <div className="flex items-center gap-1">
          <nav className="flex items-center">
            {menus.map((menu) => {
              const active = pathname === menu.href || pathname.startsWith(menu.href);
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {menu.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
      {/* 2행: 부제목 + 조회수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">VC심사역 출신의 투자 기록</p>
        <VisitCounter />
      </div>
    </header>
  );
}
