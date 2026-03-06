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

export async function GET(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const ip = getIP(req);
  const supabase = getSupabase();

  const { count } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("ip_address", ip)
    .maybeSingle();

  return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: Boolean(data?.id) });
}

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const ip = getIP(req);
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("ip_address", ip)
    .maybeSingle();

  if (existing?.id) {
    const { count } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);
    return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: true });
  }

  await supabase.from("likes").insert({ post_id: postId, ip_address: ip });

  const { count } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const ip = getIP(req);
  const supabase = getSupabase();

  await supabase.from("likes").delete().eq("post_id", postId).eq("ip_address", ip);

  const { count } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: false });
}