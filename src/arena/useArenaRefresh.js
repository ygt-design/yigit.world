import { useState, useEffect, useRef } from "react";

const THROTTLE_MS = 60 * 1000;

/**
 * Returns a counter that increments (at most once per THROTTLE_MS) when the
 * browser tab regains visibility or the window regains focus.
 *
 * Pages use this as a useEffect dependency: key 0 = initial load (use cache),
 * key > 0 = visibility-triggered reload (pass skipCache: true).
 */
export default function useArenaRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);
  const lastRef = useRef(0);

  useEffect(() => {
    function tryRefresh() {
      const now = Date.now();
      if (now - lastRef.current < THROTTLE_MS) return;
      lastRef.current = now;
      setRefreshKey((k) => k + 1);
    }

    function onVisibility() {
      if (document.visibilityState === "visible") tryRefresh();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tryRefresh);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tryRefresh);
    };
  }, []);

  return refreshKey;
}
