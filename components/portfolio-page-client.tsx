"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Snapshot = {
  snapshot_at: string;
  total_eval_amt: number;
  stock_eval_amt: number;
  cash_amt: number;
  future_amt?: number;
  profit_loss_amt: number;
  profit_loss_rate: number;
} | null;

const STOCK_COLORS = ["#3b82f6", "#e5e7eb"];
const FUTURE_COLORS = ["#f59e0b", "#e5e7eb"];

export function PortfolioPageClient({ snapshot }: { snapshot: Snapshot }) {
  if (!snapshot) {
    return (
      <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
        포트폴리오 데이터가 없습니다.
      </div>
    );
  }

  const { total_eval_amt, stock_eval_amt, cash_amt, future_amt, profit_loss_amt, profit_loss_rate, snapshot_at } = snapshot;
  const isPlus = profit_loss_rate >= 0;
  const futureAmt = future_amt ?? 0;

  const stockPieData = [
    { name: "주식", value: stock_eval_amt },
    { name: "현금", value: cash_amt },
  ].filter((d) => d.value > 0);

  const futurePieData = [
    { name: "선물포지션", value: Math.max(0, futureAmt - cash_amt) },
    { name: "선물예탁금", value: futureAmt },
  ].filter((d) => d.value > 0);

  const updatedAt = new Date(snapshot_at).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs text-muted-foreground">총 평가금액</p>
          <p className="text-lg font-bold">₩{total_eval_amt.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs text-muted-foreground">주식 평가금액</p>
          <p className="text-lg font-bold">₩{stock_eval_amt.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs text-muted-foreground">주식 현금</p>
          <p className="text-lg font-bold">₩{cash_amt.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs text-muted-foreground">선물 예탁금</p>
          <p className="text-lg font-bold">₩{futureAmt.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs text-muted-foreground">수익률</p>
          <p className={`text-lg font-bold ${isPlus ? "text-red-500" : "text-blue-500"}`}>
            {isPlus ? "+" : ""}{profit_loss_rate.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-semibold mb-4">주식계좌 구성</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={stockPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {stockPieData.map((_, index) => (
                  <Cell key={index} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-semibold mb-4">선물계좌 구성</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={futurePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {futurePieData.map((_, index) => (
                  <Cell key={index} fill={FUTURE_COLORS[index % FUTURE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-right">마지막 업데이트: {updatedAt} (모의투자)</p>
    </div>
  );
}
