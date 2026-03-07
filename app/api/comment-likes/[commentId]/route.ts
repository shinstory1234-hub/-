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
  const ip = getIP(req);
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("ip_address", ip)
    .maybeSingle();

  if (existing?.id) {
    // 이미 좋아요 누름 -> 취소
    await supabase.from("comment_likes").delete().eq("id", existing.id);
    await supabase.rpc("decrement_comment_likes", { comment_id_input: Number(commentId) });
    const { data } = await supabase.from("comments").select("likes_count").eq("id", commentId).single();
    return NextResponse.json({ ok: true, liked: false, likes_count: data?.likes_count ?? 0 });
  }

  // 좋아요 추가
  await supabase.from("comment_likes").insert({ comment_id: Number(commentId), ip_address: ip });
  await supabase.rpc("increment_comment_likes", { comment_id_input: Number(commentId) });
  const { data } = await supabase.from("comments").select("likes_count").eq("id", commentId).single();
  return NextResponse.json({ ok: true, liked: true, likes_count: data?.likes_count ?? 0 });
}
