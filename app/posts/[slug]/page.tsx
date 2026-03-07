export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPostBySlug, getPostLikesCount, getPostComments, getPosts } from "@/lib/posts";
import { PostInteractions } from "@/components/post-interactions";
import { PostShareButtons } from "@/components/post-share-buttons";
import { PostViewCounter } from "@/components/post-view-counter";
import { PostSlugLink } from "@/components/post-slug-link";
import { createClient } from "@supabase/supabase-js";

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
    <article className="mx-auto max-w-content space-y-6">
      <Card className="p-8 md:p-10">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{post.category?.name ?? "미분류"}</Badge>
            {post.tags?.map((tag, idx) => (
              <Badge key={`${post.id}-tag-${idx}-${tag}`}>#{tag}</Badge>
            ))}
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>
            <div className="pt-1">
              <PostViewCounter postId={post.id} initialCount={Number(post.view_count ?? 0)} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{post.published_at?.slice(0, 10)}</p>
          <p className="text-base font-semibold text-red-500">본 게시물은 투자 권유용이 아닌 정보 제공 및 작성자 개인 기록용입니다.</p>
        </div>

        <div className="prose mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

        {attachments.length > 0 && (
          <div className="mt-8 space-y-2">
            <p className="text-sm font-semibold">첨부파일 ({attachments.length})</p>
            <div className="space-y-1">
              {attachments.map((a) => (
                <a key={a.id} href={a.url} download={a.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-muted transition">
                  {a.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <PostShareButtons />
        <PostInteractions postId={post.id} initialLikes={likes ?? 0} initialComments={comments ?? []} />
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <PostSlugLink slug={prev.slug} className="rounded-lg border border-border bg-surface p-4 text-left text-sm text-muted-foreground hover:text-foreground">
            이전 글<br />
            <span className="font-semibold text-foreground">{prev.title}</span>
          </PostSlugLink>
        ) : <div />}
        {next ? (
          <PostSlugLink slug={next.slug} className="rounded-lg border border-border bg-surface p-4 text-left text-sm text-muted-foreground hover:text-foreground sm:text-right">
            다음 글<br />
            <span className="font-semibold text-foreground">{next.title}</span>
          </PostSlugLink>
        ) : null}
      </div>
    </article>
  );
}
