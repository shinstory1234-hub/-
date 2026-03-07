import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function DELETE(req: Request) {
  const supabase = getSupabase();
  const { ids } = await req.json();

  if (!ids || ids.length === 0) {
    return NextResponse.json({ ok: false, error: "삭제할 글이 없습니다." }, { status: 400 });
  }

  const { error } = await supabase.from("posts").delete().in("id", ids);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
