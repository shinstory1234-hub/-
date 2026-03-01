"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ToastItem = { id: number; title: string; variant?: "default" | "error" };

const ToastContext = createContext<{ show: (title: string, variant?: "default" | "error") => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const value = useMemo(
    () => ({
      show: (title: string, variant: "default" | "error" = "default") => {
        const id = Date.now();
        setItems((prev) => [...prev, { id, title, variant }]);
        setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), 2400);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-md border px-4 py-3 text-sm shadow-soft",
              item.variant === "error" ? "border-danger/20 bg-danger/10 text-danger" : "border-border bg-surface text-foreground"
            )}
          >
            {item.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
