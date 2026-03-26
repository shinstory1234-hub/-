"use client";
"use client";
import Link from "next/link";
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

  if (pathname === "/") return null;

  const isPost = pathname.startsWith("/posts/") || pathname.startsWith("/topics/");
  const innerClass = isPost ? "mx-auto max-w-3xl xl:max-w-5xl" : "w-full";

  return (
    <header className="w-full pt-5 pb-4">
      <div className={cn("flex items-center justify-between", innerClass)}>
        <Link href="/" className="flex items-center">
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
          <Link
            href="/search"
            aria-label="검색"
            className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-surface-muted transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <div className="mt-4 h-px bg-border" />
    </header>
  );
}
