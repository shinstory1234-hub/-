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
          {filtered.map((post) => (
            <Card key={post.id} className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
              <div className="h-44 w-full overflow-hidden">
                {post.cover_url
                  ? <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${post.cover_url})` }} />
                  : <div className="h-full w-full flex items-center justify-center"
                      style={{ background: `hsl(${(post.title.charCodeAt(0) * 37) % 360}, 60%, 85%)` }}>
                      <span className="text-5xl font-black text-white/60">{post.category?.name?.[0] ?? "M"}</span>
                    </div>
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
    </>
  );
}
