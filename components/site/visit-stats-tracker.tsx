"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function VisitStatsTracker() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/track-view", {
          method: "POST",
          cache: "no-store"
        });
        const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (!res.ok || !json?.ok) {
          console.error("track-view failed", json?.error ?? res.statusText);
          return;
        }
        router.refresh();
      } catch (error) {
        console.error("track-view fetch failed", error);
      }
    };

    run();
  }, [router]);

  return null;
}
