"use client";
import { useEffect, useState, useRef } from "react";

type Props = { postId?: string | null; initialCount: number };

export function PostViewCounter({ postId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const tracked = useRef(false);

  useEffect(() => {
    if (!postId || tracked.current) return;
    tracked.current = true;

    const run = async () => {
      try {
        const res = await fetch("/api/track-post", {
          method: "POST",
          cache: "no-store",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ postId })
        });
        const json = await res.json().catch(() => null);
        if (json?.ok) setCount(Number(json.view_count ?? initialCount));
      } catch (error) {
        console.error("track-post fetch failed", error);
      }
    };
    run();
  }, [postId, initialCount]);

  return <p className="text-sm text-muted-foreground">조회수 {count}</p>;
}