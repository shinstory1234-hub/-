// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type TrackInput = { type?: string; postId?: string };

function json(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl) return json({ ok: false, error: "missing env: SUPABASE_URL" });
  if (!serviceRoleKey) return json({ ok: false, error: "missing env: SUPABASE_SERVICE_ROLE_KEY" });

  const body = (await req.json().catch(() => ({}))) as TrackInput;
  const type = String(body.type ?? "").trim();

  if (type !== "post") return json({ ok: false, error: "track-view disabled" });

  try {
    const postId = String(body.postId ?? "").trim();
    if (!postId) return json({ ok: false, error: "postId is required" });

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: rpcData, error: rpcError } = await supabase.rpc("increment_post_view", { p_post_id: postId });
    if (rpcError) return json({ ok: false, error: rpcError.message });

    return json({ ok: true, view_count: Number(rpcData ?? 0) });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "track function failed" });
  }
});
