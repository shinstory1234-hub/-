"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type Snapshot = {
  snapshot_at: string;
  total_eval_amt: number;
  profit_loss_rate: number;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Snapshot;
  const isPlus = d.profit_loss_rate >= 0;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5 shadow-md text-xs space-y-1">
      <p className="text-muted-foreground">
        {new Date(label).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "short", day: "numeric" })}
      </p>
      <p className="font-bold text-foreground">₩{d.total_eval_amt.toLocaleString("ko-KR")}</p>
      <p className="font-semibold tabular-nums" style={{ color: isPlus ? "#ef4444" : "#3b82f6" }}>
        {isPlus ? "+" : ""}{d.profit_loss_rate.toFixed(2)}%
      </p>
    </div>
  );
}

export function PortfolioChart({ data }: { data: Snapshot[] }) {
  if (!data || data.length === 0) return null;

  const latest = data[data.length - 1];
  const totalAmt = latest.total_eval_amt.toLocaleString("ko-KR");
  const rate = latest.profit_loss_rate;
  const isPlus = rate >= 0;
  const rateColor = isPlus ? "#ef4444" : "#3b82f6";

  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-5 space-y-4 shadow-soft">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">모의투자 포트폴리오</p>
          <p className="text-lg font-bold tracking-tight tabular-nums md:text-2xl">₩{totalAmt}</p>
        </div>
        <p className="text-sm font-bold tabular-nums shrink-0 md:text-lg" style={{ color: rateColor }}>
          {isPlus ? "+" : ""}{rate.toFixed(2)}%
        </p>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="snapshot_at" hide />
          <YAxis hide domain={["auto", "auto"]} />
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
