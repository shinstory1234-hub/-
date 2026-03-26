import { NextResponse } from "next/server";

export const revalidate = 3600; // 1시간 캐시

export async function GET() {
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EKS11?interval=1d&range=2y",
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error("fetch failed");

    const json = await res.json();
    const result = json.chart?.result?.[0];
    if (!result) throw new Error("no data");

    const timestamps: number[] = result.timestamp;
    const closes: number[] = result.indicators.quote[0].close;

    const points = timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        close: closes[i],
      }))
      .filter((d) => d.close != null);

    return NextResponse.json(points, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    // 실패 시 빈 배열 반환 → 차트에 코스피 라인만 미표시
    return NextResponse.json([]);
  }
}
