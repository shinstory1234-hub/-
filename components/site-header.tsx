"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menus = [
  { href: "/", label: "홈" },
  { href: "/about", label: "소개" },
  { href: "/topics/all", label: "카테고리" },
  { href: "/admin", label: "관리자" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
          머니NPC
        </Link>
        <nav className="flex items-center gap-1 rounded-full bg-zinc-100 p-1">
          {menus.map((menu) => {
            const active = pathname === menu.href || (menu.href !== "/" && pathname.startsWith(menu.href));
            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition",
                  active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {menu.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
