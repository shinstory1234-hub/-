"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Snapshot = {
  snapshot_at: string;
  total_eval_amt: number;
  stock_eval_amt: number;
  cash_amt: number;
  future_amt?: number;
  future_eval_amt?: number;
  profit_loss_amt: number;
  profit_loss_rate: number;
} | null;

const STOCK_COLORS = ["#3b82f6", "#e5e7eb"];
const FUTURE_COLORS = ["#f59e0b", "#f97316", "#e5e7eb"];

type Holding = {
  pdno: string;
  prdt_name: string;
  hldg_qty: string;
  pchs_avg_pric: string;
  prpr: string;
  evlu_pfls_amt: string;
  evlu_pfls_rt: string;
  evlu_amt: string;
};

export function PortfolioPageClient({ snapshot, holdings = [] }: { snapshot: Snapshot; holdings?: Holding[] }) {
  if (!snapshot) {
    return (
      <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
        포트폴리오 데이터가 없습니다.
      </div>
    );
  }

  const {
    total_eval_amt,
    stock_eval_amt,
    cash_amt,
    future_amt,
    future_eval_amt,
    profit_loss_amt,
    profit_loss_rate,
    snapshot_at,
  } = snapshot;

  const isPlus = profit_loss_rate >= 0;
  const futureAmt = future_amt ?? 0;
  const futureEvalAmt = future_eval_amt ?? 0;

  const stockPieData = [
    { name: "주식", value: stock_eval_amt },
    { name: "현금", value: cash_amt },
  ].filter((d) => d.value > 0);

  const futurePositionAmt = futureEvalAmt;
  const futureCashAmt = Math.max(0, futureAmt - futurePositionAmt);
  const futurePieData = [
    { name: "선물포지션", value: futurePositionAmt },
    { name: "선물예탁금", value: futureCashAmt > 0 ? futureCashAmt : futureAmt },
  ].filter((d) => d.value > 0);

  const updatedAt = new Date(snapshot_at).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
          <p className="text-xs text-muted-foreground">선물 평가금액</p>
          <p className="text-lg font-bold">₩{futureEvalAmt.toLocaleString()}</p>
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

      {holdings.filter((h) => parseInt(h.hldg_qty) > 0).length > 0 ? (
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <p className="text-sm font-semibold">보유 종목</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2">종목명</th>
                <th className="pb-2 text-right">수량</th>
                <th className="pb-2 text-right">평균단가</th>
                <th className="pb-2 text-right">현재가</th>
                <th className="pb-2 text-right">평가금액</th>
                <th className="pb-2 text-right">손익</th>
              </tr>
            </thead>
            <tbody>
              {holdings.filter((h) => parseInt(h.hldg_qty) > 0).map((h, i) => {
                const pfls = parseInt(h.evlu_pfls_amt);
                const isUp = pfls >= 0;
                return (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium">{h.prdt_name}</td>
                    <td className="py-3 text-right">{parseInt(h.hldg_qty).toLocaleString()}주</td>
                    <td className="py-3 text-right">₩{parseInt(h.pchs_avg_pric).toLocaleString()}</td>
                    <td className="py-3 text-right">₩{parseInt(h.prpr).toLocaleString()}</td>
                    <td className="py-3 text-right">₩{parseInt(h.evlu_amt).toLocaleString()}</td>
                    <td className={`py-3 text-right font-bold ${isUp ? "text-red-500" : "text-blue-500"}`}>
                      {isUp ? "+" : ""}{pfls.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted-foreground">
          보유 종목 없음 (현금 100%)
        </div>
      )}

      <p className="text-xs text-muted-foreground text-right">마지막 업데이트: {updatedAt} (모의투자)</p>
    </div>
  );
}
