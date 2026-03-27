"use client";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
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
  const stockInitial = 500000000;
  const futureInitial = 500000000;
  const stockProfitRate = ((stock_eval_amt + cash_amt - stockInitial) / stockInitial) * 100;
  const futureProfitRate = (((snapshot.future_amt ?? 0) - futureInitial) / futureInitial) * 100;
  const isPlus = profit_loss_rate >= 0;
  const isStockPlus = stockProfitRate >= 0;
  const isFuturePlus = futureProfitRate >= 0;

  // 누적 수익률 차트 데이터
  const lineData = history.map((row) => ({
    date: fmtDate(row.snapshot_at),
    rate: parseFloat(row.profit_loss_rate.toFixed(2)),
  }));

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
  const maxLoss = barData.length > 0 ? Math.min(...barData.map((d) => d.amt)) : 0;

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

      {/* 계좌별 요약 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <p className="text-sm font-semibold border-b border-border pb-2">주식계좌</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">현금</p>
              <p className="flex items-baseline gap-0.5 text-xs font-bold md:text-sm">
                <span>₩</span><span>{fmt(cash_amt - stock_eval_amt)}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">평가금액</p>
              <p className="flex items-baseline gap-0.5 text-xs font-bold md:text-sm">
                <span>₩</span><span>{fmt(stock_eval_amt)}</span>
              </p>
            </div>
            <div className="col-span-2 border-t border-border/40 pt-2 space-y-1 sm:col-span-1 sm:border-t-0 sm:pt-0">
              <p className="text-xs text-muted-foreground">손익률</p>
              <p className={`flex items-baseline gap-0.5 text-xs font-bold md:text-sm ${isStockPlus ? "text-red-500" : "text-blue-500"}`}>
                <span>{isStockPlus ? "+" : ""}{stockProfitRate.toFixed(3)}</span><span>%</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <p className="text-sm font-semibold border-b border-border pb-2">선물계좌</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">평가금액</p>
              <p className="flex items-baseline gap-0.5 text-xs font-bold md:text-sm">
                <span>₩</span><span>{fmt(futureEvalAmt)}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">손익률</p>
              <p className={`flex items-baseline gap-0.5 text-xs font-bold md:text-sm ${isFuturePlus ? "text-red-500" : "text-blue-500"}`}>
                <span>{isFuturePlus ? "+" : ""}{futureProfitRate.toFixed(3)}</span><span>%</span>
              </p>
            </div>
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
              <p className="text-sm font-bold text-blue-500">₩{fmt(maxLoss)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 누적 수익률 라인 차트 */}
      {lineData.length > 1 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold mb-4">누적 수익률</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={48} />
              <Tooltip formatter={(v: number) => [`${v}%`, "수익률"]} labelStyle={{ fontSize: 12 }} />
              <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={profit_loss_rate >= 0 ? "#ef4444" : "#3b82f6"}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 일별 손익 바 차트 */}
      {barData.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold mb-4">일별 손익</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} width={40} />
              <Tooltip formatter={(v: number) => [`₩${fmt(v)}`, "손익"]} labelStyle={{ fontSize: 12 }} />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Bar dataKey="amt" radius={[2, 2, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.amt >= 0 ? "#ef4444" : "#3b82f6"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
