import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function readStats() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: todayRow, error: todayError }, { data: totalRows, error: totalError }] = await Promise.all([
    supabase.from("daily_stats").select("visits").eq("day", today).maybeSingle(),
    supabase.from("daily_stats").select("visits")
  ]);

  if (todayError) return { ok: false as const, error: todayError.message };
  if (totalError) return { ok: false as const, error: totalError.message };

  const total = (totalRows ?? []).reduce((sum, row) => sum + Number(row.visits ?? 0), 0);
  return { ok: true as const, today: Number(todayRow?.visits ?? 0), total };
}

async function incrementToday() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error: upsertError } = await supabase
    .from("daily_stats")
    .upsert({ day: today, visits: 1 }, { onConflict: "day" });

  if (upsertError) return { ok: false as const, error: upsertError.message };

  return readStats();
}

export async function POST() {
  console.log("track-view hit");

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("track-view error", "missing SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      { ok: false, error: "missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const result = await incrementToday();
  if (!result.ok) {
    console.error("track-view error", result.error);
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, today: result.today, total: result.total },
    { headers: { "Cache-Control": "no-store" } }
  );
}
