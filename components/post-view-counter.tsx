"use client";

import { useEffect, useState } from "react";

type Props = { postId: string; initialCount: number };

export function PostViewCounter({ postId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const run = async () => {
      const res = await fetch(`/api/track-post/${postId}`, { method: "POST" });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; view_count?: number } | null;
      if (res.ok && json?.ok) {
        setCount(Number(json.view_count ?? initialCount));
      }
    };
    run();
  }, [postId, initialCount]);

  return <p className="text-sm text-muted-foreground">조회수 {count}</p>;
}
