"use client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type TabItem = { label: string; href: string; active?: boolean };

export function Tabs({ items, className }: { items: TabItem[]; className?: string }) {
  const router = useRouter();
  return (
    <div className={cn("inline-flex rounded-full border border-border bg-surface-muted p-1", className)}>
      {items.map((item) => (
        <button
          key={item.href}
          type="button"
          onClick={() => router.push(item.href)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            item.active ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
