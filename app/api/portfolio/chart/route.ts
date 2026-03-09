import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("snapshot_at, total_eval_amt, profit_loss_rate")
    .order("snapshot_at", { ascending: true })
    .limit(168);

  if (error) return NextResponse.json({ ok: false, error: error.message });
  return NextResponse.json({ ok: true, data });
}
