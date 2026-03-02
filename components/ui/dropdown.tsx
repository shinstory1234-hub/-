"use client";

import { type ButtonHTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Dropdown({
  trigger,
  children,
  align = "right"
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)}>
        {trigger}
      </button>
      {open ? (
        <div className={cn("absolute top-[calc(100%+8px)] z-50 min-w-40 rounded-md border border-border bg-surface p-2 shadow-soft", align === "right" ? "right-0" : "left-0")}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-muted", className)} {...props} />;
}
