"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";

type Snapshot = {
  snapshot_at: string;
  total_eval_amt: number;
  profit_loss_rate: number;
};

type KospiPoint = { date: string; close: number };

type Period = "1W" | "1M" | "3M" | "1Y" | "ALL";

const PERIODS: { label: string; value: Period }[] = [
  { label: "1W",  value: "1W" },
  { label: "1M",  value: "1M" },
  { label: "3M",  value: "3M" },
  { label: "1Y",  value: "1Y" },
  { label: "ALL", value: "ALL" },
];

function filterByPeriod(data: Snapshot[], period: Period): Snapshot[] {
  if (period === "ALL" || data.length === 0) return data;
  const days = period === "1W" ? 7 : period === "1M" ? 30 : period === "3M" ? 90 : 365;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return data.filter((d) => new Date(d.snapshot_at) >= cutoff);
}

function findClosestClose(kospiData: KospiPoint[], target: Date): number | null {
  if (!kospiData.length) return null;
  let best = kospiData[0];
  let bestDiff = Math.abs(new Date(kospiData[0].date).getTime() - target.getTime());
  for (const k of kospiData) {
    const diff = Math.abs(new Date(k.date).getTime() - target.getTime());
    if (diff < bestDiff) { bestDiff = diff; best = k; }
  }
  return best.close;
}

function fmtDate(str: string, short = false) {
  return new Date(str).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    ...(short ? {} : { year: "numeric" }),
    month: "short",
    day: "numeric",
  });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isPlus = d.profit_loss_rate >= 0;
  const kospiIsPlus = (d.kospi_rate ?? 0) >= 0;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5 shadow-md text-xs space-y-1">
      <p className="text-muted-foreground">
        {new Date(label).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "short", day: "numeric" })}
      </p>
      <p className="font-bold text-foreground">₩{d.total_eval_amt.toLocaleString("ko-KR")}</p>
      <p className="font-semibold tabular-nums" style={{ color: isPlus ? "#ef4444" : "#3b82f6" }}>
        포트폴리오 {isPlus ? "+" : ""}{d.profit_loss_rate.toFixed(2)}%
      </p>
      {d.kospi_rate != null && (
        <p className="font-semibold tabular-nums" style={{ color: kospiIsPlus ? "#f97316" : "#a78bfa" }}>
          코스피 {kospiIsPlus ? "+" : ""}{(d.kospi_rate as number).toFixed(2)}%
        </p>
      )}
    </div>
  );
}

export function PortfolioChart({ data }: { data: Snapshot[] }) {
  const [period, setPeriod] = useState<Period>("ALL");
  const [kospiData, setKospiData] = useState<KospiPoint[]>([]);

  useEffect(() => {
    fetch("/api/kospi")
      .then((r) => r.json())
      .then(setKospiData)
      .catch(() => {});
  }, []);

  const filtered = data && data.length > 0 ? filterByPeriod(data, period) : [];
  const display = filtered.length > 0 ? filtered : (data ?? []);
  const latest = display[display.length - 1] ?? null;

  const animatedAmt = useCountUp(latest?.total_eval_amt ?? 0, 1200);

  if (!data || data.length === 0) return null;

  const first = display[0];
  const rate = latest.profit_loss_rate;
  const isPlus = rate >= 0;
  const rateColor = isPlus ? "#ef4444" : "#3b82f6";
  const totalAmt = animatedAmt.toLocaleString("ko-KR");

  // 코스피 기준점 (현재 표시 기간의 첫날)
  const baseClose = kospiData.length
    ? findClosestClose(kospiData, new Date(first.snapshot_at))
    : null;

  const chartData = display.map((snap) => {
    if (!baseClose) return snap;
    const curClose = findClosestClose(kospiData, new Date(snap.snapshot_at));
    const kospi_rate = curClose != null ? ((curClose - baseClose) / baseClose) * 100 : undefined;
    return { ...snap, kospi_rate };
  });

  // 두 라인 모두 포함한 Y축 범위
  const allRates = chartData.flatMap((d: any) =>
    [d.profit_loss_rate, d.kospi_rate].filter((v) => v != null)
  ) as number[];
  const pad = Math.max((Math.max(...allRates, 0) - Math.min(...allRates, 0)) * 0.15, 0.5);
  const domain: [number, number] = [Math.min(...allRates, 0) - pad, Math.max(...allRates, 0) + pad];

  const showKospi = kospiData.length > 0;

  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-5 space-y-4 shadow-soft">
      {/* 헤더 */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">모의투자 포트폴리오</p>
          <p className="text-lg font-bold tracking-tight tabular-nums md:text-2xl">₩{totalAmt}</p>
        </div>
        <p className="text-base font-bold tabular-nums shrink-0 md:text-lg" style={{ color: rateColor }}>
          {isPlus ? "+" : ""}{rate.toFixed(2)}%
        </p>
      </div>

      {/* 기간 선택 + 범례(PC) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-colors",
                period === p.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-muted"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        {showKospi && (
          <div className="hidden md:flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5 rounded-full" style={{ background: rateColor }} />
              포트폴리오
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-px border-t-2 border-dashed border-orange-400" />
              코스피
            </span>
          </div>
        )}
      </div>
      {/* 범례(모바일) — 기간 버튼 아래 */}
      {showKospi && (
        <div className="flex md:hidden items-center gap-3 -mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 rounded-full" style={{ background: rateColor }} />
            포트폴리오
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-px border-t-2 border-dashed border-orange-400" />
            코스피
          </span>
        </div>
      )}

      {/* 차트 */}
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="snapshot_at" hide />
          <YAxis hide domain={domain} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="profit_loss_rate"
            stroke={rateColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: rateColor }}
          />
          {showKospi && (
            <Line
              type="monotone"
              dataKey="kospi_rate"
              stroke="#f97316"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: "#f97316" }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* 날짜 범위 */}
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{fmtDate(first.snapshot_at)}</span>
        <span>{fmtDate(latest.snapshot_at)}</span>
      </div>
    </div>
  );
}
