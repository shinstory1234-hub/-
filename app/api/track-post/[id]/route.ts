import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };


export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: "post id가 없습니다." }, { status: 400 });

  const supabase = createAdminClient();
  const { data: rpcData, error: rpcError } = await supabase.rpc("increment_post_views", { target_post_id: id }).maybeSingle();

  if (rpcError) return NextResponse.json({ ok: false, error: rpcError.message }, { status: 500 });

  return NextResponse.json({ ok: true, view_count: Number(rpcData ?? 0) });
}
