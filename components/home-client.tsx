"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PostSlugLink } from "@/components/post-slug-link";
import { Category } from "@/lib/types";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_url?: string | null;
  published_at?: string | null;
  category?: { name: string; slug: string } | null;
  tags?: string[] | null;
};

type Props = {
  posts: Post[];
  categories: Category[];
};

export function HomeClient({ posts, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? posts.filter((p) => p.category?.slug === activeCategory)
    : posts;

  return (
    <>
      <div className="inline-flex rounded-full border border-border bg-surface-muted p-1">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${!activeCategory ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeCategory === cat.slug ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface py-14 text-center text-sm text-muted-foreground">
          아직 글이 없습니다. 첫 글을 발행해보세요.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => {
            const isNew = post.published_at
              ? new Date().getTime() - new Date(post.published_at).getTime() < 24 * 60 * 60 * 1000
              : false;
            const formatted = post.published_at
              ? new Date(post.published_at).toLocaleString("ko-KR", {
                  timeZone: "Asia/Seoul",
                  year: "numeric", month: "2-digit", day: "2-digit",
                  hour: "2-digit", minute: "2-digit",
                })
              : "임시저장";

            return (
              <PostSlugLink key={post.id} slug={post.slug} className="block group">
                <Card className="overflow-hidden h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                  <div className="aspect-square w-full overflow-hidden border-b border-border">
                    {post.cover_url
                      ? <div className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url(${post.cover_url})` }} />
                      : <div className="h-full w-full flex flex-col items-center justify-center bg-surface-muted">
                          <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">{post.category?.name ?? "UNCATEGORIZED"}</span>
                        </div>
                    }
                  </div>
                  <CardHeader className="space-y-2 pt-4 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className="text-xs">{post.category?.name ?? "미분류"}</Badge>
                        {post.tags?.slice(0, 1).map((tag, i) => (
                          <Badge key={i} className="text-xs">#{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isNew && (
                          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">NEW</span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatted}</span>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-base font-semibold leading-snug text-foreground group-hover:text-accent transition-colors">
                      {post.title}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{post.excerpt || "요약이 없습니다."}</p>
                  </CardContent>
                </Card>
              </PostSlugLink>
            );
          })}
        </div>
      )}
    </>
  );
}
