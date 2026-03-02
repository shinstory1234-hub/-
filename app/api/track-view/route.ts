import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const cookieStore = await cookies();
  const today = new Date().toISOString().slice(0, 10);
  const viewedKey = `viewed_${today}`;

  if (cookieStore.get(viewedKey)?.value === "1") {
    return NextResponse.json({ ok: true, counted: false });
  }

  try {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { error } = await admin.rpc("increment_daily_visits", { target_date: today });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    const res = NextResponse.json({ ok: true, counted: true });
    res.cookies.set(viewedKey, "1", { path: "/", maxAge: 60 * 60 * 24, httpOnly: true, sameSite: "lax" });
    return res;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "track failed" }, { status: 500 });
  }
}
