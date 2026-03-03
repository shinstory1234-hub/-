import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = await createClient();

  const [{ count, error: countError }, userRes] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", postId),
    supabase.auth.getUser()
  ]);

  if (countError) {
    return NextResponse.json({ ok: false, error: countError.message }, { status: 400 });
  }

  let likedByMe = false;
  if (userRes.data.user?.id) {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userRes.data.user.id)
      .maybeSingle();
    likedByMe = Boolean(data?.id);
  }

  return NextResponse.json({ ok: true, count: count ?? 0, likedByMe });
}

export async function POST(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  if (error && error.code !== "23505") {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  const { count } = await supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", postId);
  return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  const { count } = await supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", postId);
  return NextResponse.json({ ok: true, count: count ?? 0, likedByMe: false });
}
