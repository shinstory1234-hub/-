import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Params = { params: Promise<{ id: string }> };

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: "post id가 없습니다." }, { status: 400 });

  const supabase = admin();
  const { data: rpcData, error: rpcError } = await supabase.rpc("increment_post_views", { target_post_id: id }).maybeSingle();

  if (rpcError) return NextResponse.json({ ok: false, error: rpcError.message }, { status: 500 });

  return NextResponse.json({ ok: true, view_count: Number(rpcData ?? 0) });
}
