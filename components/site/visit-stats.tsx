"use client";

type Stats = { today: number; total: number };

export function VisitStats({ initialToday, initialTotal }: { initialToday: number; initialTotal: number }) {
  const stats: Stats = { today: initialToday, total: initialTotal };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <p className="text-xl font-bold md:text-2xl">VC심사역 출신의 인사이트</p>
      <p className="text-xl font-bold md:text-2xl">Today {stats.today}, Total {stats.total}</p>
    </div>
  );
}
