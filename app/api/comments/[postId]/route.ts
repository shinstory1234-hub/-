import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id,post_id,user_id,author_email,content,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, comments: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { content?: string };
  const content = String(body.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ ok: false, error: "댓글 내용을 입력해 주세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, author_email: user.email ?? null, content })
    .select("id,post_id,user_id,author_email,content,created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, comment: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  }

  const url = new URL(req.url);
  const commentId = url.searchParams.get("commentId")?.trim();
  if (!commentId) {
    return NextResponse.json({ ok: false, error: "commentId가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("post_id", postId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, commentId });
}
