"use client";
import { useState } from "react";
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

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    ...(sameYear ? {} : { year: "numeric" }),
    month: "long",
    day: "numeric",
  });
}

export function HomeClient({ posts, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? posts.filter((p) => p.category?.slug === activeCategory)
    : posts;

  return (
    <div className="space-y-6">
      {/* 카테고리 필터 */}
      <div className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
            !activeCategory
              ? "bg-foreground text-background scale-105"
              : "text-muted-foreground hover:text-foreground hover:scale-105"
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
              activeCategory === cat.slug
                ? "bg-foreground text-background scale-105"
                : "text-muted-foreground hover:text-foreground hover:scale-105"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 글 목록 */}
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">아직 글이 없습니다.</p>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((post) => (
            <PostSlugLink key={post.id} slug={post.slug} className="block group py-6 first:pt-0">
              <div className="flex items-center gap-1.5 mb-2">
                {post.category && (
                  <span className="text-xs font-semibold text-accent">{post.category.name}</span>
                )}
                {post.category && post.published_at && (
                  <span className="text-xs text-muted-foreground">·</span>
                )}
                {post.published_at && (
                  <span className="text-xs text-muted-foreground">{formatDate(post.published_at)}</span>
                )}
              </div>
              <h2 className="text-lg font-bold text-foreground leading-snug mb-1.5 group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {post.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              )}
            </PostSlugLink>
          ))}
        </div>
      )}
    </div>
  );
}
