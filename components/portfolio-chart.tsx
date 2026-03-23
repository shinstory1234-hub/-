"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type Snapshot = {
  snapshot_at: string;
  total_eval_amt: number;
  profit_loss_rate: number;
};

export function PortfolioChart() {
  const [data, setData] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio/chart")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
      불러오는 중...
    </div>
  );
  if (data.length === 0) return null;

  const latest = data[data.length - 1];
  const totalAmt = latest.total_eval_amt.toLocaleString("ko-KR");
  const rate = latest.profit_loss_rate;
  const isPlus = rate >= 0;
  const rateColor = isPlus ? "#ef4444" : "#3b82f6";

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">모의투자 포트폴리오</p>
          <p className="text-2xl font-bold tracking-tight">₩{totalAmt}</p>
        </div>
        <p className="text-lg font-bold mb-0.5" style={{ color: rateColor }}>
          {isPlus ? "+" : ""}{rate.toFixed(2)}%
        </p>
      </div>
      <ResponsiveContainer width="100%" height={88}>
        <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="snapshot_at" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, "수익률"]}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "short", day: "numeric" })
            }
            contentStyle={{
              fontSize: "12px",
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--surface))",
              color: "hsl(var(--foreground))",
            }}
          />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="profit_loss_rate"
            stroke={rateColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
