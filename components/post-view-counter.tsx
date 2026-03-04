"use client";

import { useEffect, useState } from "react";

type Props = { postId: string; initialCount: number };

export function PostViewCounter({ postId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!postId) return;

    console.log("track-post fired", postId);

    const run = async () => {
      const res = await fetch("/api/track-post", {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId })
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; view_count?: number } | null;
      if (res.ok && json?.ok) {
        setCount(Number(json.view_count ?? initialCount));
      }
    };

    run();
  }, [postId]);

  return <p className="text-sm text-muted-foreground">조회수 {count}</p>;
}
