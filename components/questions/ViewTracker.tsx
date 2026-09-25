"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ questionId }: { questionId: string }) {
  const recorded = useRef<string | null>(null);
  useEffect(() => {
    if (recorded.current === questionId) return;
    recorded.current = questionId;
    // Approximate page visits, not unique users. Never mutate during RSC rendering.
    void fetch(`/api/questions/${questionId}/view`, { method: "POST" }).catch(() => {});
  }, [questionId]);
  return null;
}
