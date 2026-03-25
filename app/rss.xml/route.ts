export const revalidate = 3600;

import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://moneynpc.vercel.app";
const SITE_TITLE = "머니NPC의 액티브 ETF";
const SITE_DESC = "VC심사역 출신의 투자 기록";

function escape(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: posts } = await supabase
    .from("posts")
    .select("title,slug,excerpt,published_at,categories!posts_category_id_fkey(name)")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(50);

  const items = (posts ?? []).map((p: any) => {
    const url = `${SITE_URL}/posts/${p.slug}`;
    const date = p.published_at ? new Date(p.published_at).toUTCString() : "";
    const category = p.categories?.name ?? "";
    const desc = p.excerpt ? escape(p.excerpt) : "";
    return `
    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${date ? `<pubDate>${date}</pubDate>` : ""}
      ${category ? `<category>${escape(category)}</category>` : ""}
      ${desc ? `<description>${desc}</description>` : ""}
    </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESC}</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
