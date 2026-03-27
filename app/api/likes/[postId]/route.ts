import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getIP } from "@/lib/get-ip";

async function getSupabase() {
  return createClient();
}

export async function GET(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const ip = getIP(req);
  const supabase = await getSupabase();

  const { count, error } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const { data, error: likeError } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("ip_address", ip)
    .maybeSingle();

  if (likeError) {
    return NextResponse.json({ ok: false, error: likeError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: Boolean(data?.id) });
}

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const ip = getIP(req);
  const supabase = await getSupabase();

  const { data: existing, error: existingError } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("ip_address", ip)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ ok: false, error: existingError.message }, { status: 500 });
  }

  if (existing?.id) {
    const { count, error } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: true });
  }

  const { error: insertError } = await supabase.from("likes").insert({ post_id: postId, ip_address: ip });

  if (insertError) {
    return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
  }

  const { count, error } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const ip = getIP(req);
  const supabase = await getSupabase();

  const { error: deleteError } = await supabase.from("likes").delete().eq("post_id", postId).eq("ip_address", ip);

  if (deleteError) {
    return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 });
  }

  const { count, error } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: false });
}