import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: post } = await getSupabase()
    .from("posts")
    .select("title,excerpt,categories!posts_category_id_fkey(name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  const title = post?.title ?? "머니NPC의 액티브 ETF";
  const category = (post as any)?.categories?.name ?? "";
  const excerpt = post?.excerpt ?? "VC심사역 출신의 투자 기록";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f0f13",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* 상단 카테고리 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {category && (
            <div style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 999,
              padding: "6px 16px",
              color: "#818cf8",
              fontSize: 18,
              fontWeight: 600,
            }}>
              {category}
            </div>
          )}
        </div>

        {/* 제목 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{
            fontSize: title.length > 30 ? 52 : 64,
            fontWeight: 700,
            color: "#f8fafc",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}>
            {title}
          </div>
          {excerpt && (
            <div style={{
              fontSize: 24,
              color: "#94a3b8",
              lineHeight: 1.5,
              display: "-webkit-box",
              overflow: "hidden",
            }}>
              {excerpt.slice(0, 80)}{excerpt.length > 80 ? "..." : ""}
            </div>
          )}
        </div>

        {/* 하단 블로그명 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 32,
        }}>
          <div style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 700 }}>
            머니NPC의 액티브 ETF
          </div>
          <div style={{ color: "#64748b", fontSize: 18 }}>
            moneynpc.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
