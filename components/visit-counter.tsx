"use client";
import { useEffect, useState } from "react";

export function VisitCounter() {
  const [today, setToday] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/track-visit", { method: "POST", cache: "no-store" });
        const json = await res.json();
        if (json.ok) {
          setToday(json.today);
          setTotal(json.total);
        }
      } catch (e) {
        console.error("visit counter error", e);
      }
    };
    run();
  }, []);

  if (today === null || total === null) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Today</p>
        <p className="text-sm font-bold tabular-nums leading-tight">{today.toLocaleString("ko-KR")}</p>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="text-right">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Total</p>
        <p className="text-sm font-bold tabular-nums leading-tight">{total.toLocaleString("ko-KR")}</p>
      </div>
    </div>
  );
}
