"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Modal({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-soft">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        <div className={cn("mt-4")}>{children}</div>
        <button type="button" onClick={onClose} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
          닫기
        </button>
      </div>
    </div>
  );
}
