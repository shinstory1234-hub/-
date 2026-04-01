import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    // fchart API: returns up to `count` daily candles going back from today
    const res = await fetch(
      "https://fchart.stock.naver.com/sise.nhn?symbol=KOSPI&timeframe=day&count=500&requestType=0",
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("fetch failed");

    const text = await res.text();
    // Each item: data="YYYYMMDD|open|high|low|close|volume"
    const items = [...text.matchAll(/data="(\d{8})\|[^|]*\|[^|]*\|[^|]*\|([^|"]+)\|/g)];
    const points = items
      .map((m) => ({
        date: `${m[1].slice(0, 4)}-${m[1].slice(4, 6)}-${m[1].slice(6, 8)}`,
        close: parseFloat(m[2].replace(/,/g, "")),
      }))
      .filter((d) => !isNaN(d.close));

    return NextResponse.json(points, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
