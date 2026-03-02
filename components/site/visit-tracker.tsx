"use client";

import { useEffect } from "react";

export function VisitTracker() {
  useEffect(() => {
    fetch("/api/track-view", { method: "POST" }).catch(() => undefined);
  }, []);

  return null;
}
