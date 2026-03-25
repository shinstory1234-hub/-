"use client";
import { useState } from "react";
import { PostSlugLink } from "@/components/post-slug-link";
import { Category } from "@/lib/types";
import { getReadingTime } from "@/lib/reading-time";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
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
  return date.toLocaleString("ko-KR", {
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
    <div className="space-y-5">
      {/* 카테고리 필터 */}
      <div className="category-filter flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
            !activeCategory
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground bg-surface-muted hover:bg-surface border border-border"
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              activeCategory === cat.slug
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-surface-muted hover:bg-surface border border-border"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 글 목록 */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">아직 글이 없습니다.</p>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((post) => (
            <PostSlugLink key={post.id} slug={post.slug} className="block group py-5 first:pt-0">
              <div className="flex items-center gap-2 mb-1.5">
                {post.category && (
                  <span className="inline-flex items-center rounded-full bg-accent-soft border border-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                    {post.category.name}
                  </span>
                )}
                {post.published_at && (
                  <span className="text-xs text-muted-foreground">{formatDate(post.published_at)}</span>
                )}
                {post.content && (
                  <span className="text-xs text-muted-foreground/60">{getReadingTime(post.content)}분 읽기</span>
                )}
              </div>
              <h2 className="text-base font-bold text-foreground leading-snug mb-1.5 group-hover:text-accent transition-colors duration-150 md:text-lg">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {post.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs text-muted-foreground/70">#{tag}</span>
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
