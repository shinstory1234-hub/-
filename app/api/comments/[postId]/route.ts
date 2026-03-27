import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAnonClient } from "@/lib/supabase-anon";
import { getIP } from "@/lib/get-ip";

const COMMENT_COOLDOWN_MS = 60 * 1000; // 1분

export async function GET(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = createAnonClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id,post_id,author_name,author_email,content,created_at,likes_count")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, comments: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const ip = getIP(req);
  const supabase = createAnonClient();
  const adminSupabase = createAdminClient();

  // rate limit 체크
  const since = new Date(Date.now() - COMMENT_COOLDOWN_MS).toISOString();
  const { data: rateRow } = await adminSupabase
    .from("comment_rate_limits")
    .select("last_at")
    .eq("ip", ip)
    .maybeSingle();

  if (rateRow && rateRow.last_at > since) {
    return NextResponse.json({ ok: false, error: "너무 빠르게 댓글을 작성하고 있습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    authorName?: string;
    password?: string;
    content?: string;
  };

  const authorName = String(body.authorName ?? "").trim();
  const password = String(body.password ?? "").trim();
  const content = String(body.content ?? "").trim();

  if (!authorName || !password || !content) {
    return NextResponse.json({ ok: false, error: "이름, 비밀번호, 댓글 내용을 입력해 주세요." }, { status: 400 });
  }

  const { data: hashData, error: hashError } = await supabase.rpc("hash_password", { plain_password: password });
  if (hashError || !hashData) {
    return NextResponse.json({ ok: false, error: hashError?.message ?? "비밀번호 해시 생성에 실패했습니다." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_name: authorName,
      author_email: null,
      password_hash: String(hashData),
      content
    })
    .select("id,post_id,author_name,author_email,content,created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  await adminSupabase
    .from("comment_rate_limits")
    .upsert({ ip, last_at: new Date().toISOString() }, { onConflict: "ip" });

  return NextResponse.json({ ok: true, comment: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = createAdminClient();
  const body = (await req.json().catch(() => ({}))) as { commentId?: string; password?: string };

  const commentId = String(body.commentId ?? "").trim();
  const password = String(body.password ?? "").trim();

  if (!commentId || !password) {
    return NextResponse.json({ ok: false, error: "commentId와 비밀번호가 필요합니다." }, { status: 400 });
  }

  const { data: target, error: findError } = await supabase
    .from("comments")
    .select("id,password_hash")
    .eq("id", commentId)
    .eq("post_id", postId)
    .maybeSingle();

  if (findError || !target) {
    return NextResponse.json({ ok: false, error: "댓글을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: verified, error: verifyError } = await supabase.rpc("verify_password", {
    plain_password: password,
    hashed_password: target.password_hash
  });

  if (verifyError) {
    return NextResponse.json({ ok: false, error: verifyError.message }, { status: 500 });
  }
  if (!verified) {
    return NextResponse.json({ ok: false, error: "비밀번호가 일치하지 않습니다." }, { status: 401 });
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("post_id", postId);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, commentId });
}
