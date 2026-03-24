"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { VisitCounter } from "@/components/visit-counter";

const menus = [
  { href: "/about", label: "소개" },
  { href: "/portfolio", label: "포트폴리오" },
];

export function SiteHeader() {
  const pathname = usePathname();

  // 관리자 페이지: 헤더 없음
  if (pathname.startsWith("/admin")) return null;

  // 홈: 그대로 (page.tsx에서 자체 처리하므로 layout 헤더 숨김)
  if (pathname === "/") return null;

  // 소개·포트폴리오·글 상세 등: VisitCounter 없는 심플 헤더, 본문과 동일한 max-w-6xl
  return (
    <header className="mx-auto w-full max-w-6xl space-y-1 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-foreground hover:text-accent transition-colors"
        >
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
      <p className="text-sm text-muted-foreground">VC심사역 출신의 투자 기록</p>
    </header>
  );
}
