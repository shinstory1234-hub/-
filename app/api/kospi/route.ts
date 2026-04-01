import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 2);
    const fmt = (d: Date) => d.toISOString().replace(/[-T:]/g, "").slice(0, 14);

    const res = await fetch(
      `https://m.stock.naver.com/api/index/KOSPI/price?startDateTime=${fmt(start)}&endDateTime=${fmt(end)}&timeframe=day`,
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("fetch failed");

    const json = await res.json();
    const points = (json as any[])
      .map((d) => ({ date: d.localTradedAt, close: parseFloat(d.closePrice.replace(/,/g, "")) }))
      .filter((d) => !isNaN(d.close))
      .reverse();

    return NextResponse.json(points, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
