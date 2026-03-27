import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getIP } from "@/lib/get-ip";

function json(body: Record<string, unknown>) {
  return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
}

const COOLDOWN_MS = 3 * 60 * 1000;

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return json({ ok: false, error: "missing env" });

  const ip = getIP(req);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const { data: recentVisit } = await supabase
    .from("visit_logs")
    .select("id")
    .eq("ip", ip)
    .gte("visited_at", since)
    .maybeSingle();

  const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }).replace(/\. /g, "-").replace(".", "");

  if (!recentVisit) {
    await supabase.from("visit_logs").insert({ ip });

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
