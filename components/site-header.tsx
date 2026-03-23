"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const menus = [
  { href: "/", label: "홈" },
  { href: "/about", label: "소개" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/admin", label: "관리자" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="text-base font-bold tracking-tight text-foreground">
          머니NPC
        </Link>
        <div className="flex items-center gap-3">
          <nav className="flex items-center">
            {menus.map((menu) => {
              const active = pathname === menu.href || (menu.href !== "/" && pathname.startsWith(menu.href));
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
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
