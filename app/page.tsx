export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { getCategories, getPostsWithError } from "@/lib/posts";
import { PostSlugLink } from "@/components/post-slug-link";
import { VisitCounter } from "@/components/visit-counter";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const COOLDOWN_MS = 3 * 60 * 1000;

async function trackAndGetStats(ip: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const { data: recentVisit } = await supabase
    .from("visit_logs")
    .select("id")
    .eq("ip", ip)
    .gte("visited_at", since)
    .maybeSingle();

  const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }).replace(/\. /g, "-").replace(".", "");

  if (!recentVisit) {
    await supabase.from("visit_logs").insert({ ip });
    const { data, error } = await supabase
      .from("daily_stats").select("visits").eq("day", today).single();
    if (error || !data) {
      await supabase.from("daily_stats").insert({ day: today, date: today, visits: 1 });
    } else {
      await supabase.from("daily_stats").update({ visits: data.visits + 1 }).eq("day", today);
    }
  }

  const { data: allStats } = await supabase.from("daily_stats").select("visits");
  const total = allStats?.reduce((sum, row) => sum + (row.visits ?? 0), 0) ?? 0;
  const { data: todayStats } = await supabase.from("daily_stats").select("visits").eq("day", today).single();
  return { today: todayStats?.visits ?? 0, total };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  const [{ posts, error: postsError }, categories, stats] = await Promise.all([
    getPostsWithError(category),
    getCategories(),
    trackAndGetStats(ip),
  ]);

  return (
    <section className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">VC심사역 출신의 인사이트</h1>
        <VisitCounter today={stats.today} total={stats.total} />
      </header>
      <Tabs
        items={[
          { href: "/", label: "전체", active: !category },
          ...categories.map((cat) => ({ href: `/?category=${cat.slug}`, label: cat.name, active: category === cat.slug }))
        ]}
      />
      {postsError ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-danger">글 목록 조회 실패: {postsError}</CardContent>
        </Card>
      ) : null}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">아직 글이 없습니다. 첫 글을 발행해보세요.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
  <div className="h-44 w-full bg-surface-muted flex items-center justify-center overflow-hidden">
    {post.cover_url
      ? <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${post.cover_url})` }} />
      : <span className="text-4xl font-black text-border">{post.category?.name?.[0] ?? "M"}</span>
    }
  </div>
  <CardHeader className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.category?.name ? <Badge>{post.category.name}</Badge> : <Badge>미분류</Badge>}
                    {post.tags?.slice(0, 2).map((tag, idx) => (
                      <Badge key={`${post.id}-tag-${idx}-${tag}`}>#{tag}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {(() => {
                      if (!post.published_at) return "임시저장";
                      const date = new Date(post.published_at);
                      const now = new Date();
                      const isNew = now.getTime() - date.getTime() < 24 * 60 * 60 * 1000;
                      const formatted = date.toLocaleString("ko-KR", {
                        timeZone: "Asia/Seoul",
                        year: "numeric", month: "2-digit", day: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      });
                      return (
                        <>
                          {isNew && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">NEW</span>}
                          {formatted}
                        </>
                      );
                    })()}
                  </span>
                </div>
                <PostSlugLink slug={post.slug} className="line-clamp-2 text-left text-lg font-semibold leading-7 hover:text-accent">
                  {post.title}
                </PostSlugLink>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt || "요약이 없습니다."}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
