"use client";
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

  if (pathname === "/") return null;

  const isPost = pathname.startsWith("/posts/") || pathname.startsWith("/topics/");
  const innerClass = isPost ? "mx-auto max-w-3xl" : "w-full";

  return (
    <header className="w-full pt-5 pb-4">
      <div className={cn("flex items-center justify-between", innerClass)}>
        <Link href="/" className="flex items-center gap-2.5">
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
        </div>
      </div>
      <div className="mt-4 h-px bg-border" />
    </header>
  );
}
