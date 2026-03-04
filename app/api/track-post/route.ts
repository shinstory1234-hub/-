import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { postId?: string } | null;
  const postId = body?.postId;

  if (!postId) {
    return NextResponse.json({ ok: false, error: "post id가 없습니다." }, { status: 400 });
  }

  const supabase = admin();
  const { data: rpcData, error: rpcError } = await supabase
    .rpc("increment_post_views", { target_post_id: postId })
    .maybeSingle();

  if (rpcError) {
    return NextResponse.json({ ok: false, error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, view_count: Number(rpcData ?? 0) });
}
