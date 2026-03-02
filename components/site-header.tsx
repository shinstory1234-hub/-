"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const menus = [
  { href: "/", label: "홈" },
  { href: "/about", label: "소개" },
  { href: "/admin", label: "관리자" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 w-full max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          머니NPC
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 rounded-full border border-border bg-surface-muted p-1">
            {menus.map((menu) => {
              const active = pathname === menu.href || (menu.href !== "/" && pathname.startsWith(menu.href));
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                    active ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
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
