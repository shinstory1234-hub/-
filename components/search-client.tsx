"use client";
import { useState, useEffect, useRef } from "react";
import { PostSlugLink } from "@/components/post-slug-link";
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-accent/20 text-accent rounded px-0.5">{part}</mark>
      : part
  );
}

export function SearchClient({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? posts.filter((p) => {
        const text = [
          p.title,
          p.excerpt ?? "",
          ...(p.tags ?? []),
          p.category?.name ?? "",
        ].join(" ").toLowerCase();
        return text.includes(q);
      })
    : [];

  return (
    <div className="space-y-5">
      {/* 검색 인풋 */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목, 태그, 카테고리로 검색..."
          className="w-full h-12 rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* 결과 */}
      {!q ? (
        <p className="py-16 text-center text-sm text-muted-foreground">검색어를 입력하세요</p>
      ) : results.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">"{query}"</span>에 대한 결과가 없습니다
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{results.length}개</span>의 결과
          </p>
          <div className="divide-y divide-border">
            {results.map((post) => (
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
                <h2 className="text-base font-bold text-foreground leading-snug mb-1.5 group-hover:text-accent transition-colors md:text-lg">
                  {highlight(post.title, query)}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {highlight(post.excerpt, query)}
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
        </>
      )}
    </div>
  );
}
