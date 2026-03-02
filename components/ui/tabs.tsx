"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type TabItem = { label: string; href: string; active?: boolean };

export function Tabs({ items, className }: { items: TabItem[]; className?: string }) {
  return (
    <div className={cn("inline-flex rounded-full border border-border bg-surface-muted p-1", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            item.active ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
