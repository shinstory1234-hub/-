import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ ok: false, error: "파일이 없습니다." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 한글 파일명 처리
  const originalName = file.name;
  const ext = originalName.split(".").pop() ?? "";
const safeName = `${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("attachments")
    .upload(safeName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from("attachments").getPublicUrl(safeName);

  return NextResponse.json({
    ok: true,
    url: data.publicUrl,
    name: originalName,
  });
}
