"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
  PieChart, Pie, Cell,
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

function fmt(n: number) { return n.toLocaleString("ko-KR"); }
function fmtDate(s: string) {
  const d = new Date(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const PIE_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#94a3b8"];

export function PortfolioPageClient({
  snapshot,
  holdings = [],
  history = [],
  kospiHistory = [],
}: {
  snapshot: Snapshot;
  holdings?: Holding[];
  history?: HistoryRow[];
  kospiHistory?: { date: string; rate: number }[];
}) {
  if (!snapshot) {
    return (
      <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
        포트폴리오 데이터가 없습니다.
      </div>
    );
  }

  const {
    total_eval_amt, stock_eval_amt, cash_amt,
    future_eval_amt, profit_loss_rate, profit_loss_amt, snapshot_at,
  } = snapshot;

  const futureAmt = snapshot.future_amt ?? 0;
  const futureEvalAmt = future_eval_amt ?? 0;
  const stockInitial = 500_000_000;
  const futureInitial = 500_000_000;
  const stockTotal = total_eval_amt - futureAmt;
  const stockProfitAmt = stockTotal - stockInitial;
  const stockProfitRate = (stockProfitAmt / stockInitial) * 100;
  const futureProfitRate = ((futureAmt - futureInitial) / futureInitial) * 100;
  const isPlus = profit_loss_rate >= 0;
  const isStockPlus = stockProfitRate >= 0;
  const isFuturePlus = futureProfitRate >= 0;

  // ── 날짜별 마지막 스냅샷
  const dailyMap = new Map<string, HistoryRow>();
  for (const row of history) dailyMap.set(row.snapshot_at.slice(0, 10), row);
  const dailyHistory = Array.from(dailyMap.values()).sort((a, b) =>
    a.snapshot_at.localeCompare(b.snapshot_at)
  );

  // ── 선물 일별 손익 (승패 통계용)
  const futureDailyPnl = dailyHistory.map((row, i) => {
    const prev = dailyHistory[i - 1];
    return prev ? (row.future_amt ?? 0) - (prev.future_amt ?? 0) : 0;
  }).slice(1).filter((v) => v !== 0);

  const winDays = futureDailyPnl.filter((v) => v > 0).length;
  const lossDays = futureDailyPnl.filter((v) => v < 0).length;
  const maxGain = futureDailyPnl.length > 0 ? Math.max(...futureDailyPnl) : 0;
  const lossOnly = futureDailyPnl.filter((v) => v < 0);
  const maxLoss = lossOnly.length > 0 ? Math.min(...lossOnly) : null;

  // ── MDD (선물 EOD 기준)
  let peak = dailyHistory[0]?.future_amt ?? 0;
  let mdd = 0;
  for (const row of dailyHistory) {
    const val = row.future_amt ?? 0;
    if (val > peak) peak = val;
    const dd = peak > 0 ? (val - peak) / peak * 100 : 0;
    if (dd < mdd) mdd = dd;
  }

  // ── 최근 매매일
  const lastTradedDay = (() => {
    for (let i = dailyHistory.length - 1; i >= 1; i--) {
      const diff = (dailyHistory[i].future_amt ?? 0) - (dailyHistory[i - 1].future_amt ?? 0);
      if (diff !== 0) return fmtDate(dailyHistory[i].snapshot_at);
    }
    return "-";
  })();

  // ── 현재 선물 포지션
  const currentPosition = futureEvalAmt > 0 ? `₩${fmt(futureEvalAmt)}` : "청산완료";

  // ── 선물 누적 손익
  const futureCumPnl = futureAmt - futureInitial;

  // ── KOSPI 비교 차트 데이터
  const kospiMap = new Map(kospiHistory.map((k) => [k.date, k.rate]));
  const baseTotal = dailyHistory[0]?.total_eval_amt ?? total_eval_amt;
  const compData = dailyHistory
    .map((row) => {
      const date = row.snapshot_at.slice(0, 10);
      const portfolioRate = parseFloat(
        (((row.total_eval_amt - baseTotal) / baseTotal) * 100).toFixed(2)
      );
      const kospi = kospiMap.get(date) ??
        [...kospiMap.entries()].filter(([d]) => d <= date).at(-1)?.[1] ?? null;
      return { date: fmtDate(row.snapshot_at), portfolio: portfolioRate, kospi };
    })
    .filter((d) => d.kospi !== null);
  const showComparison = compData.length >= 3;

  // ── 주식 파이차트 데이터
  const activeHoldings = holdings.filter((h) => parseInt(h.hldg_qty) > 0);
  const stockPieData = [
    ...activeHoldings.map((h) => ({ name: h.prdt_name, value: parseInt(h.evlu_amt) })),
    { name: "현금", value: Math.max(0, cash_amt) },
  ].filter((d) => d.value > 0);
  const showPie = activeHoldings.length > 0; // 보유종목 있을 때만

  const updatedAt = new Date(snapshot_at).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-5">

      {/* ── 전체 요약 (작은 2칸) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs text-muted-foreground">총 평가금액</p>
          <p className="text-sm font-bold md:text-base">₩{fmt(total_eval_amt)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs text-muted-foreground">전체 수익률</p>
          <p className={`text-sm font-bold md:text-base ${isPlus ? "text-red-500" : "text-blue-500"}`}>
            {isPlus ? "+" : ""}{profit_loss_rate.toFixed(2)}%
          </p>
          <p className={`text-xs ${profit_loss_amt >= 0 ? "text-red-400" : "text-blue-400"}`}>
            {profit_loss_amt >= 0 ? "+" : ""}₩{fmt(profit_loss_amt)}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════
          주식계좌 (화면의 70%)
      ══════════════════════════════════ */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-5">
        <p className="font-semibold border-b border-border pb-2">주식계좌</p>

        {/* 스탯 6개 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">총 평가금액</p>
            <p className="text-sm font-bold">₩{fmt(stockTotal)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">예수금</p>
            <p className="text-sm font-bold">₩{fmt(cash_amt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">주식평가</p>
            <p className="text-sm font-bold">₩{fmt(stock_eval_amt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">평가손익</p>
            <p className={`text-sm font-bold ${isStockPlus ? "text-red-500" : "text-blue-500"}`}>
              {isStockPlus ? "+" : ""}₩{fmt(Math.round(stockProfitAmt))}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">손익률</p>
            <p className={`text-sm font-bold ${isStockPlus ? "text-red-500" : "text-blue-500"}`}>
              {isStockPlus ? "+" : ""}{stockProfitRate.toFixed(2)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">보유종목</p>
            <p className="text-sm font-bold">{activeHoldings.length}개</p>
          </div>
        </div>

        {/* KOSPI 비교 차트 (PC만) */}
        {showComparison && (
          <div className="hidden md:block">
            <p className="text-xs font-medium text-muted-foreground mb-3">포트폴리오 vs KOSPI</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={compData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={46} />
                <Tooltip formatter={(v: number, name: string) => [`${v}%`, name === "portfolio" ? "포트폴리오" : "KOSPI"]} />
                <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="3 3" />
                <Legend formatter={(v) => v === "portfolio" ? "포트폴리오" : "KOSPI"} iconType="line" />
                <Line type="monotone" dataKey="portfolio" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                <Line type="monotone" dataKey="kospi" stroke="#94a3b8" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 파이차트 (보유종목 있을 때만) */}
        {showPie && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">계좌 구성</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stockPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {stockPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `₩${fmt(v)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>

      {/* ── 보유종목 테이블 */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-sm font-semibold mb-3">보유종목</p>
        {activeHoldings.length > 0 ? (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2">종목명</th>
                  <th className="pb-2 text-right">수량</th>
                  <th className="pb-2 text-right">평균단가</th>
                  <th className="pb-2 text-right">현재가</th>
                  <th className="pb-2 text-right">평가금액</th>
                  <th className="pb-2 text-right">손익</th>
                  <th className="pb-2 text-right">손익률</th>
                </tr>
              </thead>
              <tbody>
                {activeHoldings.map((h, i) => {
                  const pfls = parseInt(h.evlu_pfls_amt);
                  const isUp = pfls >= 0;
                  return (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 font-medium">{h.prdt_name}</td>
                      <td className="py-2.5 text-right">{parseInt(h.hldg_qty).toLocaleString()}주</td>
                      <td className="py-2.5 text-right">₩{parseInt(h.pchs_avg_pric).toLocaleString()}</td>
                      <td className="py-2.5 text-right">₩{parseInt(h.prpr).toLocaleString()}</td>
                      <td className="py-2.5 text-right">₩{parseInt(h.evlu_amt).toLocaleString()}</td>
                      <td className={`py-2.5 text-right font-bold ${isUp ? "text-red-500" : "text-blue-500"}`}>
                        {isUp ? "+" : ""}{pfls.toLocaleString()}
                      </td>
                      <td className={`py-2.5 text-right font-bold ${isUp ? "text-red-500" : "text-blue-500"}`}>
                        {isUp ? "+" : ""}{parseFloat(h.evlu_pfls_rt).toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">보유종목 없음 (현금 100%)</p>
        )}
      </div>

      {/* ══════════════════════════════════
          선물계좌 (하단 한 줄 요약)
      ══════════════════════════════════ */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold mb-3">선물계좌</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">누적 손익</p>
            <p className={`text-sm font-bold ${futureCumPnl >= 0 ? "text-red-500" : "text-blue-500"}`}>
              {futureCumPnl >= 0 ? "+" : ""}₩{fmt(futureCumPnl)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">최근 매매일</p>
            <p className="text-sm font-bold">{lastTradedDay}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">현재 포지션</p>
            <p className="text-sm font-bold">{currentPosition}</p>
          </div>
        </div>
      </div>

      {/* ── 매매 통계 (선물) */}
      {futureDailyPnl.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold mb-3">
            매매 통계 <span className="text-xs text-muted-foreground font-normal">(선물 기준)</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">승패</p>
              <p className={`text-sm font-bold ${winDays >= lossDays ? "text-red-500" : "text-blue-500"}`}>
                {winDays}승 {lossDays}패
              </p>
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

      <p className="text-xs text-muted-foreground text-right">업데이트: {updatedAt} (모의투자)</p>
      <p className="text-xs text-muted-foreground text-center">본 블로그는 투자 권유용이 아닌 개인 기록용입니다.</p>
    </div>
  );
}
