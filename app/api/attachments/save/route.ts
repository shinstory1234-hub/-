import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { postId, attachments } = await req.json();

  if (!postId || !attachments?.length) {
    return NextResponse.json({ ok: false, error: "데이터가 없습니다." }, { status: 400 });
  }

  const { error } = await supabase.from("attachments").insert(
    attachments.map((a: { name: string; url: string }) => ({
      post_id: postId,
      name: a.name,
      url: a.url,
    }))
  );

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
