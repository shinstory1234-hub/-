import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function json(body: Record<string, unknown>) {
  return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
}

// 메모리에 IP별 마지막 방문 시간 저장 (3분 쿨다운)
const ipCache = new Map<string, number>();
const COOLDOWN_MS = 3 * 60 * 1000;

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ ok: false, error: "missing env" });
  }

  // IP 추출
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const now = Date.now();
  const lastVisit = ipCache.get(ip) ?? 0;
  const shouldCount = now - lastVisit > COOLDOWN_MS;

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }).replace(/\. /g, "-").replace(".", "");

  if (shouldCount) {
    ipCache.set(ip, now);
    const { data, error } = await supabase
      .from("daily_stats")
      .select("visits")
      .eq("day", today)
      .single();

    if (error || !data) {
      await supabase.from("daily_stats").insert({ day: today, date: today, visits: 1 });
    } else {
      await supabase.from("daily_stats").update({ visits: data.visits + 1 }).eq("day", today);
    }
  }

  const { data: allStats } = await supabase.from("daily_stats").select("visits");
  const total = allStats?.reduce((sum, row) => sum + (row.visits ?? 0), 0) ?? 0;
  const { data: todayStats } = await supabase.from("daily_stats").select("visits").eq("day", today).single();
  const todayCount = todayStats?.visits ?? 0;

  return json({ ok: true, today: todayCount, total });
}
