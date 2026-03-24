"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const menus = [
  { href: "/about", label: "소개" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/admin", label: "관리자" },
];

export function SiteHeader() {
  const pathname = usePathname();

  // 홈: page.tsx에서 자체 헤더 처리
  if (pathname === "/") return null;

  return (
    <header className="w-full pt-6 pb-4">
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
    </header>
  );
}
