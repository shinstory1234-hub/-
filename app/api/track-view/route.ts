import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function json(body: Record<string, unknown>) {
  return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
}

async function trackVisit() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("track-view hit", todayStr, hasServiceRole);

  if (!hasUrl) return { ok: false as const, error: "missing env: NEXT_PUBLIC_SUPABASE_URL" };
  if (!hasServiceRole) return { ok: false as const, error: "missing env: SUPABASE_SERVICE_ROLE_KEY" };

  try {
    const supabase = createAdminClient();

    const { data: existingRow, error: selectError } = await supabase
      .from("daily_stats")
      .select("visits")
      .eq("day", todayStr)
      .maybeSingle();

    if (selectError) return { ok: false as const, error: selectError.message };

    if (existingRow) {
      const { error: updateError } = await supabase
        .from("daily_stats")
        .update({ visits: Number(existingRow.visits ?? 0) + 1, day: todayStr, date: todayStr })
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
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "track-view failed" };
  }
}

export async function GET() {
  const result = await trackVisit();
  return result.ok ? json({ ok: true, today: result.today, total: result.total }) : json({ ok: false, error: result.error });
}

export async function POST() {
  const result = await trackVisit();
  return result.ok ? json({ ok: true, today: result.today, total: result.total }) : json({ ok: false, error: result.error });
}
