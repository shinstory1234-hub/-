import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TrackBody = {
  postId?: string;
  slug?: string;
};

function json(body: Record<string, unknown>) {
  return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
}

async function trackPost(body?: TrackBody) {
  const postId = String(body?.postId ?? "").trim();
  const slug = String(body?.slug ?? "").trim();
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  console.log("track-post hit", postId, hasServiceRole);

  if (!hasUrl) return { ok: false as const, error: "missing env: NEXT_PUBLIC_SUPABASE_URL" };
  if (!hasServiceRole) return { ok: false as const, error: "missing env: SUPABASE_SERVICE_ROLE_KEY" };
  if (!postId && !slug) return { ok: false as const, error: "postId 또는 slug가 필요합니다." };

  try {
    const supabase = createAdminClient();

    let targetPostId = postId;
    if (!targetPostId && slug) {
      const { data: postBySlug, error: findError } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (findError) return { ok: false as const, error: findError.message };
      if (!postBySlug?.id) return { ok: false as const, error: "글을 찾을 수 없습니다." };
      targetPostId = String(postBySlug.id);
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc("increment_post_view", { p_post_id: targetPostId });
    if (rpcError) return { ok: false as const, error: rpcError.message };

    return { ok: true as const, view_count: Number(rpcData ?? 0) };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "track-post failed" };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const result = await trackPost({ postId: searchParams.get("postId") ?? undefined, slug: searchParams.get("slug") ?? undefined });
  return result.ok ? json({ ok: true, view_count: result.view_count }) : json({ ok: false, error: result.error });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as TrackBody;
  const result = await trackPost(body);
  return result.ok ? json({ ok: true, view_count: result.view_count }) : json({ ok: false, error: result.error });
}
