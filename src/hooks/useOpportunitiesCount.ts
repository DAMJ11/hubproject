"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface RfqCountResponse {
  success?: boolean;
  total?: number;
}

export function useOpportunitiesCount(enabled: boolean, pollIntervalMs = 10000) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchCount = useCallback(async () => {
    if (!enabled) {
      if (!mountedRef.current) return;
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/rfq?status=open&countOnly=true", { cache: "no-store" });
      const data: RfqCountResponse = await response.json();

      if (!mountedRef.current) return;

      if (!response.ok || data.success === false) {
        setCount(0);
        return;
      }

      setCount(Number(data.total ?? 0));
    } catch {
      if (!mountedRef.current) return;
      setCount(0);
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetchCount();

    const pollId = window.setInterval(fetchCount, pollIntervalMs);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCount();
      }
    };

    window.addEventListener("focus", fetchCount);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mountedRef.current = false;
      window.clearInterval(pollId);
      window.removeEventListener("focus", fetchCount);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchCount, pollIntervalMs]);

  return { opportunitiesCount: count, loading, refreshOpportunitiesCount: fetchCount };
}
