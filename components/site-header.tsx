"use client";
import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/") return null;

  const isPost = pathname.startsWith("/posts/") || pathname.startsWith("/topics/");
  const innerClass = isPost ? "mx-auto max-w-3xl" : "w-full";

  return (
    <header className="w-full pt-6 pb-4">
      {/* 1행: 로고 + 메뉴 */}
      <div className={cn("flex items-center justify-between", innerClass)}>
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground hover:text-accent transition-colors md:text-2xl whitespace-nowrap"
        >
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="flex-shrink-0 md:w-7 md:h-7" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#3b82f6"/>
            <path d="M5 23L11 15L16 19.5L27 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 9H27V14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          머니NPC의 액티브 ETF
        </Link>
        <div className="flex items-center gap-1">
          {/* 데스크탑 메뉴 */}
          <nav className="hidden md:flex items-center">
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
          {/* 모바일 햄버거 버튼 */}
          <button
            type="button"
            aria-label="메뉴"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* 모바일 드롭다운 */}
      {mobileOpen && (
        <div className={cn("md:hidden flex flex-col gap-0.5 border-t border-border mt-2 pt-2 pb-1", innerClass)}>
          {menus.map((menu) => {
            const active = pathname === menu.href || pathname.startsWith(menu.href);
            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "py-2.5 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {menu.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
