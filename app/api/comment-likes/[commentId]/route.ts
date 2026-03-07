import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request, { params }: { params: Promise<{ commentId: string }> }) {
  const { commentId } = await params;
  const commentIdNum = Number(commentId);
  const ip = getIP(req);
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentIdNum)
    .eq("ip_address", ip)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("comment_likes").delete().eq("id", existing.id);
    const { count } = await supabase
      .from("comment_likes")
      .select("id", { count: "exact", head: true })
      .eq("comment_id", commentIdNum);
    await supabase.from("comments").update({ likes_count: count ?? 0 }).eq("id", commentIdNum);
    return NextResponse.json({ ok: true, liked: false, likes_count: count ?? 0 });
  }

  await supabase.from("comment_likes").insert({ comment_id: commentIdNum, ip_address: ip });
  const { count } = await supabase
    .from("comment_likes")
    .select("id", { count: "exact", head: true })
    .eq("comment_id", commentIdNum);
  await supabase.from("comments").update({ likes_count: count ?? 0 }).eq("id", commentIdNum);
  return NextResponse.json({ ok: true, liked: true, likes_count: count ?? 0 });
}
