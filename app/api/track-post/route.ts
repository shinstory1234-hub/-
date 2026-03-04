import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TrackBody = {
  postId?: string;
  slug?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as TrackBody;
  const postId = String(body.postId ?? "").trim();
  const slug = String(body.slug ?? "").trim();

  console.log("track-post hit", postId);

  if (!postId && !slug) {
    return NextResponse.json({ ok: false, error: "postId 또는 slug가 필요합니다." }, { status: 400 });
  }


  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("track-post error", "missing SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      { ok: false, error: "missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();

  let targetPostId = postId;
  if (!targetPostId && slug) {
    const { data: postBySlug, error: findError } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (findError) {
      console.error("track-post error", findError.message);
      return NextResponse.json({ ok: false, error: findError.message }, { status: 500 });
    }
    if (!postBySlug?.id) return NextResponse.json({ ok: false, error: "글을 찾을 수 없습니다." }, { status: 404 });

    targetPostId = String(postBySlug.id);
  }

  const { data: rpcData, error: rpcError } = await supabase
    .rpc("increment_post_view", { p_post_id: targetPostId });

  if (rpcError) {
    console.error("track-post error", rpcError.message);
    return NextResponse.json({ ok: false, error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, view_count: Number(rpcData ?? 0) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
