"use client";

import { useEffect } from "react";

export function VisitStatsTracker() {
  useEffect(() => {
    const run = async () => {
      console.log("track-view fired");
      try {
        await fetch("/api/track-view", {
          method: "POST",
          cache: "no-store"
        });
      } catch (error) {
        console.error("track-view fetch failed", error);
      }
    };

    run();
  }, []);

  return null;
}
