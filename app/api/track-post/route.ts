import { NextResponse } from "next/server";

type TrackBody = {
  postId?: string;
  slug?: string;
};

function json(body: Record<string, unknown>) {
  return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
}

async function callTrackPost(body?: TrackBody) {
  const postId = String(body?.postId ?? "").trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasServiceRole = Boolean(serviceRoleKey);

  console.log("track-post hit", postId, hasServiceRole);

  if (!supabaseUrl) return { ok: false as const, error: "missing env: NEXT_PUBLIC_SUPABASE_URL" };
  if (!serviceRoleKey) return { ok: false as const, error: "missing env: SUPABASE_SERVICE_ROLE_KEY" };
  if (!postId) return { ok: false as const, error: "postId is required" };

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/track`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ type: "post", postId })
    });

    const payload = (await res.json().catch(() => null)) as { ok?: boolean; view_count?: number; error?: string } | null;
    if (!payload?.ok) return { ok: false as const, error: payload?.error ?? "track function failed" };

    return { ok: true as const, view_count: Number(payload.view_count ?? 0) };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "track-post failed" };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const result = await callTrackPost({ postId: searchParams.get("postId") ?? undefined });
  return result.ok ? json({ ok: true, view_count: result.view_count }) : json({ ok: false, error: result.error });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as TrackBody;
  const result = await callTrackPost(body);
  return result.ok ? json({ ok: true, view_count: result.view_count }) : json({ ok: false, error: result.error });
}
