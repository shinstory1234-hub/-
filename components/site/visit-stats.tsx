"use client";

import { useEffect, useState } from "react";

type Stats = { today: number; total: number };

export function VisitStats({ initialToday, initialTotal }: { initialToday: number; initialTotal: number }) {
  const [stats, setStats] = useState<Stats>({ today: initialToday, total: initialTotal });

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/track-view", { method: "GET", cache: "no-store" });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; today?: number; total?: number } | null;
      if (res.ok && json?.ok) {
        setStats({ today: Number(json.today ?? 0), total: Number(json.total ?? 0) });
      }
    };

    run();
  }, []);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <p className="text-3xl font-bold md:text-4xl">머니NPC</p>
        <p className="text-3xl font-bold md:text-4xl">VC심사역 출신의 인사이트</p>
      </div>
      <p className="text-3xl font-bold md:text-4xl">Today {stats.today}, Total {stats.total}</p>
    </div>
  );
}
