export const revalidate = 3600;
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { getPostBySlug } from "@/lib/posts";
import { PostInteractions } from "@/components/post-interactions";
import { PostShareButtons } from "@/components/post-share-buttons";
import { PostViewCounter } from "@/components/post-view-counter";
import { PostSlugLink } from "@/components/post-slug-link";
import { createClient } from "@supabase/supabase-js";
import { getReadingTime } from "@/lib/reading-time";
import { PostTOC } from "@/components/post-toc";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getLikesCount(postId: string) {
  const { count } = await getSupabase()
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);
  return count ?? 0;
}

async function getComments(postId: string) {
  const { data } = await getSupabase()
    .from("comments")
    .select("id,post_id,author_name,author_email,content,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// 빌드 시 모든 포스트 페이지 정적 생성
export async function generateStaticParams() {
  const { data } = await getSupabase()
    .from("posts")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

// 이전/다음/관련 글용 경량 조회 (content 제외)
async function getPostNav() {
  const { data } = await getSupabase()
    .from("posts")
    .select("id,title,slug,published_at,post_categories(categories(name,slug))")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map((row: any) => ({
    ...row,
    categories: (row.post_categories ?? []).map((pc: any) => pc.categories).filter(Boolean),
  }));
}

function formatPostDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Attachment = { id: string; name: string; url: string };

async function getAttachments(postId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("attachments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Attachment[];
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // service role key로 직접 조회 (쿠키 기반 X → ISR 캐싱 정상 작동)
  const { data: postRaw } = await getSupabase()
    .from("posts")
    .select("id,title,slug,excerpt,content,tags,is_published,published_at,view_count,post_categories(categories(name,slug))")
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();

  const post = postRaw
    ? {
        ...postRaw,
        categories: (postRaw as any).post_categories?.map((pc: any) => pc.categories).filter(Boolean) ?? [],
        category: (postRaw as any).post_categories?.[0]?.categories ?? null,
        view_count: Number((postRaw as any).view_count ?? 0),
      }
    : await getPostBySlug(slug); // fallback

  if (!post) return notFound();

  const [all, likes, comments, attachments] = await Promise.all([
    getPostNav(),
    getLikesCount(post.id),
    getComments(post.id),
    getAttachments(post.id),
  ]);

  const index = all.findIndex((item) => item.slug === post.slug);
  const prev = index >= 0 ? all[index + 1] : undefined;
  const next = index > 0 ? all[index - 1] : undefined;

  return (
    <div className="mx-auto max-w-3xl px-6 md:px-5 pt-6 md:pt-10">
    <PostTOC />
    <article className="space-y-8">
      {/* 글 헤더 */}
      <header className="space-y-3 pt-0">
        <div className="flex items-center gap-2 flex-wrap">
          {((post as any).categories ?? []).map((cat: any) => (
            <span key={cat.slug} className="text-base font-bold text-accent">{cat.name}</span>
          ))}
          {(post.tags as string[] | null)?.slice(0, 2).map((tag: string, idx: number) => (
            <span key={idx} className="text-xs text-muted-foreground">#{tag}</span>
          ))}
        </div>
        <h1 className="text-base font-bold leading-snug tracking-tight md:text-2xl">{post.title}</h1>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{formatPostDate(post.published_at ?? "")}</span>
            {post.content && (
              <span>· {getReadingTime(post.content)}분 읽기</span>
            )}
          </div>
          <PostViewCounter postId={post.id} initialCount={Number(post.view_count ?? 0)} />
        </div>
        <p className="text-sm font-semibold text-red-500">
          본 게시물은 투자 권유용이 아닌 정보 제공 및 작성자 개인 기록용입니다.
        </p>
      </header>

      {/* 본문 */}
      <div className="prose prose-sm max-w-none leading-relaxed md:prose-base md:leading-normal" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />

      {/* 첨부파일 */}
      {attachments.length > 0 && (
        <div className="space-y-2 border-t border-border pt-6">
          <p className="text-sm font-semibold">첨부파일 ({attachments.length})</p>
          <div className="space-y-1">
            {attachments.map((a) => (
              <a
                key={a.id}
                href={a.url}
                download={a.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                📎 {a.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 공유 + 좋아요/댓글 */}
      <div className="border-t border-border pt-6 space-y-6">
        <PostShareButtons />
        <PostInteractions postId={post.id} initialLikes={likes ?? 0} initialComments={comments ?? []} />
      </div>

      {/* 관련 글 */}
      {(() => {
        const postCategorySlugs = new Set(((post as any).categories ?? []).map((c: any) => c.slug));
        const related = all
          .filter((p) => p.slug !== post.slug && (p as any).categories?.some((c: any) => postCategorySlugs.has(c.slug)))
          .slice(0, 3);
        if (related.length === 0) return null;
        return (
          <div className="border-t border-border pt-6 space-y-3">
            <p className="text-sm font-semibold text-foreground">관련 글</p>
            <div className="space-y-2">
              {related.map((p) => (
                <PostSlugLink key={p.id} slug={p.slug}
                  className="group flex items-center gap-3 rounded-lg border border-border px-4 py-3 hover:border-accent/30 hover:bg-accent-soft transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {p.title}
                    </p>
                    {p.published_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(p.published_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted-foreground group-hover:text-accent transition-colors">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </PostSlugLink>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 이전/다음 글 */}
      <div className="grid gap-2 sm:grid-cols-2 border-t border-border pt-6">
        {prev ? (
          <PostSlugLink slug={prev.slug} className="group flex flex-col gap-1 rounded-xl border border-border p-4 hover:border-foreground/20 transition-colors">
            <span className="text-xs text-muted-foreground">이전 글</span>
            <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">{prev.title}</span>
          </PostSlugLink>
        ) : <div />}
        {next ? (
          <PostSlugLink slug={next.slug} className="group flex flex-col gap-1 rounded-xl border border-border p-4 hover:border-foreground/20 transition-colors sm:items-end sm:text-right">
            <span className="text-xs text-muted-foreground">다음 글</span>
            <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">{next.title}</span>
          </PostSlugLink>
        ) : null}
      </div>
    </article>
    </div>
  );
}
