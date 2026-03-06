import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type TrackBody = {
  postId?: string;
};

function json(body: Record<string, unknown>) {
  return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as TrackBody;
  const postId = String(body?.postId ?? "").trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return json({ ok: false, error: "missing env" });
  if (!postId) return json({ ok: false, error: "postId is required" });

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("posts")
    .select("view_count")
    .eq("id", postId)
    .single();

  if (error || !data) return json({ ok: false, error: "post not found" });

  const newCount = (data.view_count ?? 0) + 1;

  await supabase
    .from("posts")
    .update({ view_count: newCount })
    .eq("id", postId);

  return json({ ok: true, view_count: newCount });
}