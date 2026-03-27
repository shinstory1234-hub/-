import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getIP } from "@/lib/get-ip";

type TrackBody = {
  postId?: string;
};

function json(body: Record<string, unknown>) {
  return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
}

const COOLDOWN_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as TrackBody;
  const postId = String(body?.postId ?? "").trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return json({ ok: false, error: "missing env" });
  if (!postId) return json({ ok: false, error: "postId is required" });

  const ip = getIP(req);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 동일 IP가 쿨다운 내에 이미 조회한 경우 카운트 증가 없이 현재 수 반환
  const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const { data: recentView } = await supabase
    .from("post_view_logs")
    .select("id")
    .eq("post_id", postId)
    .eq("ip", ip)
    .gte("viewed_at", since)
    .maybeSingle();

  const { data, error } = await supabase
    .from("posts")
    .select("view_count")
    .eq("id", postId)
    .single();

  if (error || !data) return json({ ok: false, error: "post not found" });

  if (recentView) {
    return json({ ok: true, view_count: data.view_count ?? 0 });
  }

  await supabase.from("post_view_logs").insert({ post_id: postId, ip });

  const newCount = (data.view_count ?? 0) + 1;
  await supabase.from("posts").update({ view_count: newCount }).eq("id", postId);

  return json({ ok: true, view_count: newCount });
}