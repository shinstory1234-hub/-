"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const menus = [
  { href: "/",          label: "홈" },
  { href: "/about",     label: "소개" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/admin",     label: "관리자" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/") return null;

  const isPost = pathname.startsWith("/posts/") || pathname.startsWith("/topics/");
  const innerClass = isPost ? "mx-auto max-w-3xl" : "w-full";

  return (
    <header className="w-full pt-5 pb-4">
      <div className={cn("flex items-center justify-between", innerClass)}>
        <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="머니NPC" width={28} height={28} className="object-contain" priority />
          <span className="text-sm font-bold tracking-tight text-foreground md:text-base">
            머니NPC의 액티브 ETF
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <nav className="hidden md:flex items-center">
            {menus.map((menu) => {
              const active = pathname === menu.href || (menu.href !== "/" && pathname.startsWith(menu.href));
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
                    active
                      ? "text-foreground bg-surface-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-muted"
                  )}
                >
                  {menu.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
          <button
            type="button"
            aria-label="메뉴"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-surface-muted transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {mobileOpen && (
        <div className={cn("md:hidden mt-2 flex flex-col rounded-lg border border-border bg-surface shadow-md overflow-hidden", innerClass)}>
          {menus.map((menu) => {
            const active = pathname === menu.href || (menu.href !== "/" && pathname.startsWith(menu.href));
            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors border-b border-border last:border-0",
                  active ? "text-foreground bg-surface-muted" : "text-muted-foreground hover:bg-surface-muted"
                )}
              >
                {menu.label}
              </Link>
            );
          })}
        </div>
      )}
      <div className="mt-4 h-px bg-border" />
    </header>
  );
}
