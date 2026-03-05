"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = { postId?: string | null; initialCount: number };

export function PostViewCounter({ postId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const router = useRouter();

  useEffect(() => {
    if (!postId) return;

    const run = async () => {
      try {
        const res = await fetch("/api/track-post", {
          method: "POST",
          cache: "no-store",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ postId })
        });

        const json = (await res.json().catch(() => null)) as { ok?: boolean; view_count?: number; error?: string } | null;
        if (!res.ok || !json?.ok) {
          console.error("track-post failed", json?.error ?? res.statusText);
          return;
        }

        setCount(Number(json.view_count ?? initialCount));
        router.refresh();
      } catch (error) {
        console.error("track-post fetch failed", error);
      }
    };

    run();
  }, [postId, initialCount, router]);

  return <p className="text-sm text-muted-foreground">조회수 {count}</p>;
}
