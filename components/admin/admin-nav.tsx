"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menus = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/posts", label: "글 목록" },
  { href: "/admin/posts/new", label: "글쓰기" },
  { href: "/admin/categories", label: "카테고리" }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-lg border border-border bg-surface p-3 shadow-soft">
      <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">ADMIN MENU</p>
      <nav className="mt-2 space-y-1">
        {menus.map((menu) => {
          const active = pathname === menu.href || (menu.href !== "/admin" && pathname.startsWith(menu.href));
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition",
                active ? "bg-surface-muted text-foreground" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              )}
            >
              {menu.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
