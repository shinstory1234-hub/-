"use client";
import { useEffect, useState } from "react";

export function VisitCounter() {
  const [today, setToday] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/track-visit", {
          method: "POST",
          cache: "no-store",
        });
        const json = await res.json();
        if (json.ok) {
          setToday(json.today);
          setTotal(json.total);
        }
      } catch (e) {
        console.error("visit counter error", e);
      }
    };
    run();
  }, []);

  if (today === null || total === null) return null;

  return (
    <p className="text-sm text-muted-foreground">
      Today {today}, Total {total}
    </p>
  );
}