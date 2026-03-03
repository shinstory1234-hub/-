"use client";

import { useEffect } from "react";

export function VisitStatsTracker() {
  useEffect(() => {
    const run = async () => {
      console.log("track-view fired");
      await fetch("/api/track-view", {
        method: "POST",
        cache: "no-store"
      }).catch(() => undefined);
    };

    run();
  }, []);

  return null;
}
