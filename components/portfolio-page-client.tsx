"use client";
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend,
} from "recharts";

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

type HistoryRow = {
  snapshot_at: string;
  profit_loss_rate: number;
  profit_loss_amt: number;
  total_eval_amt: number;
  future_amt?: number;
};

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

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function PortfolioPageClient({
  snapshot,
  holdings = [],
  history = [],
}: {
  snapshot: Snapshot;
  holdings?: Holding[];
  history?: HistoryRow[];
}) {
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
    future_eval_amt,
    profit_loss_rate,
    profit_loss_amt,
    snapshot_at,
  } = snapshot;

  const futureEvalAmt = future_eval_amt ?? 0;
  const futureAmt = snapshot.future_amt ?? 0;
  const stockInitial = 500000000;
  const futureInitial = 500000000;
  // 주식계좌 총액 = 전체 - 선물계좌
  const stockTotal = total_eval_amt - futureAmt;
  const stockProfitAmt = stockTotal - stockInitial;
  const stockProfitRate = (stockProfitAmt / stockInitial) * 100;
  const futureProfitRate = ((futureAmt - futureInitial) / futureInitial) * 100;
  const isPlus = profit_loss_rate >= 0;
  const isStockPlus = stockProfitRate >= 0;
  const isFuturePlus = futureProfitRate >= 0;

  // 주식 파이차트 데이터
  const stockPieData = [
    ...holdings
      .filter((h) => parseInt(h.hldg_qty) > 0)
      .map((h) => ({ name: h.prdt_name, value: parseInt(h.evlu_amt) })),
    { name: "현금", value: Math.max(0, cash_amt) },
  ].filter((d) => d.value > 0);
  const PIE_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#94a3b8"];

  // 날짜별 마지막 스냅샷만 추출 (하루 여러 번 찍혀도 EOD 기준으로)
  const dailyMap = new Map<string, HistoryRow>();
  for (const row of history) {
    const day = row.snapshot_at.slice(0, 10);
    dailyMap.set(day, row);
  }
  const dailyHistory = Array.from(dailyMap.values()).sort(
    (a, b) => a.snapshot_at.localeCompare(b.snapshot_at)
  );

  // 일별 선물 손익 (날짜별 EOD 기준)
  const barData = dailyHistory.map((row, i) => {
    const prev = dailyHistory[i - 1];
    const dailyAmt = prev ? (row.future_amt ?? 0) - (prev.future_amt ?? 0) : 0;
    return { date: fmtDate(row.snapshot_at), amt: dailyAmt };
  }).slice(1).filter((d) => d.amt !== 0); // 변동 없는 날 제외

  // 매매 통계 (선물 기준)
  const tradingDays = barData.length;
  const winDays = barData.filter((d) => d.amt > 0).length;
  const lossDays = barData.filter((d) => d.amt < 0).length;
  const winRate = tradingDays > 0 ? (winDays / tradingDays) * 100 : 0;
  const maxGain = barData.length > 0 ? Math.max(...barData.map((d) => d.amt)) : 0;
  const lossData = barData.filter((d) => d.amt < 0);
  const maxLoss = lossData.length > 0 ? Math.min(...lossData.map((d) => d.amt)) : null;

  // MDD (선물, EOD 기준)
  let peak = dailyHistory[0]?.future_amt ?? 0;
  let mdd = 0;
  for (const row of dailyHistory) {
    const val = row.future_amt ?? 0;
    if (val > peak) peak = val;
    const drawdown = peak > 0 ? (val - peak) / peak * 100 : 0;
    if (drawdown < mdd) mdd = drawdown;
  }

  const updatedAt = new Date(snapshot_at).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-6">

      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs text-muted-foreground">총 평가금액</p>
          <p className="flex items-baseline gap-0.5 text-sm font-bold md:text-lg">
            <span>₩</span><span>{fmt(total_eval_amt)}</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs text-muted-foreground">전체 수익률</p>
          <p className={`flex items-baseline gap-0.5 text-sm font-bold md:text-lg ${isPlus ? "text-red-500" : "text-blue-500"}`}>
            <span>{isPlus ? "+" : ""}{profit_loss_rate.toFixed(2)}</span><span>%</span>
          </p>
          <p className={`text-xs ${profit_loss_amt >= 0 ? "text-red-400" : "text-blue-400"}`}>
            {profit_loss_amt >= 0 ? "+" : ""}₩{fmt(profit_loss_amt)}
          </p>
        </div>
      </div>

      {/* 주식계좌 */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <p className="text-sm font-semibold border-b border-border pb-2">주식계좌</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">총평가금액</p>
            <p className="text-xs font-bold md:text-sm">₩{fmt(stockTotal)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">예수금</p>
            <p className="text-xs font-bold md:text-sm">₩{fmt(cash_amt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">주식평가</p>
            <p className="text-xs font-bold md:text-sm">₩{fmt(stock_eval_amt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">평가손익</p>
            <p className={`text-xs font-bold md:text-sm ${isStockPlus ? "text-red-500" : "text-blue-500"}`}>
              {isStockPlus ? "+" : ""}₩{fmt(Math.round(stockProfitAmt))}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">손익률</p>
            <p className={`text-xs font-bold md:text-sm ${isStockPlus ? "text-red-500" : "text-blue-500"}`}>
              {isStockPlus ? "+" : ""}{stockProfitRate.toFixed(2)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">보유종목 수</p>
            <p className="text-xs font-bold md:text-sm">
              {holdings.filter((h) => parseInt(h.hldg_qty) > 0).length}개
            </p>
          </div>
        </div>
        {stockPieData.length > 0 && (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stockPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                {stockPieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `₩${fmt(v)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 선물계좌 */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold border-b border-border pb-2 mb-3">선물계좌</p>
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">평가금액</p>
            <p className="text-sm font-bold">₩{fmt(futureEvalAmt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">총액</p>
            <p className="text-sm font-bold">₩{fmt(futureAmt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">손익률</p>
            <p className={`text-sm font-bold ${isFuturePlus ? "text-red-500" : "text-blue-500"}`}>
              {isFuturePlus ? "+" : ""}{futureProfitRate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* 매매 통계 */}
      {tradingDays > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold mb-3">매매 통계 <span className="text-xs text-muted-foreground font-normal">(선물 기준)</span></p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">승률</p>
              <p className={`text-sm font-bold ${winRate >= 50 ? "text-red-500" : "text-blue-500"}`}>
                {winRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">{winDays}승 {lossDays}패</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">MDD</p>
              <p className="text-sm font-bold text-blue-500">{mdd.toFixed(2)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">최대 수익일</p>
              <p className="text-sm font-bold text-red-500">+₩{fmt(maxGain)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">최대 손실일</p>
              <p className="text-sm font-bold text-blue-500">
                {maxLoss !== null ? `₩${fmt(maxLoss)}` : "없음"}
              </p>
            </div>
          </div>
        </div>
      )}


      {/* 보유 종목 */}
      {holdings.filter((h) => parseInt(h.hldg_qty) > 0).length > 0 ? (
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <p className="text-sm font-semibold">보유 종목</p>
          <div className="table-scroll -mx-1">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 sticky left-0 bg-surface z-10">종목명</th>
                  <th className="pb-2 text-right">수량</th>
                  <th className="pb-2 text-right">평균단가</th>
                  <th className="pb-2 text-right">현재가</th>
                  <th className="pb-2 text-right">평가금액</th>
                  <th className="pb-2 text-right">손익</th>
                  <th className="pb-2 text-right">손익률</th>
                </tr>
              </thead>
              <tbody>
                {holdings.filter((h) => parseInt(h.hldg_qty) > 0).map((h, i) => {
                  const pfls = parseInt(h.evlu_pfls_amt);
                  const isUp = pfls >= 0;
                  return (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium sticky left-0 bg-surface z-10">{h.prdt_name}</td>
                      <td className="py-3 text-right">{parseInt(h.hldg_qty).toLocaleString()}주</td>
                      <td className="py-3 text-right">₩{parseInt(h.pchs_avg_pric).toLocaleString()}</td>
                      <td className="py-3 text-right">₩{parseInt(h.prpr).toLocaleString()}</td>
                      <td className="py-3 text-right">₩{parseInt(h.evlu_amt).toLocaleString()}</td>
                      <td className={`py-3 text-right font-bold ${isUp ? "text-red-500" : "text-blue-500"}`}>
                        {isUp ? "+" : ""}{pfls.toLocaleString()}
                      </td>
                      <td className={`py-3 text-right font-bold ${isUp ? "text-red-500" : "text-blue-500"}`}>
                        {isUp ? "+" : ""}{parseFloat(h.evlu_pfls_rt).toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted-foreground">
          보유 종목 없음 (현금 100%)
        </div>
      )}

      <p className="text-xs text-muted-foreground text-right">마지막 업데이트: {updatedAt} (모의투자)</p>
      <p className="text-xs text-muted-foreground text-center">본 블로그는 투자 권유용이 아닌 정보 제공 및 작성자 개인 기록용입니다.</p>
    </div>
  );
}
