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

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data } = await admin.from("daily_stats").select("date,visits").eq("date", today).maybeSingle();
  if (!data) {
    await admin.from("daily_stats").insert({ date: today, visits: 1 });
  } else {
    await admin.from("daily_stats").update({ visits: (data.visits ?? 0) + 1 }).eq("date", today);
  }

  const res = NextResponse.json({ ok: true, counted: true });
  res.cookies.set(viewedKey, "1", { path: "/", maxAge: 60 * 60 * 24, httpOnly: true, sameSite: "lax" });
  return res;
}
