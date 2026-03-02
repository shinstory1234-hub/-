import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

async function incrementAndRead() {
  const supabase = admin();
  const today = new Date().toISOString().slice(0, 10);

  const { error: upsertError } = await supabase.from("daily_stats").upsert({ date: today, visits: 0 }, { onConflict: "date" });
  if (upsertError) return { ok: false as const, error: upsertError.message };

  const { error: incError } = await supabase.rpc("increment_daily_visits", { target_date: today });
  if (incError) return { ok: false as const, error: incError.message };

  const [{ data: todayRow, error: todayError }, { data: totalRows, error: totalError }] = await Promise.all([
    supabase.from("daily_stats").select("visits").eq("date", today).maybeSingle(),
    supabase.from("daily_stats").select("visits")
  ]);

  if (todayError) return { ok: false as const, error: todayError.message };
  if (totalError) return { ok: false as const, error: totalError.message };

  const total = (totalRows ?? []).reduce((sum, row) => sum + Number(row.visits ?? 0), 0);
  return { ok: true as const, today: Number(todayRow?.visits ?? 0), total };
}

export async function GET() {
  const result = await incrementAndRead();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, today: result.today, total: result.total }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  const result = await incrementAndRead();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, today: result.today, total: result.total }, { headers: { "Cache-Control": "no-store" } });
}
