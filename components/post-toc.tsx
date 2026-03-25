"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level: number };

export function PostTOC({ contentSelector = ".prose" }: { contentSelector?: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    // 헤딩 요소 찾기 + ID 부여
    const els = Array.from(container.querySelectorAll("h1, h2, h3")) as HTMLElement[];
    if (els.length === 0) return;

    const parsed: Heading[] = els.map((el, i) => {
      const id = el.id || `toc-heading-${i}`;
      el.id = id;
      return {
        id,
        text: el.textContent ?? "",
        level: parseInt(el.tagName[1]),
      };
    });
    setHeadings(parsed);

    // IntersectionObserver로 현재 섹션 추적
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    els.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [contentSelector]);

  if (headings.length < 2) return null;

  return (
    <nav className="hidden xl:block sticky top-24 w-52 shrink-0 self-start text-xs space-y-1">
      <p className="text-xs font-semibold text-foreground mb-2">목차</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={cn(
            "block truncate leading-5 transition-colors py-0.5",
            h.level === 1 ? "pl-0" : h.level === 2 ? "pl-3" : "pl-5",
            activeId === h.id
              ? "text-accent font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}
