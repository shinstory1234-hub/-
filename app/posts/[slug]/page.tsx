export const revalidate = 300;
import { notFound } from "next/navigation";
import { getPostBySlug, getPostLikesCount, getPostComments, getPosts } from "@/lib/posts";
import { PostInteractions } from "@/components/post-interactions";
import { PostShareButtons } from "@/components/post-share-buttons";
import { PostViewCounter } from "@/components/post-view-counter";
import { PostSlugLink } from "@/components/post-slug-link";
import { createClient } from "@supabase/supabase-js";

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
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const [all, likes, comments, attachments] = await Promise.all([
    getPosts(),
    getPostLikesCount(post.id),
    getPostComments(post.id),
    getAttachments(post.id),
  ]);

  const index = all.findIndex((item) => item.slug === post.slug);
  const prev = index >= 0 ? all[index + 1] : undefined;
  const next = index > 0 ? all[index - 1] : undefined;

  return (
    <article className="mx-auto max-w-3xl space-y-8 pt-6 md:pt-10">
      {/* 글 헤더 */}
      <header className="space-y-3 pt-0">
        <div className="flex items-center gap-2">
          {post.category && (
            <span className="text-base font-bold text-accent">{post.category.name}</span>
          )}
          {post.tags?.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="text-xs text-muted-foreground">#{tag}</span>
          ))}
        </div>
        <h1 className="text-lg font-bold leading-snug tracking-tight md:text-2xl">{post.title}</h1>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatPostDate(post.published_at ?? "")}</span>
          <PostViewCounter postId={post.id} initialCount={Number(post.view_count ?? 0)} />
        </div>
        <p className="text-sm font-semibold text-red-500">
          본 게시물은 투자 권유용이 아닌 정보 제공 및 작성자 개인 기록용입니다.
        </p>
      </header>

      {/* 본문 */}
      <div className="prose prose-sm max-w-none md:prose-base" dangerouslySetInnerHTML={{ __html: post.content }} />

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
  );
}
