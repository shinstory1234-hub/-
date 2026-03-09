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
      });
  }, []);
  if (loading) return (
    <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
      포트폴리오 로딩 중...
    </div>
  );
  if (data.length === 0) return null;
  const latest = data[data.length - 1];
  const totalAmt = latest.total_eval_amt.toLocaleString("ko-KR");
  const rate = latest.profit_loss_rate;
  const isPlus = rate >= 0;
  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">내 포트폴리오 (모의투자)</p>
          <p className="text-2xl font-bold tracking-tight">₩{totalAmt}</p>
        </div>
        <div className={`text-lg font-bold ${isPlus ? "text-red-500" : "text-blue-500"}`}>
          {isPlus ? "+" : ""}{rate.toFixed(2)}%
        </div>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <XAxis dataKey="snapshot_at" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, "수익률"]}
            labelFormatter={(label) => new Date(label).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
            contentStyle={{ fontSize: "12px" }}
          />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth={1.5} />
          <Line
            type="monotone"
            dataKey="profit_loss_rate"
            stroke={isPlus ? "#ef4444" : "#3b82f6"}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
