import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function trackVisit() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false as const, error: "missing SUPABASE_SERVICE_ROLE_KEY" };
  }

  const supabase = createAdminClient();
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: existingRow, error: selectError } = await supabase
    .from("daily_stats")
    .select("visits")
    .eq("day", todayStr)
    .maybeSingle();

  if (selectError) return { ok: false as const, error: selectError.message };

  if (existingRow) {
    const { error: updateError } = await supabase
      .from("daily_stats")
      .update({ visits: Number(existingRow.visits ?? 0) + 1, date: todayStr })
      .eq("day", todayStr);

    if (updateError) return { ok: false as const, error: updateError.message };
  } else {
    const { error: insertError } = await supabase
      .from("daily_stats")
      .insert({ day: todayStr, date: todayStr, visits: 1 });

    if (insertError) return { ok: false as const, error: insertError.message };
  }

  const [{ data: todayRow, error: todayError }, { data: totalRows, error: totalError }] = await Promise.all([
    supabase.from("daily_stats").select("visits").eq("day", todayStr).maybeSingle(),
    supabase.from("daily_stats").select("visits")
  ]);

  if (todayError) return { ok: false as const, error: todayError.message };
  if (totalError) return { ok: false as const, error: totalError.message };

  const total = (totalRows ?? []).reduce((sum, row) => sum + Number(row.visits ?? 0), 0);
  return { ok: true as const, today: Number(todayRow?.visits ?? 0), total };
}

function toErrorResponse(error: string) {
  console.error("track-view error", error);
  return NextResponse.json({ ok: false, error }, { status: 500, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const result = await trackVisit();
  if (!result.ok) return toErrorResponse(result.error);
  return NextResponse.json({ ok: true, today: result.today, total: result.total }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  const result = await trackVisit();
  if (!result.ok) return toErrorResponse(result.error);
  return NextResponse.json({ ok: true, today: result.today, total: result.total }, { headers: { "Cache-Control": "no-store" } });
}
